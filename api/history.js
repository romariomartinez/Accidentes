import { redis } from '../server/redis.js';
import { sameOrigin } from '../server/historyAuth.js';
import { normalizeRecord, normalizeSearch } from '../server/historyData.js';

// La reserva y el documento se verifican y guardan en una sola operacion.
const saveScript = `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 'reservation' end
local previous = redis.call('GET', KEYS[2])
if previous then
  local decoded = cjson.decode(previous)
  if decoded.digest ~= ARGV[5] then return 'conflict' end
  return 'existing'
end
redis.call('SET', KEYS[2], ARGV[2])
redis.call('HSET', KEYS[3], ARGV[1], ARGV[3])
redis.call('ZADD', KEYS[4], ARGV[4], ARGV[1])
return 'saved'
`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Cookie');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Metodo no permitido.' });
  if (req.method === 'POST' && !sameOrigin(req)) return res.status(403).json({ error: 'Origen no permitido.' });
  const action = req.method === 'GET' ? req.query?.action : req.body?.action;
  if (action === 'session') return res.status(200).json({ authenticated: true, configured: true });
  try {
    if (req.method === 'GET' && action === 'record') {
      const number = req.query.number;
      if (typeof number !== 'string' || !/^(DAT|FOMAG)-\d{8}-\d{2,}$/.test(number)) return res.status(400).json({ error: 'Numero invalido.' });
      const raw = await redis(['GET', `history:record:${number}`]);
      return raw ? res.status(200).json({ record: JSON.parse(raw) }) : res.status(404).json({ error: 'Documento no encontrado.' });
    }
    if (req.method === 'POST' && action === 'save') {
      let record;
      try { record = normalizeRecord(req.body.module, req.body.data, req.body.requestId); }
      catch (error) { return res.status(400).json({ error: error.message }); }
      const { data, requestId, digest, ...summary } = record;
      const result = await redis(['EVAL', saveScript, 4,
        `accidentes:${record.module}:request:${requestId}`, `history:record:${record.number}`, 'history:summaries', 'history:index',
        record.number, JSON.stringify(record), JSON.stringify(summary), Date.now(), digest]);
      if (result === 'reservation') return res.status(409).json({ error: 'No se pudo verificar el consecutivo central.' });
      if (result === 'conflict') return res.status(409).json({ error: 'Este consecutivo ya tiene un documento guardado con otros datos. Inicie un documento nuevo para registrar cambios.' });
      return res.status(200).json({ saved: true, number: record.number });
    }
    if (req.method === 'POST' && action === 'search') {
      const query = normalizeSearch(String(req.body.query || '').slice(0, 150));
      const module = ['accident', 'fomag'].includes(req.body.module) ? req.body.module : '';
      let cursor = Number(req.body.cursor || 0);
      if (!Number.isSafeInteger(cursor) || cursor < 0) return res.status(400).json({ error: 'Pagina invalida.' });
      const records = [];
      const total = await redis(['ZCARD', 'history:index']);
      let scanned = 0;
      while (records.length < 25 && cursor < total && scanned < 1000) {
        const ids = await redis(['ZREVRANGE', 'history:index', cursor, cursor + 49]);
        if (!ids.length) break;
        const rows = await redis(['HMGET', 'history:summaries', ...ids]);
        for (const raw of rows) {
          cursor++; scanned++;
          if (!raw) continue;
          const row = JSON.parse(raw);
          if ((!module || row.module === module) && (!query || normalizeSearch(`${row.name} ${row.document} ${row.number} ${row.date} ${row.date.split('-').reverse().join('/')}`).includes(query))) records.push(row);
          if (records.length === 25) break;
        }
      }
      return res.status(200).json({ records, nextCursor: cursor < total ? cursor : null, total });
    }
    return res.status(400).json({ error: 'Accion invalida.' });
  } catch {
    return res.status(503).json({ error: 'No se pudo conectar con el historial. Intente nuevamente.' });
  }
}
