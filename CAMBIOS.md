# Registro de cambios

Lo más nuevo arriba. Formato: `fecha · PC (Áureo/Caro) · hilo · qué cambió`.

- 19-nov-2026 · Áureo · W2 + Común · **Regla de envío gratis** (comentario en `js/base.js`): desde $20.000, gratis en
  Santiago; escudo de club chileno de regiones, además gratis a punto Blue en su región; extranjeros y resto, fuera de
  Santiago se paga. Se sumaron a `REGION_CLUB` Iquique Clásico, U. de Concepción, Fernández Vial, Lota Schwager, Unión La
  Calera y Concepción (león). La barra, la portada, la ficha y las ofertas ya no dicen «envío gratis» a secas: dicen dónde.
  **Salto a WhatsApp**: en celular (e Instagram/Facebook) va directo, sin ventana nueva. **El pedido no se pierde**: el carro
  ya no se vacía al enviar; «Pedido listo» sobrevive a una recarga (guarda solo número y total) y tiene «Hacer un pedido
  nuevo». Probado en local: 6 casos de envío, envío del pedido, recarga y pedido nuevo, celular, sin errores.

- 17-nov-2026 · Áureo · W2 + Común · Descuento por escudos: desde 2, $1.000 por cada uno (2 = $2.000, 3 = $3.000…;
  `PROP.descPorEscudo`, antes `segundoDesc` $3.000 fijo). Entrega pide teléfono y correo (obligatorios, con revisión) y van
  en el mensaje de WhatsApp, que cierra con «Quedo atento/a a los datos para transferir». «Pedido listo»: «Esperamos tu
  transferencia para cerrar tu pedido». Envío en Santiago: se quitó el gratis para escudos de $19.000 (UC/Wanderers pagan
  bajo $20.000, regla 16-nov). Probado en local: 3 escudos = −$3.000, faltan datos → aviso, mensaje completo, celular sin desborde.
  `index.html`: `?v=20261117` en css y js para que el caché (10 min) no mezcle versiones: **subir ese número cuando se cambie un js o el css**.
- 13-nov-2026 · Áureo · Común (`js/config.js`) · Aviso rojo de arriba: «Haz tu pedido hasta el 10 de diciembre y te llega
  antes de Navidad» (antes: pagando hasta el 15). Se esconde solo después del 10-dic. Mismo texto en «Pedido listo».
- 13-nov-2026 · Áureo · W1 · Fotos en alta (hasta 1200 px) y sin marca de agua; precio normal tachado en lanzamientos.

- 13-nov-2026 · Áureo · Fase 0 · La página se dividió en partes sin cambiar nada de lo que se ve: `css/estilos.css` y
  `js/` (`config`, `medicion`, `base`, `vitrina`, `pedido`, `app`). Nuevos `CLAUDE.md` (reglas para Claude en los dos
  PCs), `PENDIENTES.md` (tablero común) y este registro. Probado en local: catálogo, landing de Colo-Colo, pedido
  guiado completo y «Pedido listo», sin errores.
- 13-nov-2026 · Áureo · W4 · Cloudflare conectado a este repo (Worker `aureocl-github-io-catalogoweb`).
- 12-nov-2026 · Áureo · W1/W2 · El prototipo v4 pasa a ser el catálogo principal; respaldo en `catalogo-v1.html`.
