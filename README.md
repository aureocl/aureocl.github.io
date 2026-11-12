# Catálogo Áureo — https://aureocl.github.io

Este repo **es** el catálogo web (GitHub Pages, gratis). Desde el 12-nov-2026 se edita aquí, entre Áureo y Caro,
cada uno desde su computador. Cada cambio que se sube (push) queda en línea en ~1 minuto.

## Qué hay

| Archivo | Qué es |
| --- | --- |
| `index.html` | El catálogo: portada, landing por producto (`#p/<producto>`), pedido guiado (`#pedido`) y «Pedido listo» (`#listo`) |
| `catalogo-v1.html` | Respaldo del catálogo anterior (11-nov). No se borra |
| `prototipo.html` | Redirige a `index.html`, para que no se rompan los links que ya se compartieron |
| `vistas.html` | El catálogo en computador y celular lado a lado, para revisar diseño |
| `landing/<producto>/` | Fotos de la landing de cada producto (ya con marca de agua) |
| `proto-camisetas/` | Camisetas de ejemplo por equipo y de clientes (con marca de agua) |
| `fotos/` | Foto de cada producto en el catálogo (las sube `catalogo.py` del repo privado) |

**Los precios y productos NO se cambian aquí:** salen de la planilla «Catálogo Aureo (web)», que toma los precios
de la pestaña PRECIOS del maestro. Se cambian ahí y la página se actualiza sola (hasta ~5 min).

En `index.html`, arriba, están los ajustes: `PROP` (ofertas: camisetas, colección, segundo escudo, mini de regalo,
prioridad, empaque), `URGENCIA` (fecha de corte de Navidad), `DATOS_PAGO`, `PILOTO` (landing con material real) y
`FINAL` (`false` muestra las marcas de prueba y los espacios por llenar).

## Trabajar de a dos sin pisarse

Áureo y Caro usan **la misma cuenta de GitHub** en sus dos computadores (cada uno con su propia cuenta de Claude).
No hace falta invitar a nadie: basta con traer (pull) y subir (push) los cambios.

1. **Antes de empezar:** `git pull` (o en Claude Code: «trae los últimos cambios del catálogo»).
2. **Cambios chicos**, de a uno. Al terminar cada uno: `git add` de lo que tocaste, `git commit -m "qué cambié"` y `git push`.
3. **Avisarse por WhatsApp** si alguno va a hacer un cambio grande en `index.html` (por ejemplo, rediseñar la landing),
   para que el otro no toque ese archivo mientras tanto.
4. **Si el push falla** («rejected», porque el otro subió algo antes): `git pull` y después `git push` otra vez.
5. **Si aparece un conflicto** (Git marca `<<<<<<<` en un archivo): no borrar nada a ciegas. Pedirle a Claude Code
   «resuelve el conflicto dejando los cambios de los dos» y revisar la página en el navegador antes de subir.
   Si se enreda, `git merge --abort` deja todo como estaba antes del pull.
6. Nunca subir datos privados: ni la planilla, ni ventas, ni datos de clientes. Este repo es **público**.

## Reglas que no cambian

- Nunca «oficial» en ningún texto. Precios cerrados, nunca terminados en 990.
- Fotos públicas: 500 px con marca de agua (las pasa `catalogo.py` del repo privado).
