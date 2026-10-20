import { useEffect, useRef, useState } from 'react';
import { HistoryRecord, HistorySummary } from '../types/history';
import { historyRequest } from '../utils/history';
import { formatColombianDate } from '../utils/formatters';

interface Props {
  onClose: () => void;
  onOpenRecord: (record: HistoryRecord) => void;
}

export const HistoryPanel = ({ onClose, onOpenRecord }: Props) => {
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
      setError(reason instanceof Error ? reason.message : 'No se pudo buscar.');
    } finally { if (version === requestVersion.current) setLoading(false); }
  };

  useEffect(() => {
    title.current?.focus();
    void search(0, true);
    return () => { requestVersion.current++; };
    // La consulta inicial usa filtros vacios; los cambios se buscan al enviar el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = async (number: string) => {
    setLoading(true); setError('');
    try {
      const result = await historyRequest<{ record: HistoryRecord }>(undefined, `?action=record&number=${encodeURIComponent(number)}`);
      onOpenRecord(result.record);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo abrir el documento.');
    } finally { setLoading(false); }
  };

  return (
    <section className="app-chrome mx-auto max-w-[1500px] px-4 pt-5" aria-labelledby="history-title">
      <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div><h2 ref={title} tabIndex={-1} id="history-title" className="text-lg font-bold text-hospital-navy">Historial compartido</h2><p className="mt-1 text-sm text-slate-500">Documentos guardados para consultar y reimprimir desde cualquier equipo.</p></div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cerrar historial</button>
          </div>
        </div>
        {error ? <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
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
      </div>
    </section>
  );
};
