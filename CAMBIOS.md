# Registro de cambios

Lo más nuevo arriba. Formato: `fecha · PC (Áureo/Caro) · hilo · qué cambió`.

- 20-nov-2026 · Áureo · W3 · **Bandeja en página propia** `aureocl.github.io/bandeja` (carpeta `bandeja/`, NO se edita aquí: se genera
  desde el repo Aureo con `clientes-pedidos/pedidos-web/publicar_bandeja.py`). Habla con el Apps Script por POST (versión 6), sin el inicio de
  sesión de Google: arregla «No se puede abrir el archivo en este momento» en celulares con varias cuentas de Google. Pide la clave una vez
  (no va en el repo), `noindex`.

- 20-nov-2026 · Áureo · W2 + Común · **Modo equipo**: `aureocl.github.io/?equipo=javi` (o `caro`) en el celular de Javi o Caro: ingresan el
  pedido con los datos del cliente (correo opcional) y el último paso es «Guardar en la bandeja» (espera la respuesta, reintenta con el mismo
  número, sin WhatsApp). Queda recordado en ese navegador; `?equipo=salir` lo apaga. El pedido lleva `ingresadoPor`. **Versión nueva sola**
  (`js/app.js`): al volver a la pestaña, al entrar al pedido y al abrir, compara los `?v=` con el index.html publicado y recarga si cambió (si hay
  datos a medio escribir, espera a que salga del pedido; máximo una recarga cada 2 min). Motivo: el pedido AU-261120-714 se hizo con una pestaña
  abierta desde antes y no llegó a la bandeja. Probado en local (equipo, error y reintento, cliente normal, recarga); celular.

- 20-nov-2026 · Áureo · W1 · **`/armar` en pantallas**: portada corta (logo, Aurito, 2D, 3D, colgar, trucos) + botón dorado «¡Gana premios! Tu misión Áureo»; cada parte se abre sola con «Volver al inicio» arriba y abajo; textos más cortos; misión con niveles en tarjetas y el aviso «Tenemos muchos clientes…» destacado.
- 20-nov-2026 · Áureo · W1 · Página nueva **`/armar`** (carpeta `armar/`, no toca el catálogo): destino del QR de la tarjeta de regalo con Aurito. Armar 2D, armar 3D, trucos, colgar (ganchito arriba primero, después gancho invisible) y Tu misión Áureo con botón a WhatsApp. Dibujos generados con `packaging/tarjeta-regalo/pagina.py` del repo Aureo. Probada en vista de celular.
- 20-nov-2026 · Áureo · W2 + Común · **Checkout**: (1) Mini de regalo: solo suman los productos desde $13.000 y el pack de
  camisetas (`PROP.regaloMinProducto`); la meta es lo que llevaba (mínimo $13.000) + $10.000; «Seguir mirando» ya no muestra
  productos bajo $13.000. (2) Camisetas: llevando 5, la 6.ª de regalo (`PROP.camRegaloCada`, antes $35.000 en camisetas).
  (3) Se quitó «¿Lo necesitas para una fecha?». (4) Paso nuevo **«Paga por transferencia»** después de la entrega: total y
  cuentas de Javi y Caro con «Copiar» (`CUENTAS` en `js/config.js`, vacías hasta que Áureo las escriba), botón «Ya transferí ·
  Enviar por WhatsApp» y «Enviar ahora y transferir después». (5) Mensaje de WhatsApp corto: número, productos, total, a quién
  y dónde, y si ya transfirió (a quién). El detalle completo sigue yendo a la bandeja (campo nuevo `pagoDeclarado`).
  Probado en local: regalo con minis no se gana, con 2.º escudo sí; 5 camisetas = regalo; validación, pago con y sin cuentas,
  mensaje y «Pedido listo»; celular; sin errores.

- 20-nov-2026 · Áureo · W2 + W3 · **Bandeja de pedidos**: al apretar «Enviar pedido por WhatsApp» se manda además una copia del
  pedido (en segundo plano, `guardarPedido()` en `js/pedido.js`) al Apps Script «Aureo · Pedidos web» (`PEDIDOS_URL` en
  `js/config.js`), que lo anota como «Pendiente» en la pestaña PEDIDOS WEB del maestro. Si falla, el pedido sale igual por WhatsApp.
  La nota de privacidad del pedido ahora dice «Tus datos los usamos solo para preparar y enviar tu pedido». Código del script y de
  la bandeja en el repo `Aureo`, `clientes-pedidos/pedidos-web/`. Probado en local: el pedido llegó a la bandeja.

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
