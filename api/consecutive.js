const script = `
local previous = redis.call('GET', KEYS[2])
if previous then return previous end
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local floor = tonumber(ARGV[1])
if current < floor then redis.call('SET', KEYS[1], floor) end
local next = redis.call('INCR', KEYS[1])
local number = ARGV[2] .. string.format('%02d', next)
redis.call('SET', KEYS[2], number)
return number
`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });
  const { module, requestId } = req.body || {};
  if (!['accident', 'fomag'].includes(module) || typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(requestId)) {
    return res.status(400).json({ error: 'Solicitud invalida' });
  }
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'Falta conectar el almacenamiento central en Vercel.' });
  const floor = Number(process.env[module === 'accident' ? 'ACCIDENT_SEQUENCE_START' : 'FOMAG_SEQUENCE_START']);
  if (!Number.isSafeInteger(floor) || floor < 0) return res.status(503).json({ error: 'Falta configurar el ultimo consecutivo utilizado.' });
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replaceAll('-', '');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', script, 2, `accidentes:${module}:counter`, `accidentes:${module}:request:${requestId}`, floor, `${module === 'accident' ? 'DAT' : 'FOMAG'}-${date}-`]),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (!response.ok || result.error || typeof result.result !== 'string') throw new Error('Storage unavailable');
    return res.status(200).json({ number: result.result });
  } catch {
    return res.status(503).json({ error: 'No se pudo reservar el consecutivo. Revise la conexion e intente otra vez.' });
  }
}
