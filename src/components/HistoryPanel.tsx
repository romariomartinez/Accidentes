import { FormEvent, useEffect, useRef, useState } from 'react';
import { HistoryRecord, HistorySummary } from '../types/history';
import { HistoryAccessError, historyRequest } from '../utils/history';
import { formatColombianDate } from '../utils/formatters';

interface Props {
  onClose: () => void;
  onOpenRecord: (record: HistoryRecord) => void;
  onAuthenticated: () => void;
}

export const HistoryPanel = ({ onClose, onOpenRecord, onAuthenticated }: Props) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('');
  const [records, setRecords] = useState<HistorySummary[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requestVersion = useRef(0);
  const filters = useRef({ query: '', module: '' });
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    title.current?.focus();
    let active = true;
    historyRequest<{ authenticated: boolean; configured: boolean }>(undefined, '?action=session')
      .then((result) => { if (active) { setSession(result.authenticated); setConfigured(result.configured); } })
      .catch((reason: Error) => { if (active) { setError(reason.message); setSession(false); } });
    return () => { active = false; requestVersion.current++; };
  }, []);

  const search = async (cursor = 0, initial = false) => {
    if (!cursor) filters.current = initial ? { query: '', module: '' } : { query, module };
    const version = ++requestVersion.current;
    setLoading(true); setError('');
    try {
      const result = await historyRequest<{ records: HistorySummary[]; nextCursor: number | null; total: number }>({ action: 'search', ...filters.current, cursor });
      if (version !== requestVersion.current) return;
      setRecords((previous) => cursor ? [...new Map([...previous, ...result.records].map((record) => [record.number, record])).values()] : result.records);
      setNextCursor(result.nextCursor); setTotal(result.total);
    } catch (reason) {
      if (version !== requestVersion.current) return;
      if (reason instanceof HistoryAccessError) setSession(false);
      setError(reason instanceof Error ? reason.message : 'No se pudo buscar.');
    } finally { if (version === requestVersion.current) setLoading(false); }
  };

  useEffect(() => {
    if (!session) return;
    // La busqueda inicial carga los documentos recientes; las siguientes son explicitas.
    void search(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const login = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      await historyRequest({ action: 'login', password });
      setPassword(''); setSession(true); onAuthenticated();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesion.'); }
    finally { setLoading(false); }
  };

  const open = async (number: string) => {
    setLoading(true); setError('');
    try {
      const result = await historyRequest<{ record: HistoryRecord }>(undefined, `?action=record&number=${encodeURIComponent(number)}`);
      onOpenRecord(result.record);
    } catch (reason) {
      if (reason instanceof HistoryAccessError) setSession(false);
      setError(reason instanceof Error ? reason.message : 'No se pudo abrir el documento.');
    } finally { setLoading(false); }
  };

  return (
    <section className="app-chrome mx-auto max-w-[1500px] px-4 pt-5" aria-labelledby="history-title">
      <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div><h2 ref={title} tabIndex={-1} id="history-title" className="text-lg font-bold text-hospital-navy">Historial compartido</h2><p className="mt-1 text-sm text-slate-500">Documentos guardados para consultar y reimprimir desde cualquier equipo.</p></div>
          <div className="flex gap-2">
            {session ? <button className="btn-ghost" type="button" disabled={loading} onClick={async () => { try { await historyRequest({ action: 'logout' }); setSession(false); setRecords([]); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cerrar la sesion.'); } }}>Cerrar sesión</button> : null}
            <button type="button" className="btn-ghost" onClick={onClose}>Cerrar historial</button>
          </div>
        </div>
        {error ? <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        {session === null ? <p role="status" className="text-sm text-slate-500">Comprobando acceso…</p> : !configured ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Para activar el historial, configure una clave privada de al menos 12 caracteres en Vercel, en la variable <strong>HISTORY_ACCESS_PASSWORD</strong>, y vuelva a desplegar el proyecto.</p>
        ) : !session ? (
          <form onSubmit={login} className="flex max-w-xl flex-wrap items-end gap-3">
            <label className="min-w-56 flex-1 text-sm font-medium text-slate-700">Clave de acceso al historial<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={256} className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2" /></label>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
            <p className="w-full text-xs text-slate-500">La sesión dura 8 horas en este navegador. Solo las personas con la clave pueden consultar o guardar documentos.</p>
          </form>
        ) : (
          <>
            <form onSubmit={(event) => { event.preventDefault(); void search(); }} className="mb-4 flex flex-wrap items-end gap-3">
              <label className="min-w-56 flex-1 text-sm font-medium text-slate-700">Buscar<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, documento, fecha o consecutivo" maxLength={150} className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Tipo de documento<select value={module} onChange={(event) => setModule(event.target.value)} className="mt-2 block rounded-md border border-slate-300 bg-white px-3 py-2"><option value="">Todos</option><option value="accident">Accidentes</option><option value="fomag">FOMAG</option></select></label>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Buscando…' : 'Buscar'}</button>
            </form>
            <p className="mb-3 text-xs text-slate-500">{total} documentos en el historial. Los más recientes aparecen primero.</p>
            <div className="space-y-2" aria-busy={loading}>
              {records.map((record) => <div key={record.number} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"><div><p className="font-semibold text-hospital-navy">{record.name}</p><p className="mt-1 text-sm text-slate-600">{record.document} · {record.number}</p><p className="mt-1 text-xs text-slate-500">{record.module === 'accident' ? 'Accidente' : 'FOMAG'} · Registro: {formatColombianDate(record.date)}</p></div><button type="button" disabled={loading} className="btn-secondary" onClick={() => void open(record.number)}>Abrir documento</button></div>)}
              {!records.length && !loading ? <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-600">No hay documentos para esta búsqueda. Los documentos nuevos se guardan al imprimir, descargar el PDF o pulsar «Guardar en historial».</p> : null}
            </div>
            {nextCursor !== null ? <button type="button" className="btn-ghost mt-4" disabled={loading} onClick={() => void search(nextCursor)}>Ver más resultados</button> : null}
          </>
        )}
      </div>
    </section>
  );
};
