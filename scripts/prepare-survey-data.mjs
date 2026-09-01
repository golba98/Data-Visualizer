#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_CSV = resolve(ROOT, 'data/survey/za_survey_responses.csv');
const DEFAULT_CONFIG = resolve(ROOT, 'src/survey-data.js');

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

export function prepareRows(text) {
  const parsed = parseCsv(text);
  const headers = parsed.shift() || [];
  const required = [
    'id', 'timestamp', 'age_range', 'status', 'main_pressure',
    'cost_increased', 'cut_back_on', 'work_worry_rating',
    'income_keeps_up_rating', 'transport_cost', 'food_cost', 'user_agent'
  ];

  required.forEach((header) => {
    if (!headers.includes(header)) throw new Error(`Missing survey column: ${header}`);
  });

  const rows = parsed.filter((values) => values.some(Boolean)).map((values) => {
    const source = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));

    let cutbacks;
    try {
      cutbacks = JSON.parse(source.cut_back_on);
    } catch {
      throw new Error(`Invalid cut_back_on JSON in row ${source.id}`);
    }

    return {
      age: source.age_range,
      status: source.status,
      pressure: source.main_pressure,
      cost_increased: source.cost_increased,
      work_worry: source.work_worry_rating,
      income_keeps_up: source.income_keeps_up_rating,
      transport_cost: source.transport_cost,
      food_cost: source.food_cost,
      cut_back_on: Array.isArray(cutbacks) ? cutbacks.join('; ') : ''
    };
  });

  const latestTimestamp = parsed.reduce((latest, values) => {
    const timestamp = values[headers.indexOf('timestamp')] || '';
    return timestamp > latest ? timestamp : latest;
  }, '');

  return {
    rows,
    metadata: {
      totalRows: rows.length,
      latestTimestamp
    }
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function makeCsv(rows) {
  const columns = [
    'age', 'status', 'pressure', 'cost_increased', 'work_worry',
    'income_keeps_up', 'transport_cost', 'food_cost', 'cut_back_on'
  ];
  return [columns.join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\n') + '\n';
}

export function makeConfig(metadata) {
  return `var SurveyData = ${JSON.stringify({
    path: 'data/survey/za_survey_responses.csv',
    ...metadata,
    chartLabel: `n=${metadata.totalRows}`,
    note: `${metadata.totalRows} Survey App rows: Real survey data.`,
    source: 'Project Survey App export: Real survey data.'
  }, null, 2)};\n`;
}

async function main() {
  const inputFlag = process.argv.indexOf('--input');
  const input = inputFlag >= 0 ? process.argv[inputFlag + 1] : null;
  if (!input) throw new Error('Usage: npm run data:survey -- --input /path/to/survey_responses.csv');

  const prepared = prepareRows(await readFile(resolve(input), 'utf8'));
  await mkdir(dirname(DEFAULT_CSV), { recursive: true });
  await writeFile(DEFAULT_CSV, makeCsv(prepared.rows), 'utf8');
  await writeFile(DEFAULT_CONFIG, makeConfig(prepared.metadata), 'utf8');
  process.stdout.write(`Prepared ${prepared.metadata.totalRows} survey rows.\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
