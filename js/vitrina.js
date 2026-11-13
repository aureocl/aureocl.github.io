/* Vitrina: portada, catálogo por categoría y ficha/landing de cada producto.
   Parte de: W1 · Vitrina. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
/* ---------- Vistas ---------- */
let cat="Todo";
function modo(m,titulo=""){document.body.className=m+(FINAL?" final":"");document.getElementById("top").classList.toggle("en-ficha",m!=="en-catalogo");document.getElementById("titulo").textContent=titulo;document.getElementById("cab").style.display=m==="en-catalogo"?"":"none"}

function tarjeta(p){
  const tc=tramosCombo();
  return `<article class="card" data-ir="${p.slug}">
    <div class="foto">${img(p)}${p.etq?`<span class="etq">${esc(p.etq)}</span>`:""}</div>
    <div class="info"><div class="nombre">${esc(p.nombre)}</div>${p.tam?`<div class="tam">${esc(p.tam)}</div>`:""}
    ${p.precio?`<div class="precio">${p.antes>p.precio?`<s>${clp(p.antes)}</s>`:""}${clp(p.precio)}${p.antes>p.precio?`<span class="nota-lanz">Precio de lanzamiento · después ${clp(p.antes)}</span>`:""}</div>`:`<div class="precio consultar">Precio a consultar</div>`}
    ${p.precio?`<button class="btn-agregar" data-add="${p.slug}">+ Agregar</button>`:""}</div></article>`;
}
function vistaCatalogo(){
  modo("en-catalogo");
  const cats=[...new Set(P.map(p=>p.cat))].sort((a,b)=>{const i=ORDEN.indexOf(a),j=ORDEN.indexOf(b);return(i<0?99:i)-(j<0?99:j)});
  const q=norm(document.getElementById("buscar").value);
  const L=P.filter(p=>(cat==="Todo"||p.cat===cat)&&(!q||norm(p.nombre+" "+p.cat).includes(q)));
  const tc=tramosCombo(),c=comboFila(),s=solaFila();
  document.getElementById("vista").innerHTML=`
  <nav class="chips">${["Todo",...cats].map(x=>`<button class="chip${x===cat?" activa":""}" data-cat="${esc(x)}">${esc(x)}</button>`).join("")}</nav>
  ${cat==="Todo"&&!q?`<section class="hero"><h1 class="serif">Tu equipo,<br><em>armado por ti.</em></h1>
    <p>Escudos, camisetas y figuras en mini bloques. Llegan en caja, los armas en una tarde y quedan colgados en tu pared.</p>
    <div class="sellos"><div class="sello"><b>🚚</b>Envío gratis desde $20.000</div><div class="sello"><b>📦</b>Llega en caja, piezas por color</div><div class="sello"><b>🧩</b>Garantía piezas completas</div></div></section>`:""}
  <div class="wrap">${L.length?cats.filter(x=>L.some(p=>p.cat===x)).map(x=>{const ps=L.filter(p=>p.cat===x);
    return `<section><h2 class="sec">${esc(x)}<small>${ps.length}</small></h2>
    <div class="grilla">${ps.map(tarjeta).join("")}</div></section>`}).join(""):`<div class="a-pedido"><p class="serif" style="font-size:26px;margin:0">¿No está «${esc(q)}»?</p><p>Lo diseñamos a pedido: nos mandas la imagen, te decimos si se puede y te damos el precio.</p><a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero un escudo a pedido de: "+q)}">Pedir el mío por WhatsApp</a></div>`}</div>
  <footer><a class="avisame" target="_blank" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Áureo! Quiero que me avisen cuando lancen escudos y figuras nuevas.")}">🔔 Avísame de los lanzamientos</a><br><br>Precios en pesos chilenos · Pago por transferencia, coordinado por WhatsApp.</footer>`;
}

function vistaFicha(s){
  const p=porSlug(s);if(!p){location.hash="";return}
  modo("en-ficha",p.nombre);window.scrollTo(0,0);medir("ViewContent",{content_name:p.nombre,value:p.precio,currency:"CLP"});
  const h=esEscudo(p)?hincha(p):null, pl=PILOTO[p.slug]||null;
  const nombreCorto=p.nombre.replace(/ \(.*\)$/,"");
  const titulo=esEscudo(p)?`Tu ${esc(nombreCorto)},<br>armado por ti.`:`${esc(nombreCorto)},<br>armado por ti.`;
  const otros=P.filter(x=>x.cat===p.cat&&x.slug!==p.slug&&x.precio).slice(0,10);
  const nEsc=P.filter(esEscudo).length;
  const fotoO=(k,ph,ratio="1/1")=>pl&&pl[k]?`<img class="foto-bloque" src="${fp(pl,pl[k])}" alt="" loading="lazy">`:`<div class="placeholder" style="aspect-ratio:${ratio}">${ph}</div>`;
  let cant=1;
  document.getElementById("vista").innerHTML=`<div class="ficha">
  <div class="f-top">
    <div class="f-galeria">${pl?`<img class="principal" id="fotoP" src="${fp(pl,pl.galeria[0])}" alt="${esc(p.nombre)}">
      <div class="miniaturas">${pl.galeria.map((k,i)=>`<img src="${fp(pl,k)}" data-gal="${fp(pl,k)}" class="${i?"":"sel"}" alt="">`).join("")}</div>`:`<div class="f-hero">${img(p)}</div>`}</div>
    <div class="f-info">
      <div class="eyebrow">${h?`Para el ${esc(h[0])}`:esc(p.cat)}</div>
      <h1 class="serif">${titulo}</h1>
      ${pl?`<div class="prueba-corta"><img src="${fp(pl,"cliente2")}" alt="">«${esc(pl.cita.split(",")[1]?.trim()||pl.cita)}…»</div>`:""}
      <div class="datos">${p.tam?`<span class="dato">📏 ${esc(p.tam)}</span>`:""}${h&&h[1]?`<span class="dato">🧩 +${h[1]} piezas</span>`:""}${esEscudo(p)?`<span class="dato">⏳ 2 a 3 horas</span>`:""}</div>
      ${p.precio?`<div class="f-precio">${p.antes>p.precio?`<s>${clp(p.antes)}</s>`:""}<b>${clp(p.precio)}</b><span>${p.precio>=19000?"Envío gratis en Santiago":"Envío desde $2.000"}</span></div>`:`<div class="f-precio"><b style="font-size:20px">Precio a consultar</b></div>`}
      ${p.precio?`<div class="cta-info"><div class="cant"><button data-menos>−</button><span data-cantn>1</span><button data-mas1>+</button></div><button class="btn-grande" data-cta>Agregar al pedido</button></div>`:""}
      <ul class="confianza"><li>📦 Llega en caja, con las piezas separadas por color</li><li>🧩 Garantía piezas completas</li><li>🚚 Santiago 1 a 3 días hábiles · regiones 2 a 5</li><li>💬 Confirmas y pagas por WhatsApp, con Javi y Caro</li></ul>
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
  <div class="bloque split inv"><div>${fotoO("pared","[Foto: el escudo colgado en una pared]")}</div><div><h3>Del porte de un póster</h3><p>${p.tam?`Armado mide <b>${esc(p.tam)}</b>${h&&h[1]?`, con más de ${h[1]} piezas`:""}.`:""} Se ve desde la puerta, en tu pieza, el living o la oficina.</p></div></div>
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
    <details><summary>¿No es caro para unas piezas?</summary><p>${h&&h[1]?`Son más de ${h[1]} piezas, `:""}2 a 3 horas de panorama y un cuadro ${p.tam?`de ${esc(p.tam)} `:""}que vas a tener colgado por años. Y lo hiciste tú.</p></details>
    <details><summary>¿Llega a tiempo?</summary><p>Santiago 1 a 3 días hábiles y regiones 2 a 5 desde que confirmamos el pago, con número de seguimiento. ¿Apurado? Al final puedes pasar tu pedido adelante en la fila de despacho.</p></details>
    <details><summary>¿Es seguro pagar por transferencia?</summary><p>Confirmas tu pedido por WhatsApp con nosotros, Javi y Caro. Te mandamos los datos y, cuando sale, el número de seguimiento.</p></details></div>
  <div class="bloque"><h3>Nuestras garantías</h3><div class="garantias">
    <div><i>🧩</i><b>Piezas completas</b>Vienen repuestos y, si falta alguna, te la mandamos.</div>
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
  document.querySelectorAll("[data-gal]").forEach(m=>m.onclick=()=>{document.getElementById("fotoP").src=m.dataset.gal;document.querySelectorAll("[data-gal]").forEach(x=>x.classList.toggle("sel",x===m))});
  if(p.precio){
    const upd=()=>{document.querySelectorAll("[data-cantn]").forEach(n=>n.textContent=cant);const b=document.getElementById("agregarF");if(b)b.textContent=`Agregar al pedido · ${clp(p.precio*cant)}`};
    document.querySelectorAll("[data-menos]").forEach(x=>x.onclick=()=>{if(cant>1){cant--;upd()}});
    document.querySelectorAll("[data-mas1]").forEach(x=>x.onclick=()=>{cant++;upd()});
    document.querySelectorAll("[data-cta]").forEach(x=>x.onclick=()=>{agregar(p.slug,cant,true);if(!metaRegalo)metaRegalo=subtotal()+PROP.regaloMas;paso=0;location.hash="#pedido"});
  }
}
