/* W3 · Backend de Aureo en Cloudflare (fase 1, 27-nov-2026).
   Este Worker sirve la página de siempre (archivos del repo) y, solo en /api/*, el backend:
     POST /api/pedidos  → guarda el pedido en la base D1 «aureo-pedidos» (binding DB). Público: solo puede AGREGAR pedidos.
     GET  /api/salud    → {ok:true} para revisar que está vivo (no muestra datos).
     POST /api/evento   → visitas anónimas del catálogo (tipo «visita») y «ahora mismo» (tipo «vivo»). Público, sin datos personales.
     POST /api/visitas  → lo que muestra la pestaña Visitas de la bandeja. Pide la clave de la bandeja: se compara su huella SHA-256,
                          guardada en la tabla config de D1 (la clave nunca está en el código).
   Desde el 27-nov-2026 las visitas viven aquí y no en el maestro (la hoja VISITAS quedó solo con lo antiguo).
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
      if (url.pathname === '/api/evento' && req.method === 'POST') return await evento(req, env, cors);
      if (url.pathname === '/api/visitas' && req.method === 'POST') return await leerVisitas(req, env, cors);
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

/* ---------- Visitas (27-nov-2026): mismas reglas que tenía el script de Google (versión 13) ---------- */
const ID_VIS = /^[a-z0-9]{6,20}$/;
async function evento(req, env, cors) {
  const cuerpo = await req.text();
  if (cuerpo.length > 12000) return json({ ok: false, error: 'largo' }, 413, cors);
  let p; try { p = JSON.parse(cuerpo); } catch (e) { return json({ ok: false }, 400, cors); }
  if (p && p.tipo === 'vivo') return vivo(p, env, cors);
  if (!p || p.tipo !== 'visita') return json({ ok: false }, 400, cors);
  const id = String(p.id || ''), vis = String(p.visitante || '');
  if (!ID_VIS.test(id) || !ID_VIS.test(vis)) return json({ ok: false, error: 'id' }, 400, cors);
  const s = (v, max) => (v === null || v === undefined || typeof v === 'object' ? '' : String(v)).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  const lista = (L, max) => (Array.isArray(L) ? L : []).slice(0, max).map(x => String(x || '').replace(/[|\u0000-\u001f]/g, ' ').trim().slice(0, 80)).filter(Boolean).join(' | ');
  const n = (v, max) => { const x = Number(v); return Number.isFinite(x) && x >= 0 ? Math.min(x, max) : null; };
  const pedido = /^AU-\d{6}-\d{3}$/.test(String(p.pedido || '')) ? String(p.pedido) : '';
  // Misma visita = misma fila: se actualiza y la hora de inicio se conserva.
  await env.DB.prepare(`INSERT INTO visitas (id, visitante, inicio, actualizado, origen, disp, entrada, carga, paso, vio, agrego, of_v, of_a, busq, pedido, compro, errores, fotos, corte, dur)
      VALUES (?1, ?2, ?3, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
      ON CONFLICT(id) DO UPDATE SET actualizado = ?3, origen = ?4, disp = ?5, entrada = ?6, carga = ?7, paso = ?8, vio = ?9, agrego = ?10, of_v = ?11, of_a = ?12,
        busq = ?13, pedido = ?14, compro = ?15, errores = ?16, fotos = ?17, corte = ?18, dur = ?19`)
    .bind(id, vis, ahoraChile(), s(p.origen, 40), s(p.disp, 15), s(p.entrada, 60), p.carga === null || p.carga === undefined ? null : n(p.carga, 60),
      Math.max(1, Math.min(5, Math.round(Number(p.paso) || 1))), lista(p.vio, 40), lista(p.agrego, 40), lista(p.ofV, 10), lista(p.ofA, 10),
      lista(p.busq, 20), pedido, lista(p.compro, 40), Math.round(n(p.err, 999) || 0), lista(p.fotos, 20), s(p.corte, 20), Math.round(n(p.dur, 86400) || 0))
    .run();
  return json({ ok: true }, 200, cors);
}

async function vivo(p, env, cors) {
  const v = String(p.v || '');
  if (!ID_VIS.test(v)) return json({ ok: false }, 400, cors);
  const ya = Date.now(), pag = String(p.pag || '').replace(/[\u0000-\u001f<>]/g, ' ').slice(0, 60);
  const st = [env.DB.prepare('INSERT INTO en_linea (visitante, pag, ultimo) VALUES (?, ?, ?) ON CONFLICT(visitante) DO UPDATE SET pag = excluded.pag, ultimo = excluded.ultimo').bind(v, pag, ya)];
  if (Math.random() < 0.05) st.push(env.DB.prepare('DELETE FROM en_linea WHERE ultimo < ?').bind(ya - 30 * 60e3));  // limpieza de vez en cuando
  await env.DB.batch(st);
  return json({ ok: true }, 200, cors);
}

async function claveOk(clave, env) {
  if (typeof clave !== 'string' || clave.length < 16) return false;
  const fila = await env.DB.prepare("SELECT v FROM config WHERE k = 'clave_bandeja_sha256'").first();
  if (!fila) return false;
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('aureo-bandeja:' + clave));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('') === fila.v;
}

/** Igual que «visitas» del script de Google: últimos 62 días + quién está ahora mismo (avisos de los últimos 150 s). */
async function leerVisitas(req, env, cors) {
  let p; try { p = JSON.parse(await req.text()); } catch (e) { return json({ ok: false, error: 'formato' }, 400, cors); }
  if (!(await claveOk(p && p.clave, env))) { await new Promise(r => setTimeout(r, 800)); return json({ ok: false, error: 'Clave incorrecta' }, 401, cors); }
  const { results } = await env.DB.prepare('SELECT * FROM visitas WHERE inicio >= ? ORDER BY inicio LIMIT 40000').bind(ahoraChileDe(new Date(Date.now() - 62 * 864e5))).all();
  const parte = x => x ? String(x).split(' | ') : [];
  const fecha = t => `${t.slice(8, 10)}-${t.slice(5, 7)}-${t.slice(0, 4)} ${t.slice(11, 16)}`;  // como la planilla: dd-MM-yyyy HH:mm
  // [fecha, visitante, origen, disp, carga, paso, vio[], agregó[], ofV[], ofA[], busq[], pedido, compró[], errores, fotos[], corte, duración]
  const filas = results.map(f => [fecha(f.inicio), f.visitante, f.origen || '', f.disp || '', f.carga, f.paso || 1, parte(f.vio), parte(f.agrego),
    parte(f.of_v), parte(f.of_a), parte(f.busq), f.pedido || '', parte(f.compro), f.errores || 0, parte(f.fotos), f.corte || '', f.dur || 0]);
  // Estado de cada pedido: en la fase 1 el estado real (pagado, enviado) todavía vive en Google, así que va vacío
  // y la bandeja usa el de su lista. Desde la fase 2 se llena desde la tabla pedidos.
  const pedidos = {};
  const { results: vivos } = await env.DB.prepare('SELECT pag, COUNT(*) AS n FROM en_linea WHERE ultimo >= ? GROUP BY pag ORDER BY n DESC').bind(Date.now() - 150e3).all();
  return json({ ok: true, r: { filas, pedidos, vivos: vivos.map(x => [x.pag, x.n]), leido: fecha(ahoraChile()) } }, 200, cors);
}
