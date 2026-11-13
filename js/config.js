/* Ajustes y datos fijos: FINAL, planilla, WhatsApp, equipos, ofertas (PROP), datos de pago, urgencia.
   Parte de: todos (cambios con cuidado). Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
  /* Catálogo Áureo (desde 2026-11-12 la versión con landing y checkout guiado; respaldo de la anterior en catalogo-v1.html).
     FINAL = true oculta las marcas de prueba y los espacios sin material. Precios: planilla «Catálogo Aureo (web)» ← PRECIOS del maestro. */
  const FINAL = true;
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpK1e9OMdtPyf5vG9DKsLMx9tUmnhjs_3ckbSN4UnbKXZhn7Jxz86oyfhc9xVWI7ZMDVq_aleGiCwL/pub?gid=390431306&single=true&output=csv";
  const WHATSAPP = "56991412645";
/* ---------- Datos ---------- */
const HINCHA = {"colo-colo":["Albo","2.500"],"universidad-de-chile":["Bullanguero","2.300"],"universidad-catolica":["Cruzado","1.000"],"santiago-wanderers":["Caturro","1.000"],"everton":["Ruletero","2.800"],"san-luis-de-quillota":["Canario","1.400"],"o-higgins":["Celeste","1.600"],"cobreloa":["Loíno","1.500"],"coquimbo-unido":["Pirata","2.500"],"deportes-iquique":["Dragón Celeste","2.800"],"nublense":["Diablo Rojo","1.200"],"huachipato":["Acerero","2.400"],"deportes-concepcion":["Lila","2.400"],"rangers-de-talca":["Rojinegro","2.300"],"curico-unido":["Tortero","2.800"],"deportes-temuco":["Pije","2.500"],"palestino":["Tino-Tino","1.500"],"union-espanola":["Hispano","2.300"],"audax-italiano":["Itálico","2.300"],"magallanes":["Carabelero","2.800"],"deportes-la-serena":["Papayero","2.100"],"deportes-puerto-montt":["Delfín","2.700"],"boca-juniors":["Xeneize","1.600"],"river-plate":["Millonario","2.300"],"barcelona":["Barcelonista",""],"real-madrid":["Merengue",""]};
const ALIAS = {"u-de-chile":"universidad-de-chile","uc":"universidad-catolica"};
const ORDEN = ["Escudos de fútbol","Camisetas personalizadas","Figuras 3D mini","Figuras 3D grandes","Figuras 2D","Música","Personalizados"];
/* Camisetas reales hechas para clientes (Laboratorio). En la versión publicada van con marca de agua. */
const CAM_BASE = "proto-camisetas/";
const CAMISETAS = [["manu-30.jpg","MANU 30","Colo-Colo"],["lucho-10.jpg","LUCHO 10","O'Higgins"],["sofi-22.jpg","SOFI 22","Deportes Temuco"],["jimi-18.jpg","JIMI 18","Rangers de Talca"],["agus-30.jpg","AGUS 30","Deportes Iquique"],["trini-2.jpg","TRINI 2","Colo-Colo"],["marce-10.jpg","MARCE 10","Audax Italiano"],["jara-7.jpg","JARA 7","Unión Española"],["xan-23.jpg","XAN 23","Huachipato"],["seba-20.jpg","SEBA 20","Magallanes"],["bruno-19.jpg","BRUNO 19","Deportes Temuco"],["gotti-11.jpg","GOTTI 11","Cobreloa"],["benja-4.jpg","BENJA 4","O'Higgins"],["coni-12.jpg","CONI 12","Rangers de Talca"]];
const carrusel = () => { const c = CAMISETAS.map(([f,n,club])=>`<div class="cam"><img src="${CAM_BASE}${f}" alt="Camiseta ${n}" loading="lazy"><b>${n}</b><span>${club}</span></div>`).join("");
  return `<div class="carrusel"><div class="cinta">${c}${c}</div></div>`; };
/* Propuestas para subir el ticket (D7). Cada una se apaga con false; Áureo decide cuáles quedan. */
const PROP = { coleccionDesc:0.2, barra:true, regaloMas:10000, porPoco:true, empaque:2000, segundoDesc:3000, camRegaloDesde:35000, prioridad:3000 };
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
/* Datos de transferencia: los completa Áureo (no van en el repositorio). */
const DATOS_PAGO = [["Banco","(lo completa Áureo)"],["Tipo de cuenta","(lo completa Áureo)"],["N° de cuenta","(lo completa Áureo)"],["RUT","(lo completa Áureo)"],["Nombre","(lo completa Áureo)"],["Correo","(lo completa Áureo)"]];
/* Urgencia real (Navidad): se muestra hasta la fecha de corte. Fecha por confirmar con Áureo (15–18 dic). */
const URGENCIA = { hasta:"2026-12-15", texto:"🎄 Pagando hasta el 15 de diciembre te llega antes del 24" };
/* Oferta única del paso 2: completar la colección del club con descuento. Lo «próximo» se muestra solo como ejemplo. */
const PROXIMOS = {}; /* ej. {"colo-colo":[["Copa del Cacique","Próximamente"]]} */
const INSTAGRAM = "https://www.instagram.com/aureo.cl/";
