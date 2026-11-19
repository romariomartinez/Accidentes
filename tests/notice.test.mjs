import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecord } from '../server/historyData.js';
import { accident, requestId } from './fixtures.mjs';

test('notice fields survive history storage without patient sample data', () => {
  const input = structuredClone(accident);
  Object.assign(input.accident, { template: 'notice', zone: 'Rural', insuranceStatus: 'Desconocido', admissionExam: 'Examen de prueba', vitalSigns: 'TA 120/80', initialTreatment: 'Plan de prueba' });
  const record = normalizeRecord('accident', input, requestId);
  for (const key of ['template', 'zone', 'insuranceStatus', 'admissionExam', 'vitalSigns', 'initialTreatment']) assert.equal(record.data.accident[key], input.accident[key]);
  assert.notEqual(record.digest, normalizeRecord('accident', accident, requestId).digest);
});

test('legacy declarations remain compatible and invalid templates are rejected', () => {
  assert.equal(normalizeRecord('accident', accident, requestId).data.accident.template, undefined);
  const input = structuredClone(accident);
  input.accident.template = 'unknown';
  assert.throws(() => normalizeRecord('accident', input, requestId), /Plantilla/);
});
