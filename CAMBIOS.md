# Registro de cambios

Lo más nuevo arriba. Formato: `fecha · PC (Áureo/Caro) · hilo · qué cambió`.

- 20-nov-2026 · Áureo · W1 · **«🔥 Los más vendidos»** arriba en la portada (Todo, sin búsqueda): Colo-Colo, U de Chile, UC y
  Wanderers (`MAS_VENDIDOS` en `js/config.js`). En la planilla los cuatro quedan en «Oferta» con sus precios fijos (23/21/19/19) y
  tachado: Colo-Colo $29.000, U de Chile $28.000 (regla), UC y Wanderers $24.000 (la regla daba menos: +$5.000). Probado en local.

- 19-nov-2026 · Áureo · W1 · **Versiones**: Deportes Iquique (Actual / Clásico) y Deportes Concepción (Águila / León) juntos
  en una ficha. Si las etiquetas no son tamaños, dice «Elige la versión» y «· 2 versiones». Probado en local.

- 19-nov-2026 · Áureo · W1 · **Tamaños en la ficha** (`VARIANTES` en `js/config.js`): varios tamaños o versiones de un
  producto salen como uno solo en el catálogo («· 2 tamaños»); en la ficha, «Elige el tamaño» cambia foto, medida, piezas y
  precio (cada tamaño sigue siendo su fila en la planilla). Primer grupo: Boca Juniors Chico / Mediano. La búsqueda ahora
  busca palabra por palabra («boca mediano»). Datos de pago: van por WhatsApp (`DATOS_PAGO = []`). Probado en local.

- 19-nov-2026 · Áureo · W1 · **Precio de oferta**: si «Precio antes» es mayor y la etiqueta NO es «Lanzamiento», la tarjeta
  dice «Ahorras $X» (antes siempre decía «Precio de lanzamiento»). El precio tachado ahora va con línea roja gruesa.
  En la planilla, 12 escudos que bajaron el 19-nov tienen «Precio antes» = precio anterior y etiqueta «Oferta».
  Probado en local (sin errores de consola).

- 19-nov-2026 · Áureo · Entrega · **Punto Blue sin mapa**: se quitó el mapa de Google y el link al buscador de Blue
  (blue.cl no se puede insertar: `x-frame-options: DENY`). Con «Punto Blue Express» el cliente escribe región, comuna y su
  dirección; nosotros le buscamos el punto más cercano y se lo confirmamos por WhatsApp. El mensaje dice
  «DIRECCION (buscarle el Punto Blue mas cercano): …». Sintaxis revisada; no se pudo probar en el navegador local.

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
