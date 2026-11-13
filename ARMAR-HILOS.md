# Armar los hilos de la página web en un PC nuevo

Cada PC tiene su propia sección **«{AUREO} PÁGINA WEB»** con los mismos 4 hilos. Las sesiones de Claude no se
comparten entre computadores: lo que se comparte es **este repo** (reglas, tablero y registro). Por eso cada PC arma
sus hilos una vez, con este texto, y después todos trabajan igual.

## Una sola vez, en el PC nuevo
1. Tener Git y Claude (app de escritorio, pestaña Code) instalados, y la carpeta `Aureo` ya descargada.
2. Abrir una sesión en la carpeta `Aureo` y **pegarle este mensaje completo**:

---

> Vamos a armar los hilos de la página web en este PC, igual que en el otro computador.
> 1. Trae los últimos cambios del repo Aureo (`git pull`). Si no existe la carpeta del catálogo al lado de `Aureo`,
>    clónala: `git clone https://github.com/aureocl/aureocl.github.io.git`; si existe, `git pull` ahí.
> 2. Lee `CLAUDE.md`, `PENDIENTES.md`, `CAMBIOS.md` y `ARMAR-HILOS.md` de la carpeta del catálogo.
> 3. Crea en la barra lateral la sección **«{AUREO} PÁGINA WEB»** (si ya existe, úsala) y abre en ella 4 sesiones,
>    cada una con su brief tomado de la tabla «Los 4 hilos» de `ARMAR-HILOS.md`: **W1 · Vitrina**, **W2 · Embudo y
>    pedido**, **W3 · Backend y panel** y **W4 · Tráfico y medición**. Cada una trabaja en la carpeta del catálogo,
>    sigue el `CLAUDE.md` y en su primera vuelta solo lee, revisa `PENDIENTES.md` y me propone qué hacer.
> 4. Avísame cuando estén las 4.

---

## Los 4 hilos (brief para cada sesión)

| Hilo | Brief |
| --- | --- |
| **W1 · Vitrina** | Portada, catálogo, landing/ficha de cada producto, diseño y animaciones. Archivos: `js/vitrina.js`, `landing/`, `proto-camisetas/`, estilos de vitrina en `css/estilos.css`. |
| **W2 · Embudo y pedido** | Carrito, ofertas paso a paso, entrega, «Pedido listo», salto a WhatsApp («PEDIDO: AU-…») o a transferencia. Archivos: `js/pedido.js`, estilos de pedido; ajustes `PROP`, `DATOS_PAGO`, `URGENCIA` en `js/config.js` (común). |
| **W3 · Backend y panel** | Guardar pedidos en Cloudflare D1, panel `/admin` con login (solo Áureo y Caro), Workers, seguridad. Archivos: `api/`, `admin/`. Necesita el conector de Cloudflare en la cuenta de Claude de ese PC. |
| **W4 · Tráfico y medición** | Dominio, píxel y conversiones de Meta, aviso de cookies, velocidad, Google, retargeting. Archivos: `js/medicion.js`, configuración de dominio. |

Todos: `git pull` antes de empezar; tomar la tarea en `PENDIENTES.md` (con push) antes de trabajarla; probar en
local; «súbelo» = commit + push (queda en vivo en ~1 minuto); anotar en `CAMBIOS.md` con el nombre del PC
(Áureo o Caro).

## Cómo se ve lo que hace el otro PC
- Lo que el otro subió aparece en la página en vivo y llega a tu PC con `git pull`.
- `PENDIENTES.md` dice quién tiene qué tarea en este momento; `CAMBIOS.md`, qué se cambió y quién.
- Si los dos van a trabajar el mismo hilo el mismo día, avisarse por WhatsApp.
