# Registro de cambios

Lo más nuevo arriba. Formato: `fecha · PC (Áureo/Caro) · hilo · qué cambió`.

- 25-nov-2026 · Windows (Áureo) · W3 · **Bandeja: desglose** en «¿Estamos ganando?»: ingresos − costo de productos − costo de envío = margen − costo de anuncios = ganancia (total, por pedido y % de lo vendido), con barra y aviso de cuánto costó el envío gratis.
- 25-nov-2026 · Windows (Áureo) · W4 · **Pestaña «Visitas» de prueba** (`bandeja/visitas-prueba.html`, página aparte, no toca la bandeja): ahora mismo, resumen, visitas y pedidos por día, embudo hasta «Pagó», de dónde llegan, productos mirados vs comprados, ofertas, horas, celular/computador, velocidad de carga, búsquedas sin resultado, salud y pendientes. **Todos los números son de ejemplo**; la página aún no anota visitas. Probada en celular y computador, sin errores.
- 25-nov-2026 · Windows (Áureo) · W3 · **Bandeja: gasto de Meta y gráficos** (script v12, en Google como versión 16). Pestaña ADS del maestro con el gasto diario de Meta por campaña (lo trae Claude con el conector cada mañana; cargado desde el 10-oct). En Ventas → Todo el negocio: bloque «¿Estamos ganando?» (gasto en Meta, ganancia después de Meta, costo por pedido, retorno, costo por mensaje y metas DIARIAS de equilibrio / $50.000 / $100.000 / $200.000 con los pedidos al día que hacen falta, según el margen promedio de 30 días) y gráficos estilo Shopify: tendencia en cada tarjeta, ventas vs período anterior, margen vs Meta, ganancia de cada día y pedidos por día. En los meses con ADS, «Publicidad» de GASTOS no se resta dos veces. Generado desde `Panel.html` del repo Aureo.
- 24-nov-2026 · Mac (Áureo) · Común + W1 · **Envío gratis a todo Chile desde $40.000**: pedidos desde $40.000 van gratis a punto Bluexpress en cualquier región, lleve lo que lleve (a domicilio en regiones, $3.000). Bajo $40.000 fuera de Santiago, el texto del envío lo avisa. `GRATIS_CHILE` y `envio()` en `js/base.js`; sello de la portada en `js/vitrina.js`. Probado sobre el catálogo en vivo: U de Chile + Colo-Colo a Biobío = gratis a punto / $3.000 domicilio; Colo-Colo solo y UC + Wanderers ($38.000) pagan; Rangers al Maule sigue gratis.
- 24-nov-2026 · Windows (Áureo) · W3 · **Bandeja: «Todo el negocio»** en Ventas: lee el maestro de ventas (todas las ventas, no solo la web) con totales por período, mes a mes, canal, anuncios, productos, regiones y cuentas. Necesita el script v11 instalado en Google; sin él, avisa.
- 24-nov-2026 · Windows (Áureo) · W3 · **Bandeja con dashboard** (`bandeja/index.html`, generado desde `Panel.html` del repo Aureo): abajo en el celular (arriba en el computador) tres secciones, **Inicio · Ventas · Pedidos**. Pedidos es la bandeja de siempre, sin cambios. Todo se calcula con lo que ya entrega el script: no se guarda nada aparte ni se toca ningún pedido. Venta = pedido pagado o enviado, el día que se marcó el pago, con envío. Margen = costo actual de CATALOGO + $3.500, antes de anuncios. Probado en local con un script simulado: clave, las 5 pestañas, «Pagó a Javi», «Entregado por fuera», recarga sin borrar lo escrito, celular y computador.
- 24-nov-2026 · Mac (Áureo) · W2 + Común · **Descuento por escudos corregido**: $2.000 por cada escudo desde el segundo: 1 = $0, 2 = $2.000, 3 = $4.000, 4 = $6.000… (antes $1.000 × todos los escudos). `PROP.descPorEscudo` = 2000 y `descEscudos` = (n − 1) × 2.000; texto «por cada escudo extra».
- 24-nov-2026 · Mac (Áureo) · W1 · **Buscador sin signos**: «ohiggins», «o higgins», «o'higgins» encuentran O'Higgins; «colocolo» → Colo-Colo, «udechile» → U de Chile. Ignora tildes, mayúsculas, apóstrofes, guiones y puntos (`plano`/`coincide` en `js/vitrina.js`; también en el ingreso rápido de `js/interno.js`).
- 23-nov-2026 · Mac (Áureo) · W1 · **Volver al mismo lugar**: al entrar a un producto desde el inicio o una categoría y volver atrás, la página queda donde estaba (scroll y posición de cada franja). La ficha ahora abre arriba al instante. `retorno`/`restaurar` en `js/vitrina.js`.
- 23-nov-2026 · Mac (Áureo) · W1 · **Portada de presentación + categorías que avanzan**: el inicio ahora es una portada a pantalla completa (logo, «Tu equipo, armado por ti.», botones Ver el catálogo / Pedir uno a pedido, vitrina que cambia de foto cada 3 s y datos). Abajo, barra fija de categorías y una franja por categoría (primero «Los más vendidos») con las tarjetas avanzando solas; se deslizan con el dedo, se detienen al tocar o pasar el mouse y «Ver los N →» abre la grilla de siempre. Chip «Todo» → «🏠 Inicio». `vistaInicio`/`animarInicio` en `js/vitrina.js` + sección «Inicio» al final de `css/estilos.css`.
- 22-nov-2026 · Mac (Áureo) · W1 · **Piezas en todos los escudos**: Real Madrid «más de 2.600» (estaba vacío en `HINCHA`) y `PIEZAS` nuevo en `js/config.js` para los escudos sin apodo (Carabela 4.300, Universitario 1.200, U. de Concepción 2.300, Fernández Vial 2.100, Lota 2.300, Talleres 2.500, La Calera 1.700, Manchester 3.800), desde su grilla y redondeado hacia abajo. `js/vitrina.js` lo usa si no hay otro dato.
- 21-nov-2026 · Mac (Áureo) · W2 · **Mini de regalo con confirmación**: ya no se agrega sola; «¡Desbloqueaste una minifigura!» con «Sí, la quiero» / «No, gracias» y series (pide al menos 1). Solo la aceptada va al resumen, WhatsApp y bandeja. **Ingreso rápido** (`js/interno.js`, `#rapido`, solo modo equipo, link en la franja morada): buscador, precio editable, camisetas, mini solo si se marca, **descuento con motivo** (ya rebajado en los precios; manda `descInterno` + `motivoDesc`), envío editable y guardar en la bandeja.
- 21-nov-2026 · Áureo (Mac) · W2 · Entrega a domicilio: «Dirección (calle y número)» + casilla nueva **«Depto, casa, condominio o referencia
  (opcional)»**. A la bandeja y a WhatsApp va junto en la dirección («Av. Matta 1234 · Depto 504»); en punto Blue no sale.

- 21-nov-2026 · Áureo (Mac) · W1 · Oferta roja de la ficha: **«¿Cuántas camisetas?» 1 · 2 · 3 · 4 · 5+1🎁**, parte en 2. Cambia título, fotos,
  precio y botón («Lo quiero con 1 camiseta»), y el pack queda con esa cantidad.

- 21-nov-2026 · Áureo (Mac) · W1/W2 · **Camisetas para los 14 escudos que faltaban** (UC con su modelo de franja, Barcelona, Boca, Everton,
  Ñublense, Palestino, Real Madrid, Curicó, Puerto Montt, La Serena, Universitario, Lota, Talleres, La Calera; Carabela usa la de Magallanes).
  Ya todos los escudos muestran su par. `CAM_PAR` y `EQUIPOS_CAM` en config.js.

- 21-nov-2026 · Áureo (Mac) · W1/W2 · **Camisetas del mismo equipo junto al escudo**: en la ficha de cada escudo, recuadro rojo «🔥 Oferta
  especial» bajo el precio con el escudo + 2 camisetas de ese equipo (PAPA 1 / HIJO 10), precio tachado vs. sueltas y botón «Lo quiero con
  camisetas» (agrega el escudo y deja 2 elegidas en el pack). El paso del pack muestra ese par (antes a la U le salía la del Colo); el carrusel
  mezclado solo sale si el equipo no tiene camisetas. Primer paso: línea «👕 N camisetas del pack». Fotos `proto-camisetas/par/` (21 modelos)
  hechas por código con `Aureo/catalogo-web/camisetas_par.py`; `CAM_PAR`/`parCam` en config.js.

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
