import { HistoryModule, HistoryRecord } from '../types/history';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { FomagSignatureFormData } from '../types/fomag';

export async function historyRequest<T>(body?: object, query = ''): Promise<T> {
  const response = await fetch(`/api/history${query}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo acceder al historial.');
  return result as T;
}

export async function saveHistory(module: HistoryModule, data: TrafficAccidentDeclaration | FomagSignatureFormData) {
  const number = module === 'accident' ? (data as TrafficAccidentDeclaration).accident.declarationNumber : (data as FomagSignatureFormData).recordNumber;
  const requestId = window.localStorage.getItem(`central-request:${module}:${number}`);
  if (!requestId) throw new Error('No se encontro la reserva del documento. Vuelva a obtener su consecutivo.');
  return historyRequest({ action: 'save', module, data, requestId });
}

export function restoreReservation(record: HistoryRecord) {
  window.localStorage.setItem(`central-request:${record.module}:${record.number}`, record.requestId);
}
