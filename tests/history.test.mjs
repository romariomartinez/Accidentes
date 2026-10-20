import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/history.js';
import { normalizeRecord, normalizeSearch } from '../server/historyData.js';
import { accident, fomag, requestId } from './fixtures.mjs';

process.env.KV_REST_API_URL = 'https://storage.example.invalid';
process.env.KV_REST_API_TOKEN = 'test-only';
const headers = { host: 'hospital.example', origin: 'https://hospital.example' };
const call = async (method, body, query) => {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
  await handler({ method, headers, body, query }, res);
  return res;
};

test('normalizacion estable ignora metadatos y rechaza datos invalidos', () => {
  const a = normalizeRecord('accident', accident, requestId);
  const b = normalizeRecord('accident', { ...accident, metadata: { savedAt: 'later' } }, requestId);
  assert.equal(a.digest, b.digest);
  assert.equal(normalizeRecord('fomag', fomag, requestId).number, fomag.recordNumber);
  assert.throws(() => normalizeRecord('accident', { ...accident, victim: {} }, requestId));
  assert.throws(() => normalizeRecord('fomag', { ...fomag, recordNumber: 'BORRADOR-01' }, requestId));
  assert.equal(normalizeSearch('ÁLVAREZ 1.234-56'), normalizeSearch('alvarez123456'));
});

test('acceso sin clave conserva validacion de origen', async () => {
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json() { return this; } };
  await handler({ method: 'POST', headers: { ...headers, origin: 'https://evil.example' }, body: { action: 'save' } }, res);
  assert.equal(res.code, 403);
  const session = await call('GET', null, { action: 'session' });
  assert.equal(session.body.authenticated, true);
});

test('guardar, buscar sin tildes, recuperar y rechazar sobrescrituras', async () => {
  const storage = new Map();
  const summaries = new Map();
  const reservations = new Map([[`accidentes:accident:request:${requestId}`, accident.accident.declarationNumber]]);
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    const c = JSON.parse(options.body);
    let result;
    if (c[0] === 'EVAL') {
      const [, , , reservationKey, recordKey, , , number, value, summary, , digest] = c;
      if (reservations.get(reservationKey) !== number) result = 'reservation';
      else if (storage.has(recordKey)) result = JSON.parse(storage.get(recordKey)).digest === digest ? 'existing' : 'conflict';
      else { storage.set(recordKey, value); summaries.set(number, summary); result = 'saved'; }
    } else if (c[0] === 'ZCARD') result = summaries.size;
    else if (c[0] === 'ZREVRANGE') result = [...summaries.keys()].slice(c[2], c[3] + 1);
    else if (c[0] === 'HMGET') result = c.slice(2).map((key) => summaries.get(key) || null);
    else if (c[0] === 'GET') result = storage.get(c[1]) || null;
    return { ok: true, json: async () => ({ result }) };
  };
  try {
    const save = { action: 'save', module: 'accident', data: accident, requestId };
    assert.equal((await call('POST', save)).code, 200);
    assert.equal((await call('POST', save)).code, 200);
    assert.equal(summaries.size, 1);
    const modified = structuredClone(accident); modified.victim.fullName = 'OTRA PERSONA';
    assert.equal((await call('POST', { ...save, data: modified })).code, 409);
    assert.equal((await call('POST', { ...save, requestId: '00000000-0000-4000-8000-000000000000' })).code, 409);
    const found = await call('POST', { action: 'search', query: 'alvarez' });
    assert.equal(found.body.records.length, 1);
    assert.equal(found.body.nextCursor, null);
    assert.equal('data' in found.body.records[0], false);
    const noMatch = await call('POST', { action: 'search', module: 'fomag' });
    assert.equal(noMatch.body.records.length, 0);
    const opened = await call('GET', null, { action: 'record', number: accident.accident.declarationNumber });
    assert.equal(opened.body.record.requestId, requestId);
    assert.equal(opened.body.record.data.victim.fullName, accident.victim.fullName);
  } finally { globalThis.fetch = realFetch; }
});

test('paginacion conserva resultados al recorrer varios bloques', async () => {
  const rows = Array.from({ length: 61 }, (_, index) => ({ number: `DAT-20261020-${index + 10}`, module: 'accident', name: 'PRUEBA', document: String(index), date: '2026-10-20' }));
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    const c = JSON.parse(options.body);
    const result = c[0] === 'ZCARD' ? rows.length : c[0] === 'ZREVRANGE' ? rows.slice(c[2], c[3] + 1).map((row) => row.number) : c.slice(2).map((id) => JSON.stringify(rows.find((row) => row.number === id)));
    return { ok: true, json: async () => ({ result }) };
  };
  try {
    const all = []; let cursor = 0;
    do {
      const page = await call('POST', { action: 'search', cursor });
      all.push(...page.body.records); cursor = page.body.nextCursor;
    } while (cursor !== null);
    assert.equal(all.length, 61);
    assert.equal(new Set(all.map((row) => row.number)).size, 61);
  } finally { globalThis.fetch = realFetch; }
});
