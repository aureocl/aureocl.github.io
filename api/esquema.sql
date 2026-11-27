-- Base D1 «aureo-pedidos» (W3 · fase 1, 27-nov-2026). Solo estructura: NUNCA datos de clientes en este repo.
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,                 -- AU-AAMMDD-NNN, el mismo del WhatsApp y de la bandeja
  recibido TEXT NOT NULL,              -- fecha y hora de Chile, 'AAAA-MM-DD HH:MM:SS'
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  origen TEXT,                         -- web | equipo | rapido
  cliente TEXT, tel TEXT, mail TEXT,
  entrega TEXT, region TEXT, comuna TEXT, dir TEXT,
  envio INTEGER DEFAULT 0, total INTEGER DEFAULT 0,
  pago_declarado TEXT, ingresado_por TEXT, es_regalo INTEGER DEFAULT 0,
  datos TEXT NOT NULL                  -- el pedido completo tal cual llegó (JSON)
);
CREATE INDEX IF NOT EXISTS pedidos_recibido ON pedidos(recibido);
CREATE INDEX IF NOT EXISTS pedidos_estado ON pedidos(estado);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id),
  tipo TEXT NOT NULL,                  -- producto | camisetas | mini
  nombre TEXT, cantidad INTEGER, precio_unit INTEGER, total INTEGER, detalle TEXT
);
CREATE INDEX IF NOT EXISTS items_pedido ON items(pedido_id);
CREATE TABLE IF NOT EXISTS cambios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL,
  cuando TEXT NOT NULL, quien TEXT, accion TEXT NOT NULL, detalle TEXT
);
CREATE INDEX IF NOT EXISTS cambios_pedido ON cambios(pedido_id);
CREATE TABLE IF NOT EXISTS gasto_meta (
  fecha TEXT NOT NULL, campana TEXT NOT NULL,
  gasto INTEGER NOT NULL, gasto_iva INTEGER NOT NULL, mensajes INTEGER DEFAULT 0, actualizado TEXT,
  PRIMARY KEY (fecha, campana)
);
