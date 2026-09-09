import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PUBLIC_COLUMNS,
  SURVEY_SCHEMA,
  makeConfig,
  makeCsv,
  parseCsv,
  prepareRows,
  summariseIssues
} from './prepare-survey-data.mjs';

const HEADER = '"id","timestamp","age_range","status","main_pressure","cost_increased","cut_back_on","work_worry_rating","income_keeps_up_rating","transport_cost","food_cost","comment","ip_hash","user_agent"';
const TEST_ROW = '1,"2026-05-28 09:00:00","18-21","Student","Food","Yes","[""Eating out"",""Transport""]",5,1,"R0-R300","R3000+","private note","hash","Mozilla/5.0"';
const SECOND_ROW = '2,"2026-05-30 06:37:01","18-21","Student","Data","Yes","[""Data""]",2,4,"R0-R300","R501-R1000",,"hash","Mozilla/5.0"';

const withRows = (...rows) => `${HEADER}\n${rows.join('\n')}\n`;
const lenient = { mode: 'quarantine' };

// Replaces one field of TEST_ROW by its position in the raw export header.
function rowWith(field, value) {
  const columns = parseCsv(`${HEADER}\n${TEST_ROW}`);
  const index = columns[0].indexOf(field);
  const cells = columns[1];
  cells[index] = value;
  return cells
    .map((cell) => (/[",\r\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell))
    .join(',');
}


test('prepares safe chart rows and counts them', () => {
  const prepared = prepareRows(withRows(TEST_ROW, SECOND_ROW));
  assert.equal(prepared.rows.length, 2);
  assert.equal(prepared.rows[0].cut_back_on, 'Eating out; Transport');
  assert.deepEqual(prepared.metadata, {
    totalRows: 2,
    inputRows: 2,
    excludedRows: 0,
    latestTimestamp: '2026-05-30 06:37:01'
  });
  assert.deepEqual(prepared.issues, []);
});

test('public CSV excludes private export fields', () => {
  const prepared = prepareRows(withRows(TEST_ROW));
  const csv = makeCsv(prepared.rows);
  assert.doesNotMatch(csv, /private note|hash|Mozilla|2026-05-28/);
  assert.equal(csv.split('\n')[0], PUBLIC_COLUMNS.join(','));
});

test('config contains the public path and honest note', () => {
  const config = makeConfig(prepareRows(withRows(TEST_ROW, SECOND_ROW)).metadata);
  assert.match(config, /"path": "data\/survey\/za_survey_responses\.csv"/);
  assert.match(config, /2 Survey App rows: Real survey data/);
  assert.match(config, /"chartLabel": "n=2"/);
});


// --- required structure -----------------------------------------------------

test('a missing required column is rejected by name', () => {
  assert.throws(() => prepareRows('id,status\n1,Student\n'), /Missing survey column: user_agent/);
});

test('an optional export column may be absent', () => {
  // comment and ip_hash exist upstream but are never read, so dropping them
  // must not stop a legitimate export from being processed.
  const header = HEADER.replace('"comment","ip_hash",', '');
  const row = TEST_ROW.replace('"private note","hash",', '');
  const prepared = prepareRows(`${header}\n${row}\n`);
  assert.equal(prepared.rows.length, 1);
});

test('a blank row is skipped rather than counted', () => {
  const prepared = prepareRows(withRows(TEST_ROW, ',,,,,,,,,,,,,'));
  assert.equal(prepared.metadata.totalRows, 1);
  assert.equal(prepared.metadata.inputRows, 1);
});


// --- required values --------------------------------------------------------

test('a missing required value is distinguished from an invalid one', () => {
  const missing = prepareRows(withRows(rowWith('status', '')), lenient);
  const invalid = prepareRows(withRows(rowWith('status', 'Freelancer')), lenient);

  assert.equal(missing.issues[0].kind, 'missing-required-value');
  assert.equal(invalid.issues[0].kind, 'invalid-category');
  assert.equal(invalid.issues[0].value, 'Freelancer');
});

test('strict mode throws and names the row, field and value', () => {
  assert.throws(
    () => prepareRows(withRows(rowWith('food_cost', 'R9000+'))),
    /Invalid food_cost category "R9000\+" in row 2/
  );
});

test('quarantine mode excludes the record instead of throwing', () => {
  const prepared = prepareRows(withRows(TEST_ROW, rowWith('food_cost', 'R9000+')), lenient);
  assert.equal(prepared.metadata.totalRows, 1);
  assert.equal(prepared.metadata.excludedRows, 1);
  assert.equal(prepared.metadata.inputRows, 2);
});

test('an unknown category never reaches the published CSV', () => {
  const prepared = prepareRows(withRows(TEST_ROW, rowWith('main_pressure', 'Childcare')), lenient);
  assert.doesNotMatch(makeCsv(prepared.rows), /Childcare/);
});

test('every categorical field is validated', () => {
  for (const field of Object.keys(SURVEY_SCHEMA.categorical)) {
    const prepared = prepareRows(withRows(rowWith(field, 'definitely-not-valid')), lenient);
    assert.equal(prepared.metadata.excludedRows, 1, `${field} should reject unknown values`);
  }
});


// --- numbers ----------------------------------------------------------------

test('malformed numeric input is rejected deterministically', () => {
  for (const value of ['abc', '3abc', '', ' ', 'NaN', '4.5']) {
    const prepared = prepareRows(withRows(rowWith('work_worry_rating', value)), lenient);
    assert.equal(prepared.metadata.excludedRows, 1, `"${value}" should not be accepted`);
  }
});

test('ratings outside 1-5 are reported as out of range', () => {
  const high = prepareRows(withRows(rowWith('work_worry_rating', '6')), lenient);
  const low = prepareRows(withRows(rowWith('income_keeps_up_rating', '0')), lenient);
  assert.equal(high.issues[0].kind, 'out-of-range');
  assert.equal(low.issues[0].kind, 'out-of-range');
});

test('rating boundaries 1 and 5 are accepted', () => {
  for (const value of ['1', '5']) {
    const prepared = prepareRows(withRows(rowWith('work_worry_rating', value)));
    assert.equal(prepared.metadata.totalRows, 1);
  }
});


// --- multi-select -----------------------------------------------------------

test('an empty multi-select is a valid answer, not malformed input', () => {
  for (const value of ['', '[]']) {
    const prepared = prepareRows(withRows(rowWith('cut_back_on', value)));
    assert.equal(prepared.metadata.totalRows, 1);
    assert.equal(prepared.rows[0].cut_back_on, '');
  }
});

test('malformed and non-array cut_back_on are both explicit errors', () => {
  for (const value of ['not-json', '5', 'null', '{}']) {
    assert.throws(
      () => prepareRows(withRows(rowWith('cut_back_on', value))),
      /Invalid cut_back_on JSON/,
      `"${value}" should be rejected`
    );
  }
});

test('an unknown cutback option is dropped and reported, keeping the record', () => {
  const prepared = prepareRows(withRows(rowWith('cut_back_on', '["Eating out","Holidays"]')));
  assert.equal(prepared.metadata.totalRows, 1);
  assert.equal(prepared.rows[0].cut_back_on, 'Eating out');
  assert.deepEqual(summariseIssues(prepared.issues), { 'unknown-cutback-token': 1 });
});


// --- timestamps -------------------------------------------------------------

test('an unrecognised timestamp is reported but does not lose the response', () => {
  const prepared = prepareRows(withRows(rowWith('timestamp', '28/05/2026')));
  assert.equal(prepared.metadata.totalRows, 1);
  assert.equal(prepared.metadata.latestTimestamp, null);
  assert.equal(prepared.issues[0].kind, 'invalid-timestamp');
});

test('latestTimestamp is the maximum over valid rows only', () => {
  const prepared = prepareRows(withRows(
    TEST_ROW,
    SECOND_ROW,
    rowWith('timestamp', 'tomorrow')
  ));
  assert.equal(prepared.metadata.latestTimestamp, '2026-05-30 06:37:01');
});


// --- empty dataset ----------------------------------------------------------

test('an empty dataset produces a valid empty result, not NaN', () => {
  const prepared = prepareRows(`${HEADER}\n`);
  assert.deepEqual(prepared.rows, []);
  assert.equal(prepared.metadata.totalRows, 0);
  assert.equal(prepared.metadata.excludedRows, 0);
  assert.equal(prepared.metadata.latestTimestamp, null);

  const config = makeConfig(prepared.metadata);
  assert.match(config, /"chartLabel": "n=0"/);
  assert.doesNotMatch(config, /NaN|undefined|Infinity/);

  assert.equal(makeCsv(prepared.rows), `${PUBLIC_COLUMNS.join(',')}\n`);
});


// --- expenditure bands ------------------------------------------------------

test('every declared expenditure band round-trips to the published CSV', () => {
  for (const band of SURVEY_SCHEMA.categorical.food_cost) {
    const prepared = prepareRows(withRows(rowWith('food_cost', band)));
    assert.equal(prepared.rows[0].food_cost, band);
    assert.match(makeCsv(prepared.rows), new RegExp(band.replace('+', '\\+')));
  }

  for (const band of SURVEY_SCHEMA.categorical.transport_cost) {
    const prepared = prepareRows(withRows(rowWith('transport_cost', band)));
    assert.equal(prepared.rows[0].transport_cost, band);
  }
});

test('R0-R500 is a valid band even though no respondent selected it', () => {
  // It is a real survey option, so the charts keep an empty row rather than
  // treating an unused band as bad data.
  assert.ok(SURVEY_SCHEMA.categorical.food_cost.includes('R0-R500'));
  assert.equal(prepareRows(withRows(rowWith('food_cost', 'R0-R500'))).metadata.totalRows, 1);
});

test('band boundaries are matched exactly, not by prefix', () => {
  for (const value of ['R0-R5000', 'r0-r500', ' R0-R500', 'R0-R500 ']) {
    const prepared = prepareRows(withRows(rowWith('food_cost', value)), lenient);
    assert.equal(prepared.metadata.excludedRows, 1, `"${value}" should not match a band`);
  }
});


// --- counts reconcile -------------------------------------------------------

test('published rows plus excluded rows equal the input rows', () => {
  const prepared = prepareRows(withRows(
    TEST_ROW,
    SECOND_ROW,
    rowWith('status', 'Freelancer'),
    rowWith('work_worry_rating', '9')
  ), lenient);

  assert.equal(
    prepared.metadata.totalRows + prepared.metadata.excludedRows,
    prepared.metadata.inputRows
  );
  assert.equal(prepared.metadata.totalRows, 2);
  assert.equal(prepared.metadata.excludedRows, 2);
});

test('published row count matches the data lines in the generated CSV', () => {
  const prepared = prepareRows(withRows(TEST_ROW, SECOND_ROW));
  const dataLines = makeCsv(prepared.rows).trim().split('\n').slice(1);
  assert.equal(dataLines.length, prepared.metadata.totalRows);
});

test('category shares of the published rows sum to 100 percent', () => {
  const prepared = prepareRows(withRows(TEST_ROW, SECOND_ROW, rowWith('status', 'Employed')));
  const total = prepared.metadata.totalRows;

  const counts = {};
  for (const row of prepared.rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  const sum = Object.values(counts).reduce((acc, n) => acc + (n / total) * 100, 0);
  assert.ok(Math.abs(sum - 100) < 1e-9, `expected 100, got ${sum}`);
});


// --- CSV parsing ------------------------------------------------------------

test('parseCsv handles quoted commas, newlines and escaped quotes', () => {
  const rows = parseCsv('a,b\n"one, two","he said ""hi"""\n"multi\nline",plain\n');
  assert.deepEqual(rows[1], ['one, two', 'he said "hi"']);
  assert.deepEqual(rows[2], ['multi\nline', 'plain']);
});

test('parseCsv strips carriage returns from CRLF files', () => {
  assert.deepEqual(parseCsv('a,b\r\n1,2\r\n'), [['a', 'b'], ['1', '2']]);
});

test('parseCsv does not invent a trailing row for a final newline', () => {
  assert.equal(parseCsv('a,b\n1,2\n').length, 2);
});

test('a short row is treated as missing values, not silently shifted', () => {
  // A truncated export line must fail loudly on the fields it is missing.
  const truncated = '1,"2026-05-28 09:00:00","18-21","Student"';
  const prepared = prepareRows(withRows(truncated), lenient);
  assert.equal(prepared.metadata.excludedRows, 1);
  assert.ok(prepared.issues.some((issue) => issue.kind === 'missing-required-value'));
});

test('makeCsv quotes values containing commas or quotes', () => {
  const csv = makeCsv([{ age: '18-21', status: 'a,b', pressure: 'say "hi"' }]);
  assert.match(csv, /"a,b"/);
  assert.match(csv, /"say ""hi"""/);
});
