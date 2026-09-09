#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_CSV = resolve(ROOT, 'data/survey/za_survey_responses.csv');
const DEFAULT_CONFIG = resolve(ROOT, 'src/survey-data.js');

// The single source of truth for what the Survey App can legitimately return.
// The charts, the tests and this script all read the same lists, so a category
// cannot be valid in one place and silently dropped in another.
export const SURVEY_SCHEMA = {
  // Present as a column, but the value is never read or published.
  headerOnly: ['id', 'user_agent'],

  categorical: {
    age_range: ['18-21', '22-25', '26-30', '31+'],
    status: ['Student', 'Studying and working', 'Employed', 'Unemployed'],
    main_pressure: ['Food', 'Transport', 'Rent', 'Data', 'Tuition', 'Debt', 'Electricity'],
    cost_increased: ['Yes', 'No', 'Not sure'],
    transport_cost: ['R0-R300', 'R301-R600', 'R601-R1000', 'R1001-R1500', 'R1500+'],
    // R0-R500 has no respondents in the current export but is a real survey
    // option, so it stays valid and the charts keep an empty row for it.
    food_cost: ['R0-R500', 'R501-R1000', 'R1001-R2000', 'R2001-R3000', 'R3000+']
  },

  // Inclusive integer ranges.
  numeric: {
    work_worry_rating: { min: 1, max: 5 },
    income_keeps_up_rating: { min: 1, max: 5 }
  },

  // Optional multi-select. An empty selection is a real answer.
  multiSelect: {
    cut_back_on: ['Meat', 'Eating out', 'Data', 'Transport',
                  'Subscriptions', 'Social life', 'Clothing', 'Electricity']
  },

  timestampPattern: /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/
};

export const REQUIRED_COLUMNS = [
  ...SURVEY_SCHEMA.headerOnly,
  'timestamp',
  ...Object.keys(SURVEY_SCHEMA.categorical),
  ...Object.keys(SURVEY_SCHEMA.numeric),
  ...Object.keys(SURVEY_SCHEMA.multiSelect)
];

export const PUBLIC_COLUMNS = [
  'age', 'status', 'pressure', 'cost_increased', 'work_worry',
  'income_keeps_up', 'transport_cost', 'food_cost', 'cut_back_on'
];

// Raw export column -> published column.
const COLUMN_ALIASES = {
  age_range: 'age',
  main_pressure: 'pressure',
  work_worry_rating: 'work_worry',
  income_keeps_up_rating: 'income_keeps_up'
};

const publicName = (column) => COLUMN_ALIASES[column] ?? column;

// Splits CSV text into rows
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }

  return rows;
}

class SurveyValidationError extends Error {
  constructor(issue) {
    super(describeIssue(issue));
    this.name = 'SurveyValidationError';
    this.issue = issue;
  }
}

function describeIssue({ rowNumber, field, value, kind }) {
  const shown = value === '' ? '(blank)' : `"${value}"`;
  switch (kind) {
    case 'missing-required-value':
      return `Missing required value for ${field} in row ${rowNumber}`;
    case 'invalid-category':
      return `Invalid ${field} category ${shown} in row ${rowNumber}`;
    case 'invalid-number':
      return `Invalid number for ${field} ${shown} in row ${rowNumber}`;
    case 'out-of-range':
      return `Out-of-range value for ${field} ${shown} in row ${rowNumber}`;
    case 'invalid-cut-back-on':
      return `Invalid cut_back_on JSON in row ${rowNumber}`;
    case 'unknown-cutback-token':
      return `Unknown cut_back_on option ${shown} in row ${rowNumber}`;
    case 'invalid-timestamp':
      return `Unrecognised timestamp ${shown} in row ${rowNumber}`;
    default:
      return `Problem with ${field} in row ${rowNumber}`;
  }
}

// Validates one raw record. Returns the published row, or null when the record
// must be excluded. Fatal problems are pushed to `issues` and, in strict mode,
// thrown by the caller. Non-fatal ones are recorded without losing the record.
function validateRecord(source, rowNumber, issues) {
  const fatal = [];
  const record = {};

  for (const [column, allowed] of Object.entries(SURVEY_SCHEMA.categorical)) {
    const value = source[column];
    if (value === '') {
      fatal.push({ rowNumber, field: column, value, kind: 'missing-required-value' });
    } else if (!allowed.includes(value)) {
      fatal.push({ rowNumber, field: column, value, kind: 'invalid-category' });
    }
    record[publicName(column)] = value;
  }

  for (const [column, bounds] of Object.entries(SURVEY_SCHEMA.numeric)) {
    const value = source[column];
    if (value === '') {
      fatal.push({ rowNumber, field: column, value, kind: 'missing-required-value' });
    } else if (!/^-?\d+$/.test(value.trim())) {
      // Rejected before Number() so that "3abc", "" and "NaN" cannot become a
      // plausible-looking rating downstream.
      fatal.push({ rowNumber, field: column, value, kind: 'invalid-number' });
    } else {
      const parsed = Number(value.trim());
      if (parsed < bounds.min || parsed > bounds.max) {
        fatal.push({ rowNumber, field: column, value, kind: 'out-of-range' });
      }
    }
    record[publicName(column)] = value;
  }

  for (const [column, allowed] of Object.entries(SURVEY_SCHEMA.multiSelect)) {
    const raw = source[column].trim();
    let chosen = [];

    if (raw === '') {
      // An empty multi-select is a real answer, not a malformed one.
      chosen = [];
    } else {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        fatal.push({ rowNumber, field: column, value: raw, kind: 'invalid-cut-back-on' });
        parsed = null;
      }

      if (parsed !== null && !Array.isArray(parsed)) {
        fatal.push({ rowNumber, field: column, value: raw, kind: 'invalid-cut-back-on' });
      } else if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          const option = String(entry).trim();
          if (allowed.includes(option)) {
            chosen.push(option);
          } else {
            // Dropped, but reported: an unrecognised option must not quietly
            // become part of an aggregate, and must not discard the whole record.
            issues.push({ rowNumber, field: column, value: option, kind: 'unknown-cutback-token' });
          }
        }
      }
    }

    record[publicName(column)] = chosen.join('; ');
  }

  const timestamp = source.timestamp.trim();
  const timestampValid = SURVEY_SCHEMA.timestampPattern.test(timestamp);
  if (!timestampValid) {
    issues.push({ rowNumber, field: 'timestamp', value: timestamp, kind: 'invalid-timestamp' });
  }

  issues.push(...fatal);

  if (fatal.length > 0) {
    return { row: null, fatal, timestamp: null };
  }

  return { row: record, fatal, timestamp: timestampValid ? timestamp : null };
}

// Cleans survey rows for charts.
// options.mode: 'strict' (default) throws on the first invalid required value;
// 'quarantine' excludes the record and records why.
export function prepareRows(text, options = {}) {
  const mode = options.mode ?? 'strict';
  const parsed = parseCsv(text);
  const headers = parsed.shift() || [];

  for (const header of REQUIRED_COLUMNS) {
    if (!headers.includes(header)) throw new Error(`Missing survey column: ${header}`);
  }

  const issues = [];
  const rows = [];
  let excludedRows = 0;
  let latestTimestamp = '';
  let inputRows = 0;

  parsed.forEach((values, index) => {
    if (!values.some(Boolean)) return;
    inputRows += 1;

    // Header row is line 1, so a data row's line number is its index plus two.
    const rowNumber = index + 2;
    const source = Object.fromEntries(
      headers.map((header, column) => [header, values[column] ?? ''])
    );

    const result = validateRecord(source, rowNumber, issues);

    if (result.fatal.length > 0) {
      if (mode === 'strict') throw new SurveyValidationError(result.fatal[0]);
      excludedRows += 1;
      return;
    }

    rows.push(result.row);
    if (result.timestamp && result.timestamp > latestTimestamp) {
      latestTimestamp = result.timestamp;
    }
  });

  return {
    rows,
    issues,
    metadata: {
      totalRows: rows.length,
      inputRows,
      excludedRows,
      latestTimestamp: latestTimestamp || null
    }
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Creates the safe survey CSV
export function makeCsv(rows) {
  return [
    PUBLIC_COLUMNS.join(','),
    ...rows.map((row) => PUBLIC_COLUMNS.map((column) => csvCell(row[column])).join(','))
  ].join('\n') + '\n';
}

// Creates survey chart settings
export function makeConfig(metadata) {
  const total = Number.isFinite(metadata.totalRows) ? metadata.totalRows : 0;
  const excluded = Number.isFinite(metadata.excludedRows) ? metadata.excludedRows : 0;
  const exclusionNote = excluded > 0
    ? ` ${excluded} row${excluded === 1 ? '' : 's'} excluded by validation.`
    : '';

  return `var SurveyData = ${JSON.stringify({
    path: 'data/survey/za_survey_responses.csv',
    totalRows: total,
    excludedRows: excluded,
    latestTimestamp: metadata.latestTimestamp ?? null,
    chartLabel: `n=${total}`,
    note: `${total} Survey App rows: Real survey data.${exclusionNote}`,
    source: 'Project Survey App export: Real survey data.'
  }, null, 2)};\n`;
}

// Groups issues by kind for a readable run summary.
export function summariseIssues(issues) {
  const counts = {};
  for (const issue of issues) {
    counts[issue.kind] = (counts[issue.kind] ?? 0) + 1;
  }
  return counts;
}

function flagValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const input = flagValue('--input');
  if (!input) throw new Error('Usage: npm run data:survey -- --input /path/to/survey_responses.csv [--output file.csv] [--config file.js] [--lenient]');

  const output = flagValue('--output') ?? DEFAULT_CSV;
  const config = flagValue('--config') ?? DEFAULT_CONFIG;
  const mode = process.argv.includes('--lenient') ? 'quarantine' : 'strict';

  const inputPath = resolve(input);
  const outputPath = resolve(output);
  if (inputPath === outputPath) {
    throw new Error('Refusing to overwrite the input file; pass a different --output.');
  }

  const prepared = prepareRows(await readFile(inputPath, 'utf8'), { mode });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, makeCsv(prepared.rows), 'utf8');
  await writeFile(resolve(config), makeConfig(prepared.metadata), 'utf8');

  process.stdout.write(`Prepared ${prepared.metadata.totalRows} of ${prepared.metadata.inputRows} survey rows.\n`);

  if (prepared.metadata.excludedRows > 0) {
    process.stdout.write(`Excluded ${prepared.metadata.excludedRows} rows.\n`);
  }

  const summary = summariseIssues(prepared.issues);
  for (const [kind, count] of Object.entries(summary)) {
    process.stdout.write(`  ${kind}: ${count}\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
