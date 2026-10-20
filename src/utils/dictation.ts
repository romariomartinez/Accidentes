export type DictationState = 'idle' | 'starting' | 'listening' | 'stopping';

export interface RecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { transcript: string };
}

export interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}

export interface SpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type RecognitionConstructor = new () => SpeechRecognizer;

export function getRecognitionConstructor(): RecognitionConstructor | undefined {
  if (typeof window === 'undefined' || !window.isSecureContext) return undefined;
  const browser = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return browser.SpeechRecognition || browser.webkitSpeechRecognition;
}

export function appendDictatedText(current: string, spoken: string): string {
  const text = spoken.trim();
  if (!text) return current;
  if (!current.trim()) return text;
  const separator = /\s$/.test(current) || /^[,.;:!?]/.test(text) ? '' : ' ';
  return current + separator + text;
}

export function dictationErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'not-allowed': 'El micrófono no tiene permiso. Permita su uso en la configuración de este sitio y vuelva a intentarlo.',
    'service-not-allowed': 'El navegador no permite el reconocimiento de voz. Revise sus permisos o pruebe en otro navegador compatible.',
    'audio-capture': 'No se encontró un micrófono disponible. Compruebe que esté conectado y que otra aplicación no lo esté usando.',
    'network': 'No se pudo conectar con el servicio de dictado. Revise su conexión a internet y vuelva a intentarlo.',
    'no-speech': 'No se detectó voz. Acérquese al micrófono y vuelva a iniciar el dictado.',
    'language-not-supported': 'El servicio de voz no tiene disponible español de Colombia en este navegador.',
  };
  return messages[code] || 'El dictado se interrumpió. El texto ya agregado se conserva; puede volver a intentarlo.';
}

interface Callbacks {
  onState: (state: DictationState) => void;
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (message: string) => void;
}

// Una instancia por sesion evita que lleguen resultados de dictados anteriores.
export function createDictation(Recognition: RecognitionConstructor, callbacks: Callbacks) {
  let recognition: SpeechRecognizer | null = null;
  let state: DictationState = 'idle';
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  const update = (next: DictationState) => { state = next; callbacks.onState(next); };
  const detach = () => {
    clearTimeout(stopTimer);
    const previous = recognition;
    recognition = null;
    if (previous) previous.onstart = previous.onend = previous.onresult = previous.onerror = null;
    return previous;
  };
  const abort = (notify = true) => {
    const previous = detach();
    try { previous?.abort(); } catch { /* El navegador ya puede haberlo detenido. */ }
    state = 'idle';
    if (notify) { callbacks.onInterim(''); callbacks.onState('idle'); }
  };

  return {
    start() {
      if (recognition) return;
      callbacks.onError('');
      callbacks.onInterim('');
      try {
        const instance = new Recognition();
        recognition = instance;
        const confirmed = new Set<number>();
        instance.lang = 'es-CO';
        instance.continuous = true;
        instance.interimResults = true;
        instance.onstart = () => { if (recognition === instance && state !== 'stopping') update('listening'); };
        instance.onresult = (event) => {
          if (recognition !== instance) return;
          const final: string[] = [];
          const interim: string[] = [];
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0]?.transcript?.trim();
            if (!text) continue;
            if (result.isFinal) {
              if (!confirmed.has(i)) { confirmed.add(i); final.push(text); }
            } else { interim.push(text); }
          }
          if (final.length) callbacks.onFinal(final.join(' '));
          callbacks.onInterim(interim.join(' '));
        };
        instance.onerror = ({ error }) => {
          if (recognition !== instance) return;
          if (error !== 'aborted') callbacks.onError(dictationErrorMessage(error));
          abort();
        };
        instance.onend = () => {
          if (recognition !== instance) return;
          detach(); callbacks.onInterim(''); update('idle');
        };
        update('starting');
        instance.start();
      } catch {
        callbacks.onError('No se pudo iniciar el micrófono. Revise sus permisos y vuelva a intentarlo.');
        abort();
      }
    },
    stop() {
      if (!recognition || state === 'stopping') return;
      update('stopping');
      // stop permite recibir la ultima frase confirmada antes de cerrar.
      stopTimer = setTimeout(() => abort(), 4000);
      try { recognition.stop(); } catch { abort(); }
    },
    abort() { abort(); },
    dispose() { abort(false); },
    getState() { return state; },
  };
}
