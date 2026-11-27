/* Vitrina: portada, catálogo por categoría y ficha/landing de cada producto.
   Parte de: W1 · Vitrina. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
/* ---------- Vistas ---------- */
/* Pedidos que se muestran (Áureo, 25-nov-2026): se sube de 50 en 50 cuando corresponda (+400, +450…). */
const PEDIDOS="+350";
let cat="Todo";
/* Tamaños/versiones (VARIANTES en config.js): solo el primero de cada grupo sale en el catálogo. */
const grupoDe=s=>VARIANTES.find(g=>g.some(([x])=>x===s));
const esVarSec=p=>{const g=grupoDe(p.slug);return!!(g&&g[0][0]!==p.slug&&porSlug(g[0][0]))};
const textoVar=p=>{const g=grupoDe(p.slug);return g?g.map(([s,l])=>(porSlug(s)?.nombre||"")+" "+l).join(" "):""};
const esTam=g=>g.some(([,l])=>/^(chico|mediano|grande|gigante)$/i.test(l));
/* Buscador sin signos (Áureo, 24-nov-2026): «ohiggins», «o higgins» y «o'higgins» encuentran O'Higgins; «colocolo» encuentra Colo-Colo.
   Sin tildes, mayúsculas, apóstrofes, guiones ni puntos, en lo que se escribe y en el producto. */
const plano=s=>norm(s).replace(/[^a-z0-9\s]/g,"");
const coincide=(texto,q)=>{const h=norm(texto).replace(/[^a-z0-9\s]/g," ")+" "+plano(texto)+" "+plano(texto).replace(/\s+/g,"");return plano(q).split(/\s+/).filter(Boolean).every(w=>h.includes(w))};
let scrollVar=null;
function modo(m,titulo=""){document.body.className=m+(FINAL?" final":"");document.getElementById("top").classList.toggle("en-ficha",m!=="en-catalogo");document.getElementById("titulo").textContent=titulo;document.getElementById("cab").style.display=m==="en-catalogo"?"":"none"}

function tarjeta(p){
  const tc=tramosCombo();
  return `<article class="card" data-ir="${p.slug}">
    <div class="foto">${img(p)}${p.etq?`<span class="etq">${esc(p.etq)}</span>`:""}</div>
    <div class="info"><div class="nombre">${esc(p.nombre)}</div>${p.tam?`<div class="tam">${esc(p.tam)}${grupoDe(p.slug)&&!esVarSec(p)?` · ${grupoDe(p.slug).filter(([s])=>porSlug(s)).length} ${esTam(grupoDe(p.slug))?"tamaños":"versiones"}`:""}</div>`:""}
    ${p.precio?`<div class="precio">${p.antes>p.precio?`<s>${clp(p.antes)}</s>`:""}${clp(p.precio)}${p.antes>p.precio?(/lanzamiento/i.test(p.etq)?`<span class="nota-lanz">Precio de lanzamiento · después ${clp(p.antes)}</span>`:`<span class="nota-lanz">Ahorras ${clp(p.antes-p.precio)}</span>`):""}</div>`:`<div class="precio consultar">${esc(p.det||"Precio a consultar")}</div>`}
    ${p.precio?`<button class="btn-agregar" data-add="${p.slug}">+ Agregar</button>`:""}</div></article>`;
}
const masVendidos=()=>(typeof MAS_VENDIDOS!=="undefined"?MAS_VENDIDOS:[]).map(porSlug).filter(p=>p&&p.precio);
function vistaCatalogo(){
  /* Inicio nuevo (26-nov-2026): sin búsqueda = Inicio; con búsqueda = página de resultados. */
  if(cat==="buscar"||(typeof PAGS!=="undefined"&&PAGS[cat]))cat="Todo";
  if(norm(document.getElementById("buscar").value)){vistaCategoria("buscar");return}
  if(cat==="Todo"){vistaInicio();return}
  modo("en-catalogo");
  const cats=[...new Set(P.map(p=>p.cat))].sort((a,b)=>{const i=ORDEN.indexOf(a),j=ORDEN.indexOf(b);return(i<0?99:i)-(j<0?99:j)});
  const q=norm(document.getElementById("buscar").value);
  const L=P.filter(p=>!esVarSec(p)&&(cat==="Todo"||p.cat===cat)&&(!q||coincide(p.nombre+" "+p.cat+" "+(p.tema||"")+" "+textoVar(p),q)));
  const tc=tramosCombo(),c=comboFila(),s=solaFila();
  document.getElementById("vista").innerHTML=`
  <nav class="chips">${["Todo",...cats].map(x=>`<button class="chip${x===cat?" activa":""}" data-cat="${esc(x)}">${x==="Todo"?"🏠 Inicio":esc(x)}</button>`).join("")}</nav>
  <div class="wrap">${L.length?cats.filter(x=>L.some(p=>p.cat===x)).map(x=>{const ps=L.filter(p=>p.cat===x);
    return `<section><h2 class="sec">${esc(x)}<small>${ps.length}</small></h2>
    <div class="grilla">${ps.map(tarjeta).join("")}</div></section>`}).join(""):`<div class="a-pedido"><p class="serif" style="font-size:26px;margin:0">¿No está «${esc(q)}»?</p><p>Lo diseñamos a pedido: nos mandas la imagen, te decimos si se puede y te damos el precio.</p><a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero un escudo a pedido de: "+q)}">Pedir el mío por WhatsApp</a></div>`}</div>
  <footer><a class="avisame" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a><br><br>Precios en pesos chilenos · Pago por transferencia, coordinado por WhatsApp.</footer>`;
  restaurar();
}

/* ---------- Inicio «Arma lo que amas» + menú + página por categoría (Áureo, 26-nov-2026) ----------
   Reemplaza la portada con franjas del 22-nov. Prueba aprobada en Aureo/web/04-diseno/home-prueba/.
   · Portada con fotos de distintas líneas que van cambiando, y una frase dorada que cambia con ellas.
   · Menú desplegable bajo el buscador (computador) y ☰ Menú lateral (celular), armado solo desde la planilla.
   · Cada categoría tiene su página: #c/<id> (sirve para anuncios, WhatsApp e Instagram). Fútbol y Básquetbol van aparte.
   · Escudos internacionales = lista INTL; todo escudo que no esté ahí cuenta como chileno.
   · Una categoría nueva de la planilla que no calce con ninguna página aparece sola en el menú, con su página. */
const waLink=t=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;
const INTL=["barcelona","boca-juniors","real-madrid","river-plate","universitario-de-deportes","talleres","manchester-united","cruzeiro"];
const esIntl=p=>INTL.some(s=>p.slug===s||p.slug.startsWith(s+"-"));
const esEsc=p=>p.cat==="Escudos de fútbol";
const esMascota=p=>/mascota/i.test(p.nombre);
const esFigura=p=>/^Figuras/.test(p.cat);
const TEMAS_ORDEN=["Pokémon","Dragon Ball","Naruto","One Piece","Marvel","Disney","Videojuegos","Minecraft","Los Simpson","Bob Esponja","South Park","Hello Kitty y Kuromi","Harry Potter","KPop Demon Hunters"];
const TEMAS_ICO={"Pokémon":"⚡","Dragon Ball":"🐉","Naruto":"🍥","One Piece":"🏴‍☠️","Marvel":"🦸","Disney":"🏰","Videojuegos":"🎮","Minecraft":"⛏️","Los Simpson":"🍩","Bob Esponja":"🍍","South Park":"❄️","Hello Kitty y Kuromi":"🎀","Harry Potter":"🪄","KPop Demon Hunters":"🎤","Otros":"🧩"};
const visibles=()=>P.filter(p=>!esVarSec(p));
const PAGS={
  "escudos-chilenos":{nom:"Escudos chilenos",ico:"🏟️",frase:"Tu club chileno, pieza por pieza.",f:p=>esEsc(p)&&!esIntl(p),rep:"colo-colo"},
  "escudos-internacionales":{nom:"Escudos internacionales",ico:"🌎",frase:"Los grandes del mundo, en tu pared.",f:p=>esEsc(p)&&esIntl(p),rep:"boca-juniors"},
  "camisetas":{nom:"Camisetas con tu nombre",ico:"👕",frase:"Con tu nombre y tu número, en mini bloques.",f:p=>p.cat==="Camisetas personalizadas",img:()=>parCam(porSlug("colo-colo"))[0]},
  "basquetbol":{nom:"Básquetbol",ico:"🏀",frase:"Tu equipo de la NBA, en tu pared.",f:p=>p.cat==="Básquetbol"},
  "musica":{nom:"Cuadros de música",ico:"🎵",frase:"Tu disco favorito, en tu pared.",f:p=>p.cat==="Música"},
  "figuras-3d-mini":{nom:"Figuras 3D mini",ico:"🧸",frase:"Tus personajes, chiquititos y para la repisa.",f:p=>p.cat==="Figuras 3D mini"},
  "figuras-3d-grandes":{nom:"Figuras 3D grandes",ico:"🎮",frase:"Para el escritorio o la repisa.",f:p=>p.cat==="Figuras 3D grandes"},
  "figuras-2d":{nom:"Figuras 2D",ico:"🖼️",frase:"Cuadros para colgar o regalar.",f:p=>p.cat==="Figuras 2D"},
  "mascotas":{nom:"Tu mascota en píxel",ico:"🐶",frase:"Nos mandas la foto y la armamos en mini bloques.",f:esMascota},
  "a-pedido":{nom:"Diseño a pedido",ico:"✨",frase:"¿No está el tuyo? Lo diseñamos para ti.",f:p=>p.cat==="Personalizados"&&!esMascota(p)}};
const PERSONAS=[["regalo-papa","⚽","Para el papá hincha","Papá hincha",p=>esEsc(p)||p.cat==="Básquetbol"],["regalo-pareja","❤️","Para tu pareja","Tu pareja",p=>["Música","Figuras 2D"].includes(p.cat)||esMascota(p)],["regalo-ninos","🧒","Para los niños","Los niños",p=>p.cat==="Figuras 3D mini"],["regalo-fan","🎮","Para el amigo fan","El amigo fan",p=>["Figuras 3D grandes","Figuras 3D mini","Figuras 2D"].includes(p.cat)],["regalo-mascota","🐶","Para quien tiene mascota","Quien tiene mascota",esMascota]];
const TRAMOS=[["hasta-10000","Hasta $10.000",0,10000],["hasta-20000","Hasta $20.000",10001,20000],["hasta-30000","Hasta $30.000",20001,30000],["sobre-30000","Más de $30.000",30001,1e9]];
PERSONAS.forEach(([id,ico,nom,corto,f])=>PAGS[id]={nom,ico,corto,frase:"Ideas de regalo. Te lo mandamos directo a quien lo recibe.",f,regalo:1});
TRAMOS.forEach(([id,nom,a,b])=>PAGS[id]={nom:"Regalos: "+nom.toLowerCase(),ico:"💸",corto:nom,frase:"Ideas de regalo para tu presupuesto.",f:p=>p.precio>=a&&p.precio<=b,regalo:1});
const GRUPOS=[
  {id:"futbol",nom:"Fútbol",ico:"⚽",frase:"Escudos de tu club y camisetas con tu nombre.",subs:["escudos-chilenos","escudos-internacionales","camisetas"]},
  {id:"basquetbol",nom:"Básquetbol",ico:"🏀",subs:["basquetbol"]},
  {id:"musica",nom:"Música",ico:"🎵",subs:["musica"]},
  {id:"tematicas",nom:"Temáticas",ico:"🎬",frase:"Tus series, películas y videojuegos favoritos, en 3D y en 2D.",subs:[],carpeta:1},
  {id:"personalizados",nom:"Personalizados",ico:"✨",frase:"Tu mascota o el diseño que quieras.",subs:["mascotas","a-pedido"]},
  {id:"regalos",nom:"Regalos",ico:"🎁",frase:"Te ayudamos a elegir: por persona o por presupuesto.",subs:[...PERSONAS.map(x=>x[0]),...TRAMOS.map(x=>x[0])]}];
let paginasListas=false;
function armarPaginas(){
  if(paginasListas)return;paginasListas=true;
  /* Temáticas (antes «Figuras»): una carpeta por serie o personaje. La serie va en la planilla después de « · » en la
     categoría (ej. «Figuras 3D mini · Pokémon»); las figuras sin serie quedan en «Otros». */
  const temaDe=p=>p.tema||"Otros",pos=t=>{const i=TEMAS_ORDEN.indexOf(t);return t==="Otros"?999:i<0?500:i};
  const temas=[...new Set(visibles().filter(esFigura).map(temaDe))].sort((a,b)=>pos(a)-pos(b)||a.localeCompare(b,"es"));
  const ids=temas.map(t=>{const id=PAGS[slug(t)]?"tema-"+slug(t):slug(t);PAGS[id]={nom:t,ico:TEMAS_ICO[t]||"🎬",frase:t==="Otros"?"Más figuras para armar.":`Figuras de ${t} para armar.`,f:p=>esFigura(p)&&temaDe(p)===t};return id});
  GRUPOS.find(g=>g.id==="tematicas").subs=ids;
  const base=Object.keys(PAGS).filter(k=>!PAGS[k].regalo);
  [...new Set(visibles().filter(p=>!base.some(k=>PAGS[k].f(p))).map(p=>p.cat))].forEach(c=>{const id=slug(c);
    PAGS[id]={nom:c,ico:"🧩",frase:"Lo nuevo de Áureo.",f:p=>p.cat===c,nueva:1};GRUPOS.splice(GRUPOS.length-1,0,{id,nom:c,ico:"🧩",subs:[id]})});
  GRUPOS.forEach(g=>{if((g.subs.length>1||g.carpeta)&&!PAGS[g.id])PAGS[g.id]={nom:g.nom,ico:g.ico,frase:g.frase,f:p=>g.subs.some(s=>PAGS[s].f(p)),grupo:1}});
  PAGS.todo={nom:"Todo el catálogo",ico:"🧩",frase:"Todo lo que puedes armar con Áureo.",f:()=>true};
}
const grupoDePag=id=>GRUPOS.find(g=>g.id===id||g.subs.includes(id));
const prods=id=>visibles().filter(p=>PAGS[id].f(p)&&(!PAGS[id].regalo||p.precio));
const desdeDe=id=>{const v=prods(id).map(p=>p.precio).filter(Boolean);return v.length?Math.min(...v):0};
const fotoPag=id=>{const g=PAGS[id];if(g.img)return g.img();const r=(g.rep&&porSlug(g.rep))||prods(id).find(p=>p.precio)||prods(id)[0];return r?fotoDe(r):"isotipo.svg"};
const subsCon=g=>g.subs.filter(s=>PAGS[s]&&prods(s).length);

/* ---------- Menú: desplegable (computador) y lateral (celular), dentro de la barra de arriba ---------- */
let menuListo=false;
function armarMenu(){
  if(menuListo)return;menuListo=true;armarPaginas();
  const top=document.getElementById("top"),gs=GRUPOS.filter(g=>subsCon(g).length);
  top.insertAdjacentHTML("afterbegin",`<button type="button" class="mg-hamb" id="mgHamb" aria-label="Abrir menú" aria-expanded="false" aria-controls="mgCajon">☰</button><a class="mg-logo" href="#" aria-label="Áureo, ir al inicio"><img src="logo.svg" alt="Áureo"></a>`);
  top.insertAdjacentHTML("beforeend",`<nav class="mg-menu" aria-label="Categorías"><div class="mg-fila">`+
    `<div class="mg-grupo"><a href="#c/todo">Todo</a></div>`+gs.map(g=>{const ss=subsCon(g);
    if(ss.length===1&&!g.frase)return `<div class="mg-grupo" data-g="${g.id}"><a href="#c/${ss[0]}">${g.ico} ${esc(g.nom)}</a></div>`;
    const ver=PAGS[g.id]&&g.id!=="regalos"?`<a class="mg-ver" href="#c/${g.id}">Ver todo ${esc(g.nom)} →</a>`:"";
    return `<div class="mg-grupo" data-g="${g.id}"><button type="button" aria-expanded="false">${g.ico} ${esc(g.nom)}</button>
      <div class="mg-panel"><div class="mg-panel-in"><div class="mg-lista">${ss.map(s=>`<a href="#c/${s}"><b>${PAGS[s].ico} ${esc(PAGS[s].corto||PAGS[s].nom)}</b><small>${prods(s).length}${desdeDe(s)?" · desde "+clp(desdeDe(s)):""}</small></a>`).join("")}</div>${ver}
      <a class="mg-foto" href="#c/${ss[0]}"><img src="${esc(fotoPag(ss[0]))}" alt="" loading="lazy"><span>${esc(g.frase||PAGS[ss[0]].frase)}</span></a></div></div></div>`}).join("")+`</div></nav>`);
  document.body.insertAdjacentHTML("beforeend",`<div class="mg-fondo" id="mgFondo" hidden></div><aside class="mg-cajon" id="mgCajon" aria-label="Menú" hidden><div class="mg-cajon-top"><b>Categorías</b><button type="button" id="mgX" aria-label="Cerrar menú">✕</button></div>
    <a class="mg-solo" href="#">🏠 Inicio</a><a class="mg-solo" href="#c/todo">🧩 Todo el catálogo</a>`+gs.map(g=>{const ss=subsCon(g);
    if(ss.length===1&&!g.frase)return `<a class="mg-solo" href="#c/${ss[0]}">${g.ico} ${esc(g.nom)}</a>`;
    return `<details><summary>${g.ico} ${esc(g.nom)}</summary><div class="mg-sub">${ss.map(s=>`<a href="#c/${s}">${esc(PAGS[s].corto||PAGS[s].nom)}<small>${prods(s).length}</small></a>`).join("")}${PAGS[g.id]&&g.id!=="regalos"?`<a class="mg-sub-ver" href="#c/${g.id}">Ver todo ${esc(g.nom)}</a>`:""}</div></details>`}).join("")+`</aside>`);
  top.querySelectorAll(".mg-grupo").forEach(gr=>{const b=gr.querySelector("button");if(!b)return;
    const abrir=v=>{if(v)top.querySelectorAll(".mg-grupo.abierto").forEach(x=>{if(x!==gr){x.classList.remove("abierto");x.querySelector("button").setAttribute("aria-expanded",false)}});gr.classList.toggle("abierto",v);b.setAttribute("aria-expanded",v)};
    let t;gr.addEventListener("mouseenter",()=>{clearTimeout(t);abrir(true)});gr.addEventListener("mouseleave",()=>{t=setTimeout(()=>abrir(false),150)});
    b.addEventListener("click",()=>abrir(!gr.classList.contains("abierto")))});
  document.getElementById("mgHamb").onclick=()=>cajonMenu(true);
  document.getElementById("mgX").onclick=()=>cajonMenu(false);
  document.getElementById("mgFondo").onclick=()=>cajonMenu(false);
  addEventListener("keydown",e=>{if(e.key==="Escape")cerrarMenus()});
  addEventListener("hashchange",cerrarMenus);
  /* Buscar desde una página de categoría: vuelve a la vista del catálogo, que muestra los resultados. */
  document.getElementById("buscar").addEventListener("input",()=>{if(location.hash.startsWith("#c/"))location.hash=""});
}
function cajonMenu(v){document.getElementById("mgCajon").hidden=!v;document.getElementById("mgFondo").hidden=!v;document.getElementById("mgHamb").setAttribute("aria-expanded",v);document.body.style.overflow=v?"hidden":""}
function cerrarMenus(){document.querySelectorAll(".mg-grupo.abierto").forEach(x=>{x.classList.remove("abierto");const b=x.querySelector("button");if(b)b.setAttribute("aria-expanded",false)});if(document.getElementById("mgCajon"))cajonMenu(false)}
function marcarMenu(id){const g=id&&grupoDePag(id);document.querySelectorAll(".mg-grupo").forEach(x=>x.classList.toggle("activo",!!g&&x.dataset.g===g.id))}

/* Cuenta regresiva real hasta el corte de Navidad (URGENCIA), dentro del aviso de arriba. */
(()=>{const u=document.getElementById("urgencia");if(!u||typeof URGENCIA==="undefined")return;const fin=new Date(URGENCIA.hasta+"T23:59:59-03:00");
  const pinta=()=>{const ms=fin-new Date();let r=u.querySelector(".h-reloj");if(ms<=0){if(r)r.remove();return}
    if(!r){r=document.createElement("span");r.className="h-reloj";u.append(" ",r)}const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60;
    r.innerHTML=`<span>${d} d</span><span>${String(h).padStart(2,"0")} h</span><span>${String(m).padStart(2,"0")} min</span>`};
  /* app.js escribe el texto del aviso después; por eso se agrega un rato más tarde y se repasa cada 30 s. */
  setTimeout(pinta,1200);setInterval(pinta,30000)})();

const ENVIO_TXT=`🚚 Envío gratis: <b>Santiago desde ${clp(GRATIS_DESDE)}</b> · <b>todo Chile desde ${clp(GRATIS_CHILE)}</b> (punto Blue)`;
const GARANTIAS=`<div class="h-gar"><i>🧩</i><b>Piezas completas</b><span>Siempre van piezas de más. Y si en 30 días te falta una, te la mandamos.</span></div>
  <div class="h-gar"><i>🚚</i><b>Envío gratis</b><span>En Santiago desde ${clp(GRATIS_DESDE)} y a punto Blue en todo Chile desde ${clp(GRATIS_CHILE)}.</span></div>
  <div class="h-gar"><i>📦</i><b>Seguimiento</b><span>Te mandamos el número apenas sale tu pedido.</span></div>
  <div class="h-gar"><i>💬</i><b>Te ayudamos a armarlo</b><span>Si te trabas, nos escribes por WhatsApp y te guiamos.</span></div>`;
/* Clientes: las fotos reales que hay hoy. Entre comillas solo lo que dijo un cliente. */
const CLIENTES={regalo:[["landing/colo-colo/cliente1.jpg","Ya en la pared de un Albo"],["landing/colo-colo/real.jpg","Así queda armado, de verdad"]],
  propio:[["landing/colo-colo/cliente2.jpg","«Muy entretenido, y eso que soy malo para las manualidades»"],["landing/colo-colo/real.jpg","Así queda armado, de verdad"]]};
const pintaClientes=k=>CLIENTES[k].map(([f,t])=>`<figure class="h-hist"><img src="${f}" alt="" loading="lazy"><figcaption>${esc(t)}</figcaption></figure>`).join("")
  +(FINAL?"":[1,2,3].map(()=>`<div class="h-hist h-falta">[Video o foto de cliente, con permiso]</div>`).join(""));

function vistaInicio(){
  armarMenu();marcarMenu(null);
  modo("en-catalogo");document.body.classList.add("en-inicio");document.getElementById("cab").style.display="none";
  const mv=masVendidos(),rep=c=>visibles().find(p=>p.cat===c&&p.precio),cc=porSlug("colo-colo");
  const nuevosT=visibles().filter(p=>p.precio&&/nuevo|lanzamiento/i.test(p.etq||"")&&!esEsc(p)),nuevos=[],vistas=new Set();
  nuevosT.forEach(p=>{if(!vistas.has(p.cat)){vistas.add(p.cat);nuevos.push(p)}});nuevosT.forEach(p=>{if(nuevos.length<8&&!nuevos.includes(p))nuevos.push(p)});
  const tiles=["escudos-chilenos","escudos-internacionales","camisetas","musica","tematicas","basquetbol","mascotas",...Object.keys(PAGS).filter(k=>PAGS[k].nueva)].filter(id=>PAGS[id]&&prods(id).length)
    .map(id=>{const d=desdeDe(id);return `<a class="h-cat" href="#c/${id}"><div class="h-cat-ft"><img src="${esc(fotoPag(id))}" alt="" loading="lazy"></div><div class="h-cat-tx"><b>${PAGS[id].ico} ${esc(PAGS[id].nom)}</b><small>${esc(PAGS[id].frase)}</small>${d?`<span>Desde ${clp(d)}</span>`:""}</div></a>`}).join("");
  const ce=comboFila(),so=solaFila(),cams=cc?parCam(cc):[];
  const collage=["Escudos de fútbol","Música","Figuras 3D mini","Figuras 2D"].map(rep).filter(Boolean);
  const temporadaRegalo=new Date()<=new Date("2026-12-25T23:59:59");
  document.getElementById("vista").innerHTML=`
  <div class="h-envio">${ENVIO_TXT}</div>
  <section class="h-hero"><div class="h-wrap h-hero-in">
    <div class="h-hero-tx">
      <h1>Arma lo que amas.</h1>
      <p class="h-rota" aria-live="polite"><span id="hRota">Tu equipo, en tu pared.</span></p>
      <p class="h-bajada">Escudos de fútbol, cuadros de música, figuras de tus personajes, camisetas con tu nombre y hasta tu mascota, en mini bloques. Te llega la caja, lo armas en una tarde y te queda para siempre.</p>
      <div class="h-btns"><a class="h-btn oro" href="#categorias" data-bajar="categorias">Elige el tuyo ↓</a><a class="h-btn borde" href="#c/regalo-papa" data-bajar="regalo">🎁 Regalos</a></div>
      <div class="h-prueba">⭐ <b>${PEDIDOS} pedidos</b> · despachamos a <b>todo Chile</b></div>
    </div>
    <figure class="h-hero-foto" id="hFoto"><figcaption><a id="hLink" href="#p/colo-colo"><span id="hCap">Escudo de Colo-Colo</span> →</a></figcaption><div class="h-puntos" id="hPuntos" aria-hidden="true"></div></figure>
  </div></section>
  <div class="h-sellos"><div class="h-wrap">
    <div><i>🧩</i><span><b>Siempre van piezas de más.</b> Y si te falta una, te la mandamos.</span></div>
    <div><i>🚚</i><span><b>Con número de seguimiento.</b> Santiago 1 a 3 días hábiles.</span></div>
    <div><i>💬</i><span><b>Te atendemos Javi y Caro</b> por WhatsApp, de persona a persona.</span></div>
  </div></div>
  <section class="h-bloque" id="categorias"><div class="h-wrap">
    <h2 class="h-t">¿Qué quieres armar?</h2><p class="h-sub">Toca una categoría para ver todo lo que hay.</p>
    <div class="h-cinta" id="hCinta">${tiles}${tiles}</div>
  </div></section>
  ${mv.length?`<section class="h-bloque h-pt0"><div class="h-wrap"><h2 class="h-t">🔥 Los más vendidos</h2><p class="h-sub">Los que más se están llevando, en oferta.</p><div class="grilla">${mv.map(tarjeta).join("")}</div></div></section>`:""}
  ${nuevos.length?`<section class="h-bloque h-pt0"><div class="h-wrap"><h2 class="h-t">✨ Lo nuevo</h2><p class="h-sub">Lo último que salió del taller: no todo es fútbol.</p><div class="grilla">${nuevos.slice(0,8).map(tarjeta).join("")}</div></div></section>`:""}
  ${cc&&cams.length?`<section class="h-bloque h-osc"><div class="h-wrap h-pack">
    <div class="h-pack-fotos"><img src="${esc(fotoDe(cc))}" alt="Escudo de Colo-Colo">${cams.map((s,i)=>`<img src="${s}" alt="Camiseta de Colo-Colo ${i?"HIJO 10":"PAPA 1"}" loading="lazy">`).join("")}</div>
    <div><span class="h-tag">🔥 Oferta para hinchas</span><h2 class="h-t">Tu escudo + camisetas de tu equipo</h2>
      <p class="h-sub">Arma el escudo y súmale camisetas en mini bloques con el nombre y el número que quieras: el tuyo, el de tu hijo o el de tu pareja.</p>
      <ul><li>Camisetas con los colores de tu club</li>${ce&&so&&ce.precio<so.precio?`<li>Con tu escudo, cada camiseta sale desde ${clp(ce.precio)} (sola, ${clp(so.precio)})</li>`:""}${PROP.camRegaloCada?`<li>Con ${PROP.camRegaloCada} camisetas, la ${PROP.camRegaloCada+1}.ª va de regalo 🎁</li>`:""}</ul>
      <a class="h-btn oro" href="#p/colo-colo">Ver el pack de Colo-Colo</a></div>
  </div></section>`:""}
  <section class="h-bloque" id="regalo"><div class="h-wrap">
    <h2 class="h-t">¿Buscas regalo? Te ayudamos a elegir</h2><p class="h-sub">${new Date()<=new Date(URGENCIA.hasta+"T23:59:59")?"🎄 Pide hasta el 10 de diciembre y llega antes de Navidad. ":""}Te lo mandamos directo a quien lo recibe.</p>
    <div class="h-regalo"><div><h3>¿Para quién es?</h3><div class="h-pills">${PERSONAS.map(([id,ico,,corto])=>`<a class="h-pill" href="#c/${id}">${ico} ${corto}</a>`).join("")}</div></div>
      <div><h3>¿Cuánto quieres gastar?</h3><div class="h-pills">${TRAMOS.map(([id,nom])=>`<a class="h-pill" href="#c/${id}">${nom}</a>`).join("")}</div></div></div>
  </div></section>
  <section class="h-bloque h-suave"><div class="h-wrap">
    <h2 class="h-t">Así de fácil</h2><p class="h-sub">Una tarde de panorama: solo, en familia o con amigos.</p>
    <div class="h-pasos">
      <div class="h-paso"><div class="h-collage">${collage.map(p=>`<img src="${esc(fotoDe(p))}" alt="${esc(p.nombre)}" loading="lazy">`).join("")}</div><div><b>Eliges tu diseño</b><p>Lo pides aquí y lo confirmas con nosotros por WhatsApp.</p></div></div>
      <div class="h-paso"><img src="landing/colo-colo/caja.jpg" alt="La caja abierta con las piezas por color" loading="lazy"><div><b>Te llega la caja</b><p>Piezas separadas por color, instructivo impreso y piezas de más.</p></div></div>
      <div class="h-paso"><img src="landing/colo-colo/armando.jpg" alt="Armando el escudo" loading="lazy"><div><b>Lo armas y lo cuelgas</b><p>Fila por fila, y el gancho lo armas con las mismas piezas.</p></div></div>
    </div>
    <div class="h-nota">Si sabes seguir colores, lo armas. Y si te trabas, nos escribes y te ayudamos.</div>
  </div></section>
  <section class="h-bloque h-osc"><div class="h-wrap">
    <h2 class="h-t">Para regalar… o para regalonearte</h2><p class="h-sub">Fotos de clientes reales.</p>
    <div class="h-filtro" role="group" aria-label="Elegir fila"><button type="button" aria-pressed="${temporadaRegalo}" data-hist="regalo">🎁 Lo regalaron</button><button type="button" aria-pressed="${!temporadaRegalo}" data-hist="propio">🏠 Se lo autorregalaron</button></div>
    <div class="h-historias" id="hHist">${pintaClientes(temporadaRegalo?"regalo":"propio")}</div>
  </div></section>
  <section class="h-bloque"><div class="h-wrap"><h2 class="h-t">Nuestras garantías</h2><p class="h-sub">Para que compres tranquilo.</p><div class="h-garantias">${GARANTIAS}</div></div></section>
  <section class="h-bloque h-pt0"><div class="h-wrap h-quienes${FINAL?" sin-foto":""}">
    ${FINAL?"":`<div class="h-falta-foto">[Aquí va una foto real de Javi y Caro armando o empacando]</div>`}
    <div><h2 class="h-t">Somos Javi y Caro</h2><p>Diseñamos cada escudo pieza por pieza, lo empacamos nosotros y te atendemos por WhatsApp, de persona a persona.</p>
    <p><a href="${INSTAGRAM}" target="_blank" rel="noopener" class="h-link">Míranos en Instagram @aureo.cl →</a></p></div>
  </div></section>
  <section class="h-bloque h-pt0"><div class="h-wrap"><div class="h-pedido">
    <div><h2 class="h-t">¿No está tu equipo, tu banda o tu personaje?</h2><p>Lo diseñamos para ti. Nos mandas la imagen, te decimos si se puede y te damos el precio.</p></div>
    <a class="h-btn wa" target="_blank" rel="noopener" href="${waLink("Hola Áureo! Quiero un diseño a pedido de: ")}">Pedir el mío por WhatsApp</a>
  </div></div></section>
  <section class="h-bloque h-pt0 h-faq"><div class="h-wrap">
    <h2 class="h-t">Preguntas</h2>
    <details open><summary>¿Viene armado?</summary><p>No: lo armas tú, esa es la gracia. Llega con todo lo necesario, incluido el instructivo impreso.</p></details>
    <details><summary>¿Es difícil?</summary><p>Si sabes seguir colores, lo armas. El instructivo va fila por fila, y si te trabas te ayudamos por WhatsApp.</p></details>
    <details><summary>¿Cuánto demora en llegar?</summary><p>Santiago 1 a 3 días hábiles. Regiones de Valparaíso a Biobío 2 a 4, norte y sur 3 a 6, Aysén y Magallanes 5 a 10. Siempre con número de seguimiento.</p></details>
    <details><summary>¿Cómo pago?</summary><p>Por transferencia. Haces tu pedido aquí, lo confirmamos contigo por WhatsApp y ahí transfieres.</p></details>
    <details><summary>¿Se puede mandar de regalo?</summary><p>Sí, directo a quien lo recibe. Márcalo al completar tus datos.</p></details>
    <p style="text-align:center;margin-top:36px"><a class="h-btn oro" href="#c/todo">Ver todo el catálogo →</a></p>
  </div></section>
  <footer><a class="avisame" target="_blank" href="${waLink("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a><br><br>Precios en pesos chilenos · Pago por transferencia, coordinado por WhatsApp.</footer>`;
  const V=document.getElementById("vista");
  V.querySelectorAll("[data-bajar]").forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById(a.dataset.bajar).scrollIntoView({behavior:"smooth"})});
  V.querySelectorAll("[data-hist]").forEach(b=>b.onclick=()=>{V.querySelectorAll("[data-hist]").forEach(x=>x.setAttribute("aria-pressed",x===b));document.getElementById("hHist").innerHTML=pintaClientes(b.dataset.hist)});
  /* Portada: fotos de distintas líneas que van cambiando. */
  const L=[[{nombre:"Escudo de Colo-Colo",slug:"colo-colo"},"landing/colo-colo/pared.jpg","Tu equipo, en tu pared."],
    [rep("Música"),null,"Tu disco favorito, en tu pared."],
    [rep("Figuras 3D mini"),null,"Tus personajes, en tu repisa."],
    [cc&&cams.length?{nombre:"Camiseta con tu nombre",slug:"colo-colo"}:null,cams[0],"Tu nombre y tu número, en bloques."],
    [visibles().find(p=>esMascota(p)&&fotoDe(p)),null,"Tu mascota, en píxel."],
    [rep("Figuras 2D"),null,"Tu cuadro favorito, armado por ti."],
    [rep("Básquetbol"),null,"Tu equipo de la NBA, también."]].filter(([p])=>p).map(([p,src,frase])=>({p,src:src||fotoDe(p),frase}));
  const fig=document.getElementById("hFoto");
  L.forEach((s,i)=>{const im=new Image();im.src=s.src;im.alt=s.p.nombre;if(i)im.loading="lazy";else im.className="on";im.onerror=()=>im.remove();fig.insertBefore(im,fig.firstChild)});
  document.getElementById("hPuntos").innerHTML=L.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("");
  restaurar();animarInicio(L);
}

/* Página de cada categoría (#c/<id>), también «Todo el catálogo» y los resultados del buscador. */
let ordenCat="destacados";
function ordenar(L){const nuevo=p=>/nuevo|lanzamiento/i.test(p.etq||"")?0:1,mv=typeof MAS_VENDIDOS!=="undefined"?MAS_VENDIDOS:[];
  if(ordenCat==="menor")return[...L].sort((a,b)=>(a.precio||1e9)-(b.precio||1e9));
  if(ordenCat==="mayor")return[...L].sort((a,b)=>(b.precio||0)-(a.precio||0));
  if(ordenCat==="nuevo")return[...L].sort((a,b)=>nuevo(a)-nuevo(b));
  return[...L].sort((a,b)=>((mv.indexOf(a.slug)+1||99)-(mv.indexOf(b.slug)+1||99))||((b.antes>b.precio)-(a.antes>a.precio)))}
function vistaCategoria(id){
  armarMenu();
  const q=document.getElementById("buscar").value.trim();let pg=PAGS[id],L;
  if(id==="buscar"){pg={nom:`Resultados para «${q}»`,ico:"🔎",frase:"Lo que encontramos en el catálogo."};L=visibles().filter(p=>coincide(p.nombre+" "+p.cat+" "+(p.tema||"")+" "+textoVar(p),q))}
  else if(!pg){location.hash="";return}else L=prods(id);
  if(cat!==id)ordenCat="destacados";cat=id;
  modo("en-catalogo");document.getElementById("cab").style.display="none";marcarMenu(id==="buscar"||id==="todo"?null:id);
  const g=id==="buscar"||id==="todo"?null:grupoDePag(id),herm=g?subsCon(g):[],esGrupo=!!g&&g.id===id&&(g.subs.length>1||g.carpeta);
  const migas=`<a href="#">Inicio</a> › `+(!g||(g.subs.length===1&&!g.carpeta)?esc(pg.nom):g.id===id?esc(g.nom):`${PAGS[g.id]?`<a href="#c/${g.id}">${esc(g.nom)}</a>`:esc(g.nom)} › ${esc(pg.nom)}`);
  const chips=id==="todo"?GRUPOS.filter(x=>subsCon(x).length&&x.id!=="regalos").map(x=>`<a class="h-chip" href="#c/${PAGS[x.id]&&(x.subs.length>1||x.carpeta)?x.id:subsCon(x)[0]}">${x.ico} ${esc(x.nom)}</a>`).join("")
    :(herm.length>1||(g&&g.carpeta))?(PAGS[g.id]&&g.id!=="regalos"?`<a class="h-chip" href="#c/${g.id}" aria-current="${esGrupo}">Todo ${esc(g.nom)}</a>`:"")+herm.map(s=>`<a class="h-chip" href="#c/${s}" aria-current="${s===id}">${esc(PAGS[s].corto||PAGS[s].nom)}</a>`).join(""):"";
  const lista=ordenar(L),d=id==="buscar"?0:desdeDe(id);
  document.getElementById("vista").innerHTML=`<div class="h-envio">${ENVIO_TXT}</div>
  <div class="pc-top"><div class="h-wrap pc-top-in"><div><div class="pc-migas">${migas}</div>
    <h1>${pg.ico} ${esc(pg.nom)}</h1><p>${esc(pg.frase||"")}</p><span class="pc-cuenta">${esGrupo&&g.carpeta?`${herm.length} ${herm.length===1?"colección":"colecciones"}`:`${L.length} ${L.length===1?"producto":"productos"}`}${d?" · desde "+clp(d):""}</span></div>
    ${id==="buscar"?"":`<img src="${esc(fotoPag(id))}" alt="">`}</div></div>
  <section class="h-bloque h-pt0"><div class="h-wrap">
    <div class="pc-barra"><div class="h-chips">${chips}</div>
      <label class="pc-orden"${esGrupo&&g.carpeta?` style="display:none"`:""}>Ordenar <select id="pcOrden"><option value="destacados">Destacados</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option><option value="nuevo">Lo nuevo</option></select></label></div>
    ${esGrupo&&g.carpeta?`<div class="pc-temas">${herm.map(s=>{const d=desdeDe(s);return `<a class="h-cat" href="#c/${s}"><div class="h-cat-ft"><img src="${esc(fotoPag(s))}" alt="" loading="lazy"></div><div class="h-cat-tx"><b>${PAGS[s].ico} ${esc(PAGS[s].nom)}</b><small>${prods(s).length} ${prods(s).length===1?"producto":"productos"}</small>${d?`<span>Desde ${clp(d)}</span>`:""}</div></a>`}).join("")}</div>`:lista.length?`<div class="grilla">${lista.map(tarjeta).join("")}</div>`:`<div class="a-pedido"><p class="serif" style="font-size:26px;margin:0">¿No está «${esc(q)}»?</p><p>Lo diseñamos a pedido: nos mandas la imagen, te decimos si se puede y te damos el precio.</p><a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none" target="_blank" rel="noopener" href="${waLink("Hola Áureo! Quiero un diseño a pedido de: "+q)}">Pedir el mío por WhatsApp</a></div>`}
    ${lista.length?`<div class="h-pedido pc-pedido"><div><h2 class="h-t">¿No está el tuyo?</h2><p>Lo diseñamos para ti. Nos mandas la imagen, te decimos si se puede y te damos el precio.</p></div>
      <a class="h-btn wa" target="_blank" rel="noopener" href="${waLink("Hola Áureo! Quiero un diseño a pedido de: ")}">Pedir el mío por WhatsApp</a></div>`:""}
    <div class="h-garantias pc-gar">${GARANTIAS}</div>
  </div></section>
  <footer><a class="avisame" target="_blank" href="${waLink("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a><br><br>Precios en pesos chilenos · Pago por transferencia, coordinado por WhatsApp.</footer>`;
  const sel=document.getElementById("pcOrden");sel.value=ordenCat;sel.onchange=()=>{ordenCat=sel.value;vistaCategoria(id)};
  if(retorno&&retorno.cat===id)restaurar();else window.scrollTo({top:0,behavior:"instant"});
  transiciones();
}

let animId=0;
function animarInicio(L){
  const id=++animId,quieto=matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Portada: cambia de foto cada 3,8 s y la frase dorada cambia con ella. */
  const fig=document.getElementById("hFoto"),cap=document.getElementById("hCap"),lnk=document.getElementById("hLink"),txt=document.getElementById("hRota"),pts=document.getElementById("hPuntos");let k=0;
  const t=setInterval(()=>{if(id!==animId||!document.body.contains(fig)){clearInterval(t);return}if(document.hidden)return;
    const ims=[...fig.querySelectorAll("img")];if(ims.length<2)return;const n=(k+1)%L.length,im=ims.find(x=>x.alt===L[n].p.nombre);
    ims.forEach(x=>x.classList.remove("on"));if(im)im.classList.add("on");[...pts.children].forEach((x,i)=>x.classList.toggle("on",i===n));k=n;
    cap.textContent=L[k].p.nombre;lnk.href="#p/"+L[k].p.slug;txt.classList.add("sale");setTimeout(()=>{txt.textContent=L[k].frase;txt.classList.remove("sale")},300)},3800);
  transiciones();
  if(quieto)return;
  /* Categorías: avanzan solas; se detienen al pasar el mouse o al tocarlas y siguen a los 4 s. */
  const c=document.getElementById("hCinta");let pausa=0,x=0;
  ["pointerdown","wheel","touchstart","focusin"].forEach(e=>c.addEventListener(e,()=>{if(pausa!==Infinity)pausa=Date.now()+4000},{passive:true}));
  c.addEventListener("mouseenter",()=>pausa=Infinity);c.addEventListener("mouseleave",()=>pausa=Date.now()+800);
  (function paso(){if(id!==animId||!document.body.contains(c))return;if(Date.now()<pausa)x=c.scrollLeft;else{x+=0.5;const m=c.scrollWidth/2;if(x>=m)x-=m;c.scrollLeft=x}requestAnimationFrame(paso)})();
}
/* Transiciones suaves al bajar: cada bloque aparece cuando entra en pantalla (sin «reducir movimiento»). */
function transiciones(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;
  const V=document.getElementById("vista");V.classList.add("h-anim");
  V.querySelectorAll(".h-bloque .h-t, .h-bloque .h-sub, .h-pack>*, .h-pedido, .h-quienes>*, .h-nota, .h-faq details").forEach(e=>e.classList.add("rv"));
  V.querySelectorAll(".h-bloque .grilla, .h-pasos, .h-garantias, .h-regalo, .h-historias, .h-sellos .h-wrap").forEach(e=>e.classList.add("rv-h"));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -6% 0px"});
  V.querySelectorAll(".rv,.rv-h").forEach(e=>io.observe(e));
}

/* Oferta especial en rojo junto al escudo (Áureo, 21-nov-2026): el escudo + camisetas DEL MISMO EQUIPO (parCam en config.js).
   Parte en 2 camisetas y abajo se elige cuántas (1 a 5; con 5 va 1 de regalo, PROP.camRegaloCada). «Lo quiero con camisetas»
   agrega el escudo y deja esa cantidad elegida para el paso del pack. */
const PACK_N=2;let packN=PACK_N;
function ofertaCam(p){
  if(!tramosCombo())return"";
  const n=packN,R=PROP.camRegaloCada,cams=parCam(p).slice(0,Math.min(n,2)),eq=p.nombre.replace(/ \(.*\)$/,""),antes=p.precio+solasPrecio(n),ahora=p.precio+precioCams(n);
  return `<div class="oferta-cam"><div class="oc-tag">🔥 Oferta especial</div>
    <div class="oc-montaje">${img(p)}<span class="mas">+</span>${cams.length?cams.map(s=>`<img src="${s}" alt="Camiseta de ${esc(eq)} con nombre y número" loading="lazy">`).join(""):`<div class="oc-sin">👕<small>Con los colores de tu equipo</small></div>`}</div>
    <b class="oc-tit">Tu escudo + ${n} camiseta${n>1?"s":""} ${parCam(p).length?"de tu "+esc(eq):"de tu equipo"}${R&&n>=R?" + 1 de regalo 🎁":""}</b>
    <p>${n>1?"Cada una":"Con"} el nombre y el número que quieras. ${n>1?"Las":"La"} eliges en el paso siguiente.</p>
    <div class="oc-cuantas"><span>¿Cuántas camisetas?</span><div>${[1,2,3,4,5].map(k=>`<button class="${k===n?"sel":""}" data-pn="${k}">${R&&k===R?`${k}+1🎁`:k}</button>`).join("")}</div></div>
    <div class="oc-precio">${antes>ahora?`<s>${clp(antes)}</s>`:""}<b>${clp(ahora)}</b>${antes>ahora?`<span>Ahorras ${clp(antes-ahora)}</span>`:""}</div>
    <button class="btn-grande oc-btn" data-pack>Lo quiero con ${n>1?n+" camisetas":"1 camiseta"}</button></div>`;
}
/* Enciende los botones de la oferta (cantidad y «Lo quiero»); al cambiar la cantidad se redibuja solo el recuadro. */
function ofertaCamBotones(p,cant){
  const box=document.querySelector(".oferta-cam");if(!box)return;
  box.querySelectorAll("[data-pn]").forEach(b=>b.onclick=()=>{packN=+b.dataset.pn;box.outerHTML=ofertaCam(p);ofertaCamBotones(p,cant)});
  box.querySelector("[data-pack]").onclick=()=>{agregar(p.slug,cant(),true);camisetas=Array.from({length:packN},(_,i)=>camisetas[i]||{n:"",d:""});medir("OfertaAceptada",{oferta:"pack-ficha",camisetas:packN});fijarMeta();paso=0;location.hash="#pedido"};
}
/* Volver al mismo lugar (Áureo, 23-nov-2026): al entrar a un producto desde el inicio o una categoría se guarda dónde ibas
   (scroll de la página y de cada franja); al volver atrás se deja todo igual. */
let retorno=null;
const lugar=()=>({cat,q:document.getElementById("buscar").value,y:window.scrollY,fr:[...document.querySelectorAll(".franja")].map(f=>f.scrollLeft)});
function restaurar(){const r=retorno;retorno=null;if(!r||r.cat!==cat||r.q!==document.getElementById("buscar").value)return;
  document.querySelectorAll(".franja").forEach((f,i)=>{if(r.fr[i]!=null)f.scrollLeft=r.fr[i]});
  window.scrollTo({top:r.y,behavior:"instant"});requestAnimationFrame(()=>window.scrollTo({top:r.y,behavior:"instant"}))}
function vistaFicha(s){
  if(/en-catalogo/.test(document.body.className))retorno=lugar();
  const p=porSlug(s);if(!p){location.hash="";return}
  const sv=scrollVar;scrollVar=null;modo("en-ficha",p.nombre);if(sv==null)window.scrollTo({top:0,behavior:"instant"});medir("ViewContent",{content_name:p.nombre,value:p.precio,currency:"CLP"});
  const h=esEscudo(p)?hincha(p):null, pl=PILOTO[p.slug]||null;
  const grp=grupoDe(p.slug),base=grp&&porSlug(grp[0][0])||p;
  const pz=(grp&&(grp.find(([s])=>s===p.slug)||[])[2])||(h&&!esVarSec(p)?h[1]:null)||PIEZAS[p.slug]||null;
  const nombreCorto=base.nombre.replace(/ \(.*\)$/,"");
  const titulo=esEscudo(p)?`Tu ${esc(nombreCorto)},<br>armado por ti.`:`${esc(nombreCorto)},<br>armado por ti.`;
  const otros=P.filter(x=>x.cat===p.cat&&x.slug!==p.slug&&x.precio&&!esVarSec(x)&&!(grp&&grp.some(([s])=>s===x.slug))).slice(0,10);
  const nEsc=P.filter(esEscudo).length;
  const fotoO=(k,ph,ratio="1/1")=>pl&&pl[k]?`<img class="foto-bloque" src="${fp(pl,pl[k])}" alt="" loading="lazy">`:`<div class="placeholder" style="aspect-ratio:${ratio}">${ph}</div>`;
  let cant=1;packN=PACK_N;
  document.getElementById("vista").innerHTML=`<div class="ficha">
  <div class="f-top">
    <div class="f-galeria">${pl?`<img class="principal" id="fotoP" src="${fp(pl,pl.galeria[0])}" alt="${esc(p.nombre)}">
      <div class="miniaturas">${pl.galeria.map((k,i)=>`<img src="${fp(pl,k)}" data-gal="${fp(pl,k)}" class="${i?"":"sel"}" alt="">`).join("")}</div>`:`<div class="f-hero">${img(p)}</div>`}</div>
    <div class="f-info">
      <div class="eyebrow">${h?`Para el ${esc(h[0])}`:esc(p.tema||p.cat)}</div>
      <h1 class="serif">${titulo}</h1>
      ${pl?`<div class="prueba-corta"><img src="${fp(pl,"cliente2")}" alt="">«${esc(pl.cita.split(",")[1]?.trim()||pl.cita)}…»</div>`:""}
      <div class="datos">${p.tam?`<span class="dato">📏 ${esc(p.tam)}</span>`:""}${pz?`<span class="dato">🧩 +${pz} piezas</span>`:""}${esEscudo(p)?`<span class="dato">⏳ 2 a 3 horas</span>`:""}</div>
      ${grp&&grp.filter(([s])=>porSlug(s)).length>1?`<div class="variantes"><div class="v-tit">${esTam(grp)?"Elige el tamaño":"Elige la versión"}</div><div class="v-ops">${grp.map(([s,l])=>{const v=porSlug(s);return v?`<button class="v-op${s===p.slug?" sel":""}" data-var="${s}"><b>${esc(l)}</b>${v.tam?`<span>${esc(v.tam)}</span>`:""}${v.precio?`<span class="v-precio">${clp(v.precio)}</span>`:""}</button>`:""}).join("")}</div></div>`:""}
      ${p.precio?`<div class="f-precio">${p.antes>p.precio?`<s>${clp(p.antes)}</s>`:""}<b>${clp(p.precio)}</b><span>${(()=>{const r=esEscudo(p)&&REGION_CLUB[ALIAS[p.slug]||p.slug];const zona=r?(r.includes("|")?" y a punto Blue en Calama":` y a punto Blue en ${r}`):"";return p.precio>=GRATIS_DESDE?`Envío gratis en Santiago${zona}`:`Envío gratis en Santiago${zona} desde $20.000`})()}</span></div>`:`<div class="f-precio"><b style="font-size:20px">${esc(p.det||"Precio a consultar")}</b></div>`}
      ${p.precio?`<div class="cta-info"><div class="cant"><button data-menos>−</button><span data-cantn>1</span><button data-mas1>+</button></div><button class="btn-grande" data-cta>Agregar al pedido</button></div>`:""}
      ${esEscudo(p)&&p.precio?ofertaCam(p):""}
      <ul class="confianza"><li>📦 Llega en caja, con las piezas separadas por color</li><li>🧩 Siempre van piezas de más</li><li>🚚 Santiago 1 a 3 días hábiles · regiones 2 a 6 (Aysén y Magallanes 5 a 10)</li><li>💬 Confirmas y pagas por WhatsApp, con Javi y Caro</li></ul>
    </div>
  </div>
  ${esEscudo(p)?`
  <div class="bloque historia"><div><h3>La camiseta la usas.<br><em>La pared está esperando.</em></h3>
    <p>Llevas años alentando ${h?`como buen ${esc(h[0])}`:"a tu equipo"}: en el estadio, en la casa, en el grupo de WhatsApp. La camiseta, la bufanda y el gorro te acompañan a todas partes.</p>
    <p>Pero en tu pieza, en el living o en la oficina, ¿dónde se ve que eres de ${esc(nombreCorto)}?</p></div></div>
  <div class="bloque split"><div>${fotoO("armando","[Foto armándolo]")}</div><div><h3>La idea: lo armas tú</h3>
    <p>No te lo mandamos armado, y es a propósito. Lo que uno arma con sus manos lo quiere más: cada fila es tuya, y cuando lo cuelgas sabes lo que te costó dejarlo perfecto.</p>
    <p>No es un cuadro que compraste: <b>es uno que hiciste</b>.</p>
    <button class="btn-grande oro cta-medio" data-cta>Lo quiero · ${p.precio?clp(p.precio):""}</button></div></div>
  <div class="bloque split inv"><div>${fotoO("pared","[Foto: el escudo colgado en una pared]")}</div><div><h3>Del porte de un póster</h3><p>${p.tam?`Armado mide <b>${esc(p.tam)}</b>${pz?`, con más de ${pz} piezas`:""}.`:""} Se ve desde la puerta, en tu pieza, el living o la oficina.</p></div></div>
  <div class="bloque split"><div>${pl?`<div class="placeholder video" style="aspect-ratio:1/1">[Aquí va el timelapse del armado, 15 a 20 s, sin sonido. Ya existe en los reels de Colo-Colo]</div>`:`<div class="placeholder video">[Video corto del armado, 15 a 20 s, vertical]</div>`}</div><div><h3>Una tarde de panorama</h3><p>Son 2 a 3 horas: solo, en familia o con amigos. Vas fila por fila con el instructivo impreso y ves cómo aparece tu escudo.</p></div></div>
  <div class="bloque"><h3>¿Para quién es?</h3><div class="quien">
    <div><i>⚽</i><b>Para ti, hincha</b>Tu escudo en tu pieza, armado con tus manos.</div>
    <div><i>🎁</i><b>Para regalar</b>Al papá, la pareja o el amigo más ${h?esc(h[0]):"hincha"}. Se lo mandamos directo.</div>
    <div><i>👨‍👧</i><b>Para armar juntos</b>Una tarde con tus hijos sin pantallas, y algo que queda colgado.</div>
    <div><i>🏆</i><b>Para tu colección</b>Escudo, camisetas con nombre y figuras, todo en un envío.</div></div></div>`:""}
  <div class="bloque split inv"><div>${fotoO("caja","[Foto de la caja abierta]")}</div><div><h3>Lo que llega en la caja</h3><div class="caja">
    <div><b>🎨</b>Piezas separadas por color</div><div><b>📄</b>Instructivo impreso, paso a paso</div>
    <div><b>➕</b>Piezas de repuesto</div><div><b>🪝</b>Tarjeta para armar el gancho con las mismas piezas</div></div></div></div>
  ${h&&(pl||!FINAL)?`<div class="bloque"><h3>Para el ${esc(h[0])}</h3><p>${pl?esc(pl.hincha):"[2 o 3 líneas para el hincha: un recuerdo, una gesta, lo que se siente.]"}</p></div>`:""}
  <div class="bloque"><h3>Ya lo armaron</h3>
    <div class="contador"><div><b>${PEDIDOS}</b>pedidos a todo Chile</div><div><b>${nEsc}</b>escudos para elegir</div><div><b>Todo Chile</b>despachamos a todas las regiones</div></div>
    ${pl?`<div class="clientes">${pl.clientes.map(([k,txt])=>`<figure><img src="${fp(pl,k)}" alt="" loading="lazy"><figcaption>${esc(txt)}</figcaption></figure>`).join("")}</div>
      <p class="cita-grande">«${esc(pl.cita)}»<small>Cliente de Áureo, por WhatsApp</small></p>`:
      `<div class="clientes"><div class="placeholder">[Foto cliente 1]</div><div class="placeholder">[Foto cliente 2]</div><div class="placeholder">[Foto cliente 3]</div></div><p class="cita">[Frase real de un cliente, con su permiso]</p>`}</div>
  <div class="bloque obj"><h3>¿Y si…?</h3>
    <details open><summary>¿Y si no sé armarlo?</summary><p>Si sabes seguir colores, lo armas. El instructivo va fila por fila. Y si te trabas, nos escribes por WhatsApp y te ayudamos.</p></details>
    <details><summary>¿No es caro para unas piezas?</summary><p>${pz?`Son más de ${pz} piezas, `:""}2 a 3 horas de panorama y un cuadro ${p.tam?`de ${esc(p.tam)} `:""}que vas a tener colgado por años. Y lo hiciste tú.</p></details>
    <details><summary>¿Llega a tiempo?</summary><p>Desde que confirmamos el pago: Santiago 1 a 3 días hábiles, Valparaíso a Biobío 2 a 4, norte y sur 3 a 6, Aysén y Magallanes 5 a 10. Te mandamos el número de seguimiento. ¿Apurado? Al final puedes pasar tu pedido adelante en la fila de despacho.</p></details>
    <details><summary>¿Es seguro pagar por transferencia?</summary><p>Confirmas tu pedido por WhatsApp con nosotros, Javi y Caro. Te mandamos los datos y, cuando sale, el número de seguimiento.</p></details></div>
  <div class="bloque"><h3>Nuestras garantías</h3><div class="garantias">
    <div><i>🧩</i><b>Piezas de más</b>Siempre enviamos piezas de repuesto. Y si igual te falta alguna, te la mandamos.</div>
    <div><i>💬</i><b>Te ayudamos a armarlo</b>Si te trabas, nos escribes y te guiamos.</div>
    <div><i>📦</i><b>Seguimiento</b>Te mandamos el número apenas sale.</div>
    <div><i>🛠️</i><b>Llega bien</b>Si algo llega dañado, te lo solucionamos.</div></div>
    ${p.precio?`<button class="btn-grande oro cta-medio" style="max-width:420px" data-cta>Lo quiero · ${clp(p.precio)}</button>`:""}</div>
  <div class="bloque quienes"><div class="placeholder foto">[Foto de Javi y Caro armando o empacando]</div><div><h3>Quiénes somos</h3>
    <p>Somos Javi y Caro. Diseñamos cada escudo pieza por pieza, lo empacamos nosotros y te atendemos por WhatsApp, de persona a persona.</p>
    <p><a href="${INSTAGRAM}" target="_blank" rel="noopener">Míranos en Instagram @aureo.cl →</a></p>
    <a class="avisame" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a></div></div>
  <div class="bloque faq"><h3>Preguntas</h3>
    <details><summary>¿Viene armado?</summary><p>No: lo armas tú. Esa es la gracia. Llega con todo lo necesario.</p></details>
    <details><summary>¿Cómo se cuelga?</summary><p>Viene una tarjeta que enseña a armar el gancho con las mismas piezas.</p></details>
    <details><summary>¿Cuánto demora en llegar?</summary><p>Desde que confirmamos el pago: Santiago 1 a 3 días hábiles, Valparaíso a Biobío 2 a 4, norte (Arica a Coquimbo) y sur (Araucanía a Los Lagos) 3 a 6, Aysén y Magallanes 5 a 10.</p></details>
    <details><summary>¿Cómo pago?</summary><p>Por transferencia. Al enviar tu pedido por WhatsApp te mandamos los datos.</p></details>
    <details><summary>¿Es para regalo?</summary><p>Lo mandamos directo a quien lo recibe. Márcalo al completar tus datos.</p></details></div>
  ${otros.length?`<div class="bloque"><h3>${esEscudo(p)?"Otros escudos":"También te puede gustar"}</h3><div class="otros">${otros.map(tarjeta).join("")}</div></div>`:""}
  </div>
  ${p.precio?`<div class="barra-fija"><div class="cant"><button data-menos>−</button><span data-cantn>1</span><button data-mas1>+</button></div>
    <button class="btn-grande" data-cta id="agregarF">Agregar al pedido · ${clp(p.precio)}</button></div>`:
    `<div class="barra-fija"><a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo, me interesa: "+p.nombre+". ¿Me cuentas más?")}">Preguntar por WhatsApp</a></div>`}`;
  document.querySelectorAll("[data-var]").forEach(b=>b.onclick=()=>{if(b.dataset.var!==p.slug){scrollVar=window.scrollY;location.replace("#p/"+b.dataset.var)}});
  if(sv!=null)window.scrollTo(0,sv);
  document.querySelectorAll("[data-gal]").forEach(m=>m.onclick=()=>{document.getElementById("fotoP").src=m.dataset.gal;document.querySelectorAll("[data-gal]").forEach(x=>x.classList.toggle("sel",x===m))});
  if(p.precio){
    const upd=()=>{document.querySelectorAll("[data-cantn]").forEach(n=>n.textContent=cant);const b=document.getElementById("agregarF");if(b)b.textContent=`Agregar al pedido · ${clp(p.precio*cant)}`};
    document.querySelectorAll("[data-menos]").forEach(x=>x.onclick=()=>{if(cant>1){cant--;upd()}});
    document.querySelectorAll("[data-mas1]").forEach(x=>x.onclick=()=>{cant++;upd()});
    document.querySelectorAll("[data-cta]").forEach(x=>x.onclick=()=>{agregar(p.slug,cant,true);fijarMeta();paso=0;location.hash="#pedido"});
    ofertaCamBotones(p,()=>cant);
  }
}
