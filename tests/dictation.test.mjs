import test from 'node:test';
import assert from 'node:assert/strict';
import { appendDictatedText, createDictation, getRecognitionConstructor } from '../src/utils/dictation.ts';

function setup() {
  const instances = [];
  const states = [];
  const phrases = [];
  const pending = [];
  const errors = [];
  class FakeRecognition {
    onstart = null; onend = null; onresult = null; onerror = null;
    started = 0; stopped = 0; aborted = 0;
    constructor() { instances.push(this); }
    start() { this.started++; }
    stop() { this.stopped++; }
    abort() { this.aborted++; }
  }
  const controller = createDictation(FakeRecognition, {
    onState: (state) => states.push(state),
    onFinal: (text) => phrases.push(text),
    onInterim: (text) => pending.push(text),
    onError: (text) => errors.push(text),
  });
  return { controller, instances, states, phrases, pending, errors };
}
const result = (text, isFinal) => ({ 0: { transcript: text }, isFinal });

test('el dictado agrega texto sin sobrescribir la redaccion previa', () => {
  assert.equal(appendDictatedText('Texto previo.', 'Otra frase.'), 'Texto previo. Otra frase.');
  assert.equal(appendDictatedText('Texto previo\n', 'Otra frase'), 'Texto previo\nOtra frase');
  assert.equal(appendDictatedText('Texto', ','), 'Texto,');
  assert.equal(appendDictatedText('', '  Paciente de prueba  '), 'Paciente de prueba');
  assert.equal(appendDictatedText('Texto', ' '), 'Texto');
});

test('espanol de Colombia, resultados provisionales y finales sin duplicados', () => {
  const t = setup(); t.controller.start();
  const r = t.instances[0];
  assert.equal(r.lang, 'es-CO'); assert.equal(r.continuous, true); assert.equal(r.interimResults, true);
  r.onstart();
  r.onresult({ resultIndex: 0, results: [result('Paciente de', false)] });
  assert.deepEqual(t.phrases, []);
  assert.equal(t.pending.at(-1), 'Paciente de');
  const first = result('Paciente de prueba.', true);
  r.onresult({ resultIndex: 0, results: [first] });
  r.onresult({ resultIndex: 0, results: [first, result('Ingresó hoy.', true)] });
  r.onresult({ resultIndex: 0, results: [first, result('Ingresó hoy.', true)] });
  assert.deepEqual(t.phrases, ['Paciente de prueba.', 'Ingresó hoy.']);
  t.controller.dispose();
});

test('detener espera el resultado final y no inicia sesiones duplicadas', () => {
  const t = setup(); t.controller.start(); t.controller.start();
  assert.equal(t.instances.length, 1);
  const r = t.instances[0]; r.onstart();
  t.controller.stop(); t.controller.stop();
  assert.equal(r.stopped, 1); assert.equal(t.controller.getState(), 'stopping');
  r.onresult({ resultIndex: 0, results: [result('Última frase.', true)] });
  r.onend();
  assert.deepEqual(t.phrases, ['Última frase.']);
  assert.equal(t.controller.getState(), 'idle');
  t.controller.start(); assert.equal(t.instances.length, 2);
  t.controller.dispose();
});

test('permiso denegado y fallos de conexion liberan el microfono', () => {
  for (const code of ['not-allowed', 'network', 'audio-capture', 'no-speech']) {
    const t = setup(); t.controller.start(); const r = t.instances[0];
    r.onerror({ error: code });
    assert.equal(t.controller.getState(), 'idle'); assert.equal(r.aborted, 1);
    assert.ok(t.errors.at(-1).length > 20);
    t.controller.start(); assert.equal(t.instances.length, 2);
    t.controller.dispose();
  }
});

test('salir descarta eventos tardios y detiene el microfono', () => {
  const t = setup(); t.controller.start(); const r = t.instances[0];
  const lateResult = r.onresult; const lateStart = r.onstart;
  t.controller.abort();
  lateStart(); lateResult({ resultIndex: 0, results: [result('No debe insertarse', true)] });
  assert.equal(r.aborted, 1); assert.deepEqual(t.phrases, []);
  assert.equal(t.controller.getState(), 'idle');
  t.controller.start(); const next = t.instances[1];
  const lateAfterUnmount = next.onresult;
  const before = t.states.length;
  t.controller.dispose(); lateAfterUnmount({ resultIndex: 0, results: [result('Tampoco', true)] });
  assert.equal(t.states.length, before); assert.equal(next.aborted, 1); assert.deepEqual(t.phrases, []);
});

test('no se queda escuchando si se cancela antes de iniciar', () => {
  const t = setup(); t.controller.start(); const r = t.instances[0];
  t.controller.stop(); r.onstart();
  assert.equal(t.controller.getState(), 'stopping');
  r.onend(); assert.equal(t.controller.getState(), 'idle');
});

test('deteccion de compatibilidad exige un contexto seguro', () => {
  const previous = globalThis.window;
  try {
    globalThis.window = { isSecureContext: true, webkitSpeechRecognition: class Fake {} };
    assert.equal(getRecognitionConstructor(), globalThis.window.webkitSpeechRecognition);
    globalThis.window.isSecureContext = false;
    assert.equal(getRecognitionConstructor(), undefined);
    globalThis.window = { isSecureContext: true };
    assert.equal(getRecognitionConstructor(), undefined);
  } finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
});
