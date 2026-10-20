export const reserveNumber = async (module: 'accident' | 'fomag', draftNumber: string): Promise<string> => {
  const key = `central-request:${module}:${draftNumber}`;
  let requestId = window.localStorage.getItem(key);
  if (!requestId) {
    requestId = crypto.randomUUID();
    window.localStorage.setItem(key, requestId);
  }
  const response = await fetch('/api/consecutive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module, requestId }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.number !== 'string') throw new Error(result.error || 'No se pudo obtener el consecutivo central.');
  // La reimpresion del mismo borrador conserva su numero.
  window.localStorage.setItem(`central-request:${module}:${result.number}`, requestId);
  return result.number;
};

export const waitForDocument = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
});
