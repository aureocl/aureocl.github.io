/* W3 · Backend de Aureo en Cloudflare (fase 1, 27-nov-2026).
   Este Worker sirve la página de siempre (archivos del repo) y, solo en /api/*, el backend:
     POST /api/pedidos  → guarda el pedido en la base D1 «aureo-pedidos» (binding DB). Público: solo puede AGREGAR pedidos.
     GET  /api/salud    → {ok:true} para revisar que está vivo (no muestra datos).
   Fase 1 = prueba en paralelo: la página manda cada pedido a Google (bandeja de siempre) Y aquí. Nada de la bandeja depende de esto todavía.
   Reglas: este repo es público → nunca claves ni datos de clientes en el código (las claves van en los secretos de Cloudflare).
   Estructura de la base: api/esquema.sql. */

const ORIGENES = ['https://aureocl.github.io', 'http://localhost:8792'];
const MAX_BYTES = 30000;               // un pedido real pesa ~2-4 KB
const MAX_POR_10_MIN = 40;             // freno contra abuso (pedidos nuevos en 10 minutos, de todos)

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    const cors = encabezados(req);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (url.pathname === '/api/salud') return json({ ok: true }, 200, cors);
      if (url.pathname === '/api/pedidos' && req.method === 'POST') return await guardarPedido(req, env, cors);
      return json({ ok: false, error: 'no existe' }, 404, cors);
    } catch (err) {
      console.log('Error API', url.pathname, err && err.message);
      return json({ ok: false, error: 'interno' }, 500, cors);
    }
  },
};

function encabezados(req) {
  const o = req.headers.get('Origin') || '', propio = new URL(req.url).origin;
  const h = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (ORIGENES.includes(o) || o === propio) { h['Access-Control-Allow-Origin'] = o; h['Vary'] = 'Origin'; h['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'; h['Access-Control-Allow-Headers'] = 'Content-Type'; }
  return h;
}
const json = (o, status, h) => new Response(JSON.stringify(o), { status, headers: { ...h, 'Content-Type': 'application/json; charset=utf-8' } });

/** Hora de Chile como texto 'AAAA-MM-DD HH:MM:SS' (igual que se lee en la planilla). */
const ahoraChile = () => ahoraChileDe(new Date());

const txt = (v, n = 200) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const num = v => { const x = Math.round(Number(v)); return Number.isFinite(x) && x >= 0 && x < 100000000 ? x : 0; };

async function guardarPedido(req, env, cors) {
  const cuerpo = await req.text();
  if (cuerpo.length > MAX_BYTES) return json({ ok: false, error: 'muy grande' }, 413, cors);
  let p;
  try { p = JSON.parse(cuerpo); } catch (e) { return json({ ok: false, error: 'formato' }, 400, cors); }
  if (!p || p.tipo !== 'pedido') return json({ ok: false, error: 'tipo' }, 400, cors);
  if (!/^AU-\d{6}-\d{3}$/.test(String(p.id))) return json({ ok: false, error: 'id' }, 400, cors);
  const k = p.cliente || {};
  if (!txt(k.nombre) || !txt(k.tel)) return json({ ok: false, error: 'faltan datos' }, 400, cors);

  const ahora = ahoraChile(), hace10 = new Date(Date.now() - 10 * 60e3);
  const ya = await env.DB.prepare('SELECT id FROM pedidos WHERE id = ?').bind(p.id).first();
  if (ya) return json({ ok: true, repetido: true }, 200, cors);
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM pedidos WHERE recibido >= ?").bind(ahoraChileDe(hace10)).first();
  if (n >= MAX_POR_10_MIN) return json({ ok: false, error: 'demasiados' }, 429, cors);

  const origen = p.rapido ? 'rapido' : p.ingresadoPor ? 'equipo' : 'web';
  const st = [env.DB.prepare(`INSERT OR IGNORE INTO pedidos (id, recibido, estado, origen, cliente, tel, mail, entrega, region, comuna, dir, envio, total, pago_declarado, ingresado_por, es_regalo, datos)
      VALUES (?, ?, 'Pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(p.id, ahora, origen, txt(k.nombre, 120), txt(k.tel, 30), txt(k.mail, 120), txt(k.entrega, 40), txt(k.region, 60), txt(k.comuna, 80), txt(k.dir, 200),
      num(p.envio), num(p.total), txt(p.pagoDeclarado, 20), txt(p.ingresadoPor, 20), p.esRegalo ? 1 : 0, cuerpo)];
  const item = (tipo, nombre, c, pu, tot, det) => env.DB.prepare('INSERT INTO items (pedido_id, tipo, nombre, cantidad, precio_unit, total, detalle) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(p.id, tipo, txt(nombre, 120), num(c), num(pu), num(tot), txt(det, 500));
  (Array.isArray(p.items) ? p.items.slice(0, 50) : []).forEach(x => st.push(item('producto', x.n, x.c, x.pu, num(x.c) * num(x.pu), x.col ? 'colección' : '')));
  if (p.camisetas) st.push(item('camisetas', 'Camiseta con escudo', p.camisetas.c, 0, p.camisetas.total, [].concat(p.camisetas.detalle || []).join(' | ') + (p.camisetas.regalo ? ' | regalo: ' + p.camisetas.regalo : '')));
  if (p.mini) st.push(item('mini', 'Mini sorpresa', p.mini.c, 0, p.mini.total, ''));
  st.push(env.DB.prepare('INSERT INTO cambios (pedido_id, cuando, quien, accion, detalle) VALUES (?, ?, ?, ?, ?)').bind(p.id, ahora, txt(p.ingresadoPor, 20) || 'cliente', 'recibido', origen));
  await env.DB.batch(st);  // todo o nada
  return json({ ok: true }, 200, cors);
}

function ahoraChileDe(d) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}
