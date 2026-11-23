/* Vitrina: portada, catálogo por categoría y ficha/landing de cada producto.
   Parte de: W1 · Vitrina. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
/* ---------- Vistas ---------- */
let cat="Todo";
/* Tamaños/versiones (VARIANTES en config.js): solo el primero de cada grupo sale en el catálogo. */
const grupoDe=s=>VARIANTES.find(g=>g.some(([x])=>x===s));
const esVarSec=p=>{const g=grupoDe(p.slug);return!!(g&&g[0][0]!==p.slug&&porSlug(g[0][0]))};
const textoVar=p=>{const g=grupoDe(p.slug);return g?g.map(([s,l])=>(porSlug(s)?.nombre||"")+" "+l).join(" "):""};
const esTam=g=>g.some(([,l])=>/^(chico|mediano|grande|gigante)$/i.test(l));
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
  if(cat==="Todo"&&!norm(document.getElementById("buscar").value)){vistaInicio();return}
  modo("en-catalogo");
  const cats=[...new Set(P.map(p=>p.cat))].sort((a,b)=>{const i=ORDEN.indexOf(a),j=ORDEN.indexOf(b);return(i<0?99:i)-(j<0?99:j)});
  const q=norm(document.getElementById("buscar").value);
  const L=P.filter(p=>!esVarSec(p)&&(cat==="Todo"||p.cat===cat)&&(!q||(h=>q.split(/\s+/).every(w=>h.includes(w)))(norm(p.nombre+" "+p.cat+" "+textoVar(p)))));
  const tc=tramosCombo(),c=comboFila(),s=solaFila();
  document.getElementById("vista").innerHTML=`
  <nav class="chips">${["Todo",...cats].map(x=>`<button class="chip${x===cat?" activa":""}" data-cat="${esc(x)}">${x==="Todo"?"🏠 Inicio":esc(x)}</button>`).join("")}</nav>
  <div class="wrap">${L.length?cats.filter(x=>L.some(p=>p.cat===x)).map(x=>{const ps=L.filter(p=>p.cat===x);
    return `<section><h2 class="sec">${esc(x)}<small>${ps.length}</small></h2>
    <div class="grilla">${ps.map(tarjeta).join("")}</div></section>`}).join(""):`<div class="a-pedido"><p class="serif" style="font-size:26px;margin:0">¿No está «${esc(q)}»?</p><p>Lo diseñamos a pedido: nos mandas la imagen, te decimos si se puede y te damos el precio.</p><a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero un escudo a pedido de: "+q)}">Pedir el mío por WhatsApp</a></div>`}</div>
  <footer><a class="avisame" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a><br><br>Precios en pesos chilenos · Pago por transferencia, coordinado por WhatsApp.</footer>`;
  restaurar();
}

/* ---------- Inicio (Áureo, 22-nov-2026) ----------
   Portada de presentación a pantalla completa y después una franja por categoría con sus productos avanzando solos.
   Las franjas se pueden deslizar con el dedo; se detienen mientras la tocas y siguen a los 2,5 s.
   «Ver todos» abre la categoría completa en grilla (la vista de siempre). Con «reducir movimiento» del teléfono no se mueven. */
const catsOrden=()=>[...new Set(P.map(p=>p.cat))].sort((a,b)=>{const i=ORDEN.indexOf(a),j=ORDEN.indexOf(b);return(i<0?99:i)-(j<0?99:j)});
const DESC_CAT={"Escudos de fútbol":"Tu club en la pared, del porte de un póster","Camisetas personalizadas":"Con el nombre y el número que quieras","Figuras 3D mini":"Chiquitas, para el escritorio o para regalar","Figuras 3D grandes":"Para armar por capas y lucir en la repisa","Figuras 2D":"Tus personajes favoritos en píxel","Música":"La portada de tu disco favorito","Personalizados":"Lo que quieras, diseñado para ti"};
function franja(id,titulo,sub,ps,dir){
  return `<section class="franja-sec" id="${id}"><div class="wrap franja-cab"><div><h2 class="sec">${titulo}</h2>${sub?`<p class="franja-sub">${sub}</p>`:""}</div>
    ${id.startsWith("cat-")?`<button class="ver-todos" data-vercat="${esc(ps[0].cat)}">Ver ${ps.length>1?"los "+ps.length:"todo"} →</button>`:""}</div>
    <div class="franja" data-dir="${dir}"><div class="franja-pista">${ps.length>2?(t=>t+t)(Array(Math.ceil(9/ps.length)).fill(ps.map(tarjeta).join("")).join("")):ps.map(tarjeta).join("")}</div></div></section>`;
}
function vistaInicio(){
  modo("en-catalogo");document.body.classList.add("en-inicio");document.getElementById("cab").style.display="none";
  const cats=catsOrden(),nEsc=P.filter(esEscudo).length,mv=masVendidos();
  const vitrina=[...mv,...P.filter(p=>p.precio&&!esVarSec(p)&&!mv.includes(p)&&/figura|m[uú]sica/i.test(p.cat))].slice(0,7);
  const wa=t=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`;
  document.getElementById("vista").innerHTML=`
  <section class="portada">
    <div class="pt-texto">
      <img class="pt-logo" src="logo.svg" alt="Áureo">
      <p class="pt-eyebrow">Lo que amas se arma</p>
      <h1 class="serif">Tu equipo,<br><em>armado por ti.</em></h1>
      <p class="pt-bajada">Escudos, camisetas y figuras en mini bloques. Llegan en caja, los armas en una tarde y quedan colgados en tu pared.</p>
      <div class="pt-botones"><a class="pt-btn oro" href="#categorias" data-bajar>Ver el catálogo</a><a class="pt-btn borde" target="_blank" rel="noopener" href="${wa("Hola Áureo! Quiero un diseño a pedido.")}">Pedir uno a pedido</a></div>
      <div class="pt-datos"><div><b>${nEsc}</b>escudos</div><div><b>126</b>pedidos en octubre</div><div><b>Todo Chile</b>despachamos</div></div>
    </div>
    <div class="pt-vitrina" aria-hidden="true">${vitrina.map((p,i)=>`<div class="pt-foto${i?"":" ver"}"><img src="${esc(fotoDe(p))}" alt="" ${i?'loading="lazy"':""} onerror="this.parentNode.remove()"><span>${esc(p.nombre.replace(/ \(.*\)$/,""))}</span></div>`).join("")}</div>
    <a class="pt-bajar" href="#categorias" data-bajar aria-label="Ver el catálogo">⌄</a>
  </section>
  <div class="sellos-banda"><div class="wrap sellos"><div class="sello"><b>🚚</b>Envío gratis en Santiago desde $20.000</div><div class="sello"><b>📦</b>Llega en caja, piezas por color</div><div class="sello"><b>🧩</b>Siempre van piezas de más</div></div></div>
  <div id="categorias">
    <nav class="chips cat-nav">${cats.map(x=>`<button class="chip" data-irfranja="${slug(x)}">${esc(x)}</button>`).join("")}</nav>
    ${mv.length?franja("mas-vendidos","🔥 Los más vendidos","Los que más arman nuestros clientes",mv,1):""}
    ${cats.map((x,i)=>{const ps=P.filter(p=>p.cat===x&&!esVarSec(p));return ps.length?franja("cat-"+slug(x),esc(x),DESC_CAT[x]||"",ps,i%2?1:-1):""}).join("")}
  </div>
  <div class="wrap"><div class="a-pedido"><p class="serif" style="font-size:26px;margin:0">¿No está el tuyo?</p><p>Lo diseñamos a pedido: nos mandas la imagen, te decimos si se puede y te damos el precio.</p><a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none" target="_blank" rel="noopener" href="${wa("Hola Áureo! Quiero un diseño a pedido.")}">Pedir el mío por WhatsApp</a></div></div>
  <footer><a class="avisame" target="_blank" href="${wa("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a><br><br>Precios en pesos chilenos · Pago por transferencia, coordinado por WhatsApp.</footer>`;
  const V=document.getElementById("vista");
  V.querySelectorAll("[data-bajar]").forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById("categorias").scrollIntoView({behavior:"smooth"})});
  V.querySelectorAll("[data-irfranja]").forEach(b=>b.onclick=()=>{const s=document.getElementById("cat-"+b.dataset.irfranja);if(s)window.scrollTo({top:s.getBoundingClientRect().top+scrollY-70,behavior:"smooth"})});
  V.querySelectorAll("[data-vercat]").forEach(b=>b.onclick=()=>{cat=b.dataset.vercat;vistaCatalogo();window.scrollTo(0,0)});
  restaurar();animarInicio();
}
let animId=0;
function animarInicio(){
  const id=++animId,hover=matchMedia("(hover: hover)").matches,quieto=matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Vitrina de la portada: cambia de foto cada 3 s */
  const fotos=()=>[...document.querySelectorAll(".pt-foto")];let fi=0;
  const t=setInterval(()=>{if(id!==animId||!document.querySelector(".portada")){clearInterval(t);return}const F=fotos();if(F.length<2||document.hidden)return;F[fi%F.length].classList.remove("ver");fi=(fi+1)%F.length;F[fi].classList.add("ver")},3000);
  if(quieto)return;
  /* Franjas: avanzan solas (~32 px/s), en vuelta infinita (el contenido se repite hasta 9+ tarjetas y va dos veces, para que alcance en pantallas anchas) */
  const S=[...document.querySelectorAll(".franja")].map(el=>{const s={el,x:0,pausa:0,vis:false,dir:+el.dataset.dir||1};
    const parar=()=>{s.pausa=performance.now()+2500};
    ["pointerdown","touchstart","wheel"].forEach(ev=>el.addEventListener(ev,parar,{passive:true}));
    el.addEventListener("scroll",()=>{if(performance.now()<s.pausa)s.x=el.scrollLeft},{passive:true});
    return s});
  const io=new IntersectionObserver(es=>es.forEach(e=>{const s=S.find(s=>s.el===e.target);if(s)s.vis=e.isIntersecting}));S.forEach(s=>io.observe(s.el));
  let ant=performance.now();
  const tick=ahora=>{if(id!==animId||!document.body.classList.contains("en-inicio")){io.disconnect();return}
    const dt=Math.min(ahora-ant,60)/1000;ant=ahora;
    S.forEach(s=>{if(!s.vis||ahora<s.pausa||(hover&&s.el.matches(":hover")))return;const mitad=s.el.scrollWidth/2;if(mitad<=s.el.clientWidth)return;
      if(!s.x)s.x=s.el.scrollLeft||(s.dir<0?mitad:0);s.x+=s.dir*32*dt;if(s.x>=mitad)s.x-=mitad;if(s.x<=0)s.x+=mitad;s.el.scrollLeft=s.x});
    requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
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
      <div class="eyebrow">${h?`Para el ${esc(h[0])}`:esc(p.cat)}</div>
      <h1 class="serif">${titulo}</h1>
      ${pl?`<div class="prueba-corta"><img src="${fp(pl,"cliente2")}" alt="">«${esc(pl.cita.split(",")[1]?.trim()||pl.cita)}…»</div>`:""}
      <div class="datos">${p.tam?`<span class="dato">📏 ${esc(p.tam)}</span>`:""}${pz?`<span class="dato">🧩 +${pz} piezas</span>`:""}${esEscudo(p)?`<span class="dato">⏳ 2 a 3 horas</span>`:""}</div>
      ${grp&&grp.filter(([s])=>porSlug(s)).length>1?`<div class="variantes"><div class="v-tit">${esTam(grp)?"Elige el tamaño":"Elige la versión"}</div><div class="v-ops">${grp.map(([s,l])=>{const v=porSlug(s);return v?`<button class="v-op${s===p.slug?" sel":""}" data-var="${s}"><b>${esc(l)}</b>${v.tam?`<span>${esc(v.tam)}</span>`:""}${v.precio?`<span class="v-precio">${clp(v.precio)}</span>`:""}</button>`:""}).join("")}</div></div>`:""}
      ${p.precio?`<div class="f-precio">${p.antes>p.precio?`<s>${clp(p.antes)}</s>`:""}<b>${clp(p.precio)}</b><span>${(()=>{const r=esEscudo(p)&&REGION_CLUB[ALIAS[p.slug]||p.slug];const zona=r?(r.includes("|")?" y a punto Blue en Calama":` y a punto Blue en ${r}`):"";return p.precio>=GRATIS_DESDE?`Envío gratis en Santiago${zona}`:`Envío gratis en Santiago${zona} desde $20.000`})()}</span></div>`:`<div class="f-precio"><b style="font-size:20px">${esc(p.det||"Precio a consultar")}</b></div>`}
      ${p.precio?`<div class="cta-info"><div class="cant"><button data-menos>−</button><span data-cantn>1</span><button data-mas1>+</button></div><button class="btn-grande" data-cta>Agregar al pedido</button></div>`:""}
      ${esEscudo(p)&&p.precio?ofertaCam(p):""}
      <ul class="confianza"><li>📦 Llega en caja, con las piezas separadas por color</li><li>🧩 Siempre van piezas de más</li><li>🚚 Santiago 1 a 3 días hábiles · regiones 2 a 5</li><li>💬 Confirmas y pagas por WhatsApp, con Javi y Caro</li></ul>
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
    <div class="contador"><div><b>126</b>pedidos solo en octubre</div><div><b>${nEsc}</b>escudos para elegir</div><div><b>Todo Chile</b>despachamos a todas las regiones</div></div>
    ${pl?`<div class="clientes">${pl.clientes.map(([k,txt])=>`<figure><img src="${fp(pl,k)}" alt="" loading="lazy"><figcaption>${esc(txt)}</figcaption></figure>`).join("")}</div>
      <p class="cita-grande">«${esc(pl.cita)}»<small>Cliente de Áureo, por WhatsApp</small></p>`:
      `<div class="clientes"><div class="placeholder">[Foto cliente 1]</div><div class="placeholder">[Foto cliente 2]</div><div class="placeholder">[Foto cliente 3]</div></div><p class="cita">[Frase real de un cliente, con su permiso]</p>`}</div>
  <div class="bloque obj"><h3>¿Y si…?</h3>
    <details open><summary>¿Y si no sé armarlo?</summary><p>Si sabes seguir colores, lo armas. El instructivo va fila por fila. Y si te trabas, nos escribes por WhatsApp y te ayudamos.</p></details>
    <details><summary>¿No es caro para unas piezas?</summary><p>${pz?`Son más de ${pz} piezas, `:""}2 a 3 horas de panorama y un cuadro ${p.tam?`de ${esc(p.tam)} `:""}que vas a tener colgado por años. Y lo hiciste tú.</p></details>
    <details><summary>¿Llega a tiempo?</summary><p>Santiago 1 a 3 días hábiles y regiones 2 a 5 desde que confirmamos el pago, con número de seguimiento. ¿Apurado? Al final puedes pasar tu pedido adelante en la fila de despacho.</p></details>
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
    <details><summary>¿Cuánto demora en llegar?</summary><p>Santiago 1 a 3 días hábiles y regiones 2 a 5, desde que confirmamos el pago.</p></details>
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
