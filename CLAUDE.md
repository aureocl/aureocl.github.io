# Página web Áureo — reglas para Claude (los dos PCs)

Este repo es **la página web de Áureo** (catálogo, landings y pedido guiado). La trabajan Áureo y Caro, cada uno
desde su computador y su propio Claude, con **las mismas reglas: las de este archivo**. Lo que se sube aquí queda
en vivo para los clientes en ~1 minuto.

## Antes de hacer cualquier cosa
1. `git pull` (traer lo que subió el otro PC).
2. Leer `PENDIENTES.md`: si la tarea ya la tiene el otro PC («en curso»), **no tomarla**; avisar.
3. Anotar en `PENDIENTES.md` la tarea que se toma: hilo · qué · quién (Áureo o Caro) · «en curso». Commit + push de
   ese cambio **antes** de empezar, para que el otro PC lo vea.

## Los 4 hilos (sección «{AUREO} PÁGINA WEB» en cada PC; para armarla en un PC nuevo ver `ARMAR-HILOS.md`) y sus archivos
Cada hilo **solo toca sus archivos**. Si necesita cambiar un archivo de otro hilo o uno común, lo anota en
`PENDIENTES.md` y lo deja para ese hilo (o avisa por WhatsApp).

| Hilo | Parte de la cadena | Archivos |
| --- | --- | --- |
| **W1 · Vitrina** | Portada, catálogo, landing/ficha de cada producto, diseño y animaciones | `js/vitrina.js`, `landing/`, `proto-camisetas/`, `css/estilos.css` (secciones de vitrina) |
| **W2 · Embudo y pedido** | Carrito, ofertas (camisetas, colección, mini de regalo, prioridad), entrega, «Pedido listo», salto a WhatsApp | `js/pedido.js`, `css/estilos.css` (secciones de pedido) |
| **W3 · Backend y panel** | Guardar pedidos (Cloudflare D1), panel `/admin`, Workers, seguridad | `api/`, `admin/` (por crear) |
| **W4 · Tráfico y medición** | Dominio, píxel y conversiones de Meta, velocidad, Google, retargeting | `js/medicion.js`, configuración de dominio |
| **Comunes** (con cuidado, avisar) | Ajustes y datos fijos, utilidades, arranque | `js/config.js`, `js/base.js`, `js/app.js`, `index.html` |

`index.html` carga los scripts en este orden: `config → medicion → base → vitrina → pedido → app`. Son scripts
clásicos (sin módulos) y comparten variables globales: no renombrar una función o variable sin buscar dónde se usa.

## Cómo se trabaja un cambio
1. Ver el cambio en local antes de subirlo: servir esta carpeta (`python -m http.server 8792`) y abrir
   http://localhost:8792. Revisar en vista de celular y de computador, y que la consola no tenga errores.
2. Probar el flujo completo si se tocó el pedido: agregar un escudo → pasos de ofertas → entrega → «Pedido listo».
3. **«Súbelo»** = commit con mensaje claro + `git push`. Si el push falla, `git pull` y push otra vez. Si hay
   conflicto, resolverlo dejando los cambios de los dos y volver a probar en local.
4. Anotar en `CAMBIOS.md` (arriba): fecha · PC · hilo · qué cambió. Mover la tarea a «listo» en `PENDIENTES.md`.

## Dónde se publica
- **GitHub Pages**: https://aureocl.github.io (link y QR que ya tienen los clientes).
- **Cloudflare**: Worker `aureocl-github-io-catalogoweb`, conectado a este repo; publica solo con cada push.
  Será la principal cuando se conecte el dominio propio. **Ojo: `aureo.pages.dev` NO es nuestro** (es un casino).

## Reglas del negocio que no cambian
- **Precios y productos no se escriben aquí**: salen de la planilla «Catálogo Aureo (web)» ← PRECIOS del maestro.
  Precios cerrados, **nunca terminados en 990**.
- Nunca decir «oficial» (licencias). No menospreciar la camiseta. El armado es entretención.
- Fotos de producto siempre reales o a escala real (nunca agrandar la pieza). Fotos públicas en alta (hasta 1200 px) y **sin marca de agua** (Áureo, 13-nov).
- **Este repo es público**: nunca subir ventas, datos de clientes, claves, tokens ni la planilla. Las claves van en
  los secretos de Cloudflare.
- Todo lo visible en español simple, tuteo chileno.
