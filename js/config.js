/* Ajustes y datos fijos: FINAL, planilla, WhatsApp, equipos, ofertas (PROP), datos de pago, urgencia.
   Parte de: todos (cambios con cuidado). Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
  /* Catálogo Áureo (desde 2026-11-12 la versión con landing y checkout guiado; respaldo de la anterior en catalogo-v1.html).
     FINAL = true oculta las marcas de prueba y los espacios sin material. Precios: planilla «Catálogo Aureo (web)» ← PRECIOS del maestro. */
  const FINAL = true;
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpK1e9OMdtPyf5vG9DKsLMx9tUmnhjs_3ckbSN4UnbKXZhn7Jxz86oyfhc9xVWI7ZMDVq_aleGiCwL/pub?gid=390431306&single=true&output=csv";
  const WHATSAPP = "56991412645";
  /* Bandeja de pedidos (Apps Script «Aureo · Pedidos web»): cada pedido llega como «Pendiente» y al marcar el pago pasa al maestro. Vacío = apagado. */
  const PEDIDOS_URL = "https://script.google.com/macros/s/AKfycbyJwpVPwnc0EVQPGTlspepBK-zva0MWBjMAvwbXVlOlazQt22XV7UJyCg_qh-M9lYxu/exec";
/* ---------- Datos ---------- */
const HINCHA = {"colo-colo":["Albo","2.500"],"universidad-de-chile":["Bullanguero","2.300"],"universidad-catolica":["Cruzado","1.000"],"santiago-wanderers":["Caturro","1.000"],"everton":["Ruletero","2.800"],"san-luis-de-quillota":["Canario","1.400"],"o-higgins":["Celeste","1.600"],"cobreloa":["Loíno","1.500"],"coquimbo-unido":["Pirata","2.500"],"deportes-iquique":["Dragón Celeste","2.800"],"nublense":["Diablo Rojo","1.200"],"huachipato":["Acerero","2.400"],"deportes-concepcion":["Lila","2.400"],"rangers-de-talca":["Rojinegro","2.300"],"curico-unido":["Tortero","2.800"],"deportes-temuco":["Pije","2.500"],"palestino":["Tino-Tino","1.500"],"union-espanola":["Hispano","2.300"],"audax-italiano":["Itálico","2.300"],"magallanes":["Carabelero","2.800"],"deportes-la-serena":["Papayero","2.100"],"deportes-puerto-montt":["Delfín","2.700"],"boca-juniors":["Xeneize","1.600"],"river-plate":["Millonario","2.300"],"barcelona":["Barcelonista",""],"real-madrid":["Merengue",""],"san-marcos-de-arica":["Bravo del Morro","2.700"]};
const ALIAS = {"u-de-chile":"universidad-de-chile","uc":"universidad-catolica","barcelona-borde-amarillo":"barcelona"};
const ORDEN = ["Escudos de fútbol","Camisetas personalizadas","Figuras 3D mini","Figuras 3D grandes","Figuras 2D","Música","Personalizados"];
/* Camisetas reales hechas para clientes (Laboratorio). En la versión publicada van con marca de agua. */
const CAM_BASE = "proto-camisetas/";
const CAMISETAS = [["manu-30.jpg","MANU 30","Colo-Colo"],["lucho-10.jpg","LUCHO 10","O'Higgins"],["sofi-22.jpg","SOFI 22","Deportes Temuco"],["jimi-18.jpg","JIMI 18","Rangers de Talca"],["agus-30.jpg","AGUS 30","Deportes Iquique"],["trini-2.jpg","TRINI 2","Colo-Colo"],["marce-10.jpg","MARCE 10","Audax Italiano"],["jara-7.jpg","JARA 7","Unión Española"],["xan-23.jpg","XAN 23","Huachipato"],["seba-20.jpg","SEBA 20","Magallanes"],["bruno-19.jpg","BRUNO 19","Deportes Temuco"],["gotti-11.jpg","GOTTI 11","Cobreloa"],["benja-4.jpg","BENJA 4","O'Higgins"],["coni-12.jpg","CONI 12","Rangers de Talca"]];
const carrusel = () => { const c = CAMISETAS.map(([f,n,club])=>`<div class="cam"><img src="${CAM_BASE}${f}" alt="Camiseta ${n}" loading="lazy"><b>${n}</b><span>${club}</span></div>`).join("");
  return `<div class="carrusel"><div class="cinta">${c}${c}</div></div>`; };
/* Propuestas para subir el ticket (D7). Cada una se apaga con false; Áureo decide cuáles quedan. */
/* regaloMinProducto (Áureo, 20-nov-2026): para la mini de regalo solo cuentan productos desde $13.000 (y el pack de camisetas);
   las minis y figuras chicas no suman, y en «Seguir mirando» no aparecen. La meta es lo que llevaba (mínimo $13.000) + regaloMas.
   camRegaloCada: llevando 5 camisetas del pack, la 6.ª va de regalo. */
const PROP = { coleccionDesc:0.2, barra:true, regaloMas:10000, regaloMinProducto:13000, porPoco:true, empaque:2000, descPorEscudo:1000, camRegaloCada:5, prioridad:3000 };
const tag = l => FINAL ? "" : `<span class="prop">Propuesta ${l}</span><br>`;
/* Camiseta de ejemplo por equipo (AUREO 10, del Laboratorio): lo que ve el cliente al elegir el equipo de cada camiseta. */
const EQUIPOS_CAM = [["Colo-Colo","ej-colo-colo-local.jpg"],["Colo-Colo (visita)","ej-colo-colo-visita.jpg"],["U de Chile","ej-universidad-de-chile-local.jpg"],["Audax Italiano","ej-audax-italiano-local.jpg"],["Cobreloa","ej-cobreloa-local.jpg"],["Deportes Concepción","ej-deportes-concepcion-local.jpg"],["Deportes Iquique","ej-deportes-iquique-local.jpg"],["Deportes Temuco","ej-deportes-temuco-local.jpg"],["Huachipato","ej-huachipato-local.jpg"],["Magallanes","ej-magallanes-local.jpg"],["O'Higgins","ej-o-higgins-local.jpg"],["Rangers de Talca","ej-rangers-de-talca-local.jpg"],["River Plate","ej-river-plate-local.jpg"],["San Luis de Quillota","ej-san-luis-local.jpg"],["Santiago Wanderers","ej-santiago-wanderers-local.jpg"],["Unión Española","ej-union-espanola-local.jpg"]];
const OTRO_EQ = "Otro equipo (lo vemos por WhatsApp)";
const fotoEq = eq => { const e = EQUIPOS_CAM.find(x=>x[0]===eq); return e ? CAM_BASE+e[1] : "isotipo.svg"; };
/* Landing piloto con material real (Drive «5 Imágenes…/Colo Colo» y Estudio). Fotos a 500 px con marca de agua. */
const LANDING_BASE = "landing/";
const PILOTO = {"colo-colo": {
  carpeta: "colo-colo/", galeria: ["hero","pared","detalle","caja","armando","real"],
  pared: "pared", armando: "armando", caja: "caja", real: "real",
  clientes: [["cliente1","Ya en la pared de un Albo"],["cliente2","«Muy entretenido, y eso que soy malo para las manualidades»"],["real","Así queda armado, de verdad"]],
  cita: "Ya armé el escudo del más grande. Gracias, fue muy entretenido, y eso que soy malo para las manualidades.",
  hincha: "Desde 1925, el Cacique. En 1991, el primer equipo chileno campeón de América. Y sobre el escudo, la franja negra por David Arellano, su fundador: la vas a armar fila por fila.",
}};
const fp = (pl, k) => LANDING_BASE + pl.carpeta + k + ".jpg";
/* Cuentas para transferir (Áureo, 20-nov-2026): salen en la pantalla «Paga y envía» antes de WhatsApp, con botón Copiar.
   LAS ESCRIBE ÁUREO (o Caro), no Claude. Formato de cada cuenta:
   { quien:"Javi", datos:[["Banco","…"],["Tipo de cuenta","…"],["N° de cuenta","…"],["RUT","…"],["Nombre","…"],["Correo","…"]] }
   Una cuenta con «datos» vacío no se muestra. Si ninguna tiene datos, la página dice «te mandamos los datos por WhatsApp». */
const CUENTAS = [
  { quien:"Javi", datos:[] },
  { quien:"Caro", datos:[] },
];
/* Urgencia real (Navidad): se muestra hasta la fecha de corte. Fecha por confirmar con Áureo (15–18 dic). */
const URGENCIA = { hasta:"2026-12-10", texto:"🎄 Haz tu pedido hasta el 10 de diciembre y te llega antes de Navidad" };
/* Oferta única del paso 2: completar la colección del club con descuento. Lo «próximo» se muestra solo como ejemplo. */
const PROXIMOS = {}; /* ej. {"colo-colo":[["Copa del Cacique","Próximamente"]]} */
/* «Los más vendidos» (Áureo, 20-nov-2026): sale arriba en la portada (Todo, sin búsqueda), en este orden.
   Slug = nombre del producto en la planilla, en minúsculas, sin tildes y con guiones. Vacío = no sale la sección. */
const MAS_VENDIDOS = ["colo-colo","u-de-chile","uc","santiago-wanderers"];
const INSTAGRAM = "https://www.instagram.com/aureo.cl/";
/* Tamaños o versiones de un mismo producto (Áureo, 19-nov-2026). Si las etiquetas son Chico/Mediano/Grande dice
   «Elige el tamaño»; si no, «Elige la versión». Cada grupo: [slug, etiqueta, piezas redondeadas hacia abajo (opcional;
   si falta, el primero usa las de HINCHA)]. El primero es el que sale
   en el catálogo; los demás se eligen dentro de su ficha (cambian foto, medida y precio). Cada uno sigue siendo su propia
   fila en la planilla. El slug es el nombre del producto en minúsculas, sin tildes y con guiones. */
const VARIANTES = [
  [["boca-juniors","Chico"],["boca-juniors-mediano","Mediano","1.900"]],
  [["deportes-iquique","Actual"],["deportes-iquique-clasico","Clásico","3.000"]],
  [["deportes-concepcion","Actual"],["deportes-concepcion-leon","León","2.100"]],
  [["san-marcos-de-arica","Mediano","2.700"],["san-marcos-de-arica-grande","Grande","4.700"]],
  [["barcelona-borde-amarillo","Borde amarillo","2.400"],["barcelona","Borde café","2.400"]],
];
VARIANTES.forEach(g=>g.slice(1).forEach(([s])=>{if(!ALIAS[s])ALIAS[s]=ALIAS[g[0][0]]||g[0][0]}));
