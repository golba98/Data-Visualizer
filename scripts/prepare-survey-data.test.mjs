import assert from 'node:assert/strict';
import test from 'node:test';
import { makeConfig, makeCsv, prepareRows } from './prepare-survey-data.mjs';

const HEADER = '"id","timestamp","age_range","status","main_pressure","cost_increased","cut_back_on","work_worry_rating","income_keeps_up_rating","transport_cost","food_cost","comment","ip_hash","user_agent"';
const TEST_ROW = '1,"2026-05-28 09:00:00","18-21","Student","Food","Yes","[""Eating out"",""Transport""]",5,1,"R0-R300","R3000+","private note","hash","Mozilla/5.0"';
const GENERATED_ROW = '2,"2026-05-30 06:37:01","18-21","Student","Data","Yes","[""Data""]",2,4,"R0-R300","R501-R1000",,"hash","synthetic-survey-seed/run/001"';

test('prepares safe chart rows and provenance counts', () => {
  const prepared = prepareRows(`${HEADER}\n${TEST_ROW}\n${GENERATED_ROW}\n`);
  assert.equal(prepared.rows.length, 2);
  assert.deepEqual(prepared.rows.map((row) => row.provenance), ['unverified_test', 'generated_seed']);
  assert.equal(prepared.rows[0].cut_back_on, 'Eating out; Transport');
  assert.deepEqual(prepared.metadata, {
    totalRows: 2,
    generatedRows: 1,
    unverifiedRows: 1,
    verifiedRows: 0,
    latestTimestamp: '2026-05-30 06:37:01'
  });
});

test('public CSV excludes private export fields and provenance', () => {
  const prepared = prepareRows(`${HEADER}\n${TEST_ROW}\n`);
  const csv = makeCsv(prepared.rows);
  assert.doesNotMatch(csv, /provenance/);
  assert.doesNotMatch(csv, /private note|ip_hash|user_agent|timestamp/);
});

test('config contains the public path and honest note', () => {
  const prepared = prepareRows(`${HEADER}\n${TEST_ROW}\n${GENERATED_ROW}\n`);
  const config = makeConfig(prepared.metadata);
  assert.match(config, /2 Survey App rows: Real survey data/);
  assert.match(config, /verifiedRows/);
});

test('unclassified rows fail closed', () => {
  const unknown = GENERATED_ROW.replace(/^2,/, '49,').replace('synthetic-survey-seed/run/001', 'Mozilla/5.0');
  assert.throws(() => prepareRows(`${HEADER}\n${unknown}\n`), /Unclassified survey row: 49/);
});

test('missing columns and invalid cutback JSON are rejected', () => {
  assert.throws(() => prepareRows('id,status\n1,Student\n'), /Missing survey column/);
  assert.throws(
    () => prepareRows(`${HEADER}\n${TEST_ROW.replace('[""Eating out"",""Transport""]', 'not-json')}\n`),
    /Invalid cut_back_on JSON/
  );
});
