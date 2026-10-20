import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { createDictation, DictationState, getRecognitionConstructor } from '../utils/dictation';

interface Props {
  onText: (text: string) => void;
  onActivityChange: (active: boolean) => void;
}

export const StoryDictation = ({ onText, onActivityChange }: Props) => {
  const [supported] = useState(() => Boolean(getRecognitionConstructor()));
  const [state, setState] = useState<DictationState>('idle');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const callbacks = useRef({ onText, onActivityChange });
  callbacks.current = { onText, onActivityChange };
  const controller = useRef<ReturnType<typeof createDictation> | null>(null);
  const active = state !== 'idle';

  useEffect(() => {
    const stopWhenHidden = () => { if (document.hidden) controller.current?.abort(); };
    const stopOnLeave = () => controller.current?.abort();
    document.addEventListener('visibilitychange', stopWhenHidden);
    window.addEventListener('pagehide', stopOnLeave);
    window.addEventListener('beforeprint', stopOnLeave);
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden);
      window.removeEventListener('pagehide', stopOnLeave);
      window.removeEventListener('beforeprint', stopOnLeave);
      controller.current?.dispose();
      callbacks.current.onActivityChange(false);
    };
  }, []);

  const start = () => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;
    if (!controller.current) controller.current = createDictation(Recognition, {
      onState: (next) => { setState(next); callbacks.current.onActivityChange(next !== 'idle'); },
      onFinal: (text) => callbacks.current.onText(text),
      onInterim: setInterim,
      onError: setError,
    });
    controller.current.start();
  };

  const status = state === 'starting' ? 'Activando micrófono…' : state === 'listening' ? 'Escuchando… hable con claridad' : state === 'stopping' ? 'Terminando la última frase…' : 'Dicte y revise el texto antes de guardar';

  return (
    <div className={`mb-4 rounded-lg border p-3 ${active ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-slate-50/70'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-hospital-navy">Dictado por voz {active ? <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" /> : null}</p>
          <p role="status" className="mt-1 text-xs text-slate-500">{supported ? status : 'El dictado no está disponible en este navegador. Puede seguir escribiendo el relato.'}</p>
        </div>
        <button type="button" disabled={!supported || state === 'stopping'} aria-pressed={active}
          onClick={active ? () => controller.current?.stop() : start}
          className={active ? 'btn-primary' : 'btn-secondary'}>
          {active ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {state === 'stopping' ? 'Finalizando…' : active ? 'Detener dictado' : 'Dictar relato'}
        </button>
      </div>
      {interim ? <p className="mt-3 border-t border-teal-100 pt-2 text-sm italic text-slate-500"><span className="not-italic font-medium">Reconociendo: </span>{interim}</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
      {supported ? <p className="mt-2 text-[11px] leading-relaxed text-slate-500">El navegador puede enviar el audio a su servicio de reconocimiento. La aplicación guarda solo el texto. Lo dictado se agrega al final del relato.</p> : null}
    </div>
  );
};
