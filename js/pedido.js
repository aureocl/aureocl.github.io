/* Pedido: checkout guiado (una oferta por pantalla), totales y «Pedido listo».
   Parte de: W2 · Embudo y pedido. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */

/* ---------- Checkout guiado: una oferta por pantalla ---------- */
const escudosEn=()=>items().filter(x=>esEscudo(x.p));
const nEscudos=()=>escudosEn().reduce((a,x)=>a+x.c,0);
/* Descuento por escudos (Áureo, 17-nov-2026): desde 2 escudos, $1.000 por cada uno (2 = $2.000, 3 = $3.000, 4 = $4.000…). */
const descEscudos=n=>PROP.descPorEscudo&&n>=2?n*PROP.descPorEscudo:0;
function solasPrecio(n){const s=solaFila();if(!s||!n)return 0;const m=(s.det.match(/\$[\d.]+/g)||[]).map(num);const T3={1:s.precio,2:m[0]||s.precio*2,3:m[1]||s.precio*3};return n<=3?T3[n]:T3[3]+(n-3)*(m[2]||s.precio)}
function precioCams(n){const tc=tramosCombo();if(!n||!tc)return 0;return n<=3?tc[n]:tc[3]+(n-3)*(tc.extra||tc[1])}
const camRegalo=()=>PROP.camRegaloCada&&camisetas.length>=PROP.camRegaloCada;
function totales(){
  const tc=tramosCombo(), cam=precioCams(camisetas.length), mini=minis*5000;
  const desc=descEscudos(nEscudos()), emp=bumps.empaque?PROP.empaque:0;
  const descCol=Math.round(items().filter(x=>coleccion.has(x.s)).reduce((s,x)=>s+x.p.precio*PROP.coleccionDesc,0)/10)*10;
  return {cam,mini,desc,emp,descCol,base:subtotal()+cam+mini+emp-desc-descCol};
}
function complementos(){const e0=escudosEn()[0];if(!e0)return[];const club=norm(e0.p.nombre);
  return P.filter(x=>x.precio&&!esEscudo(x)&&!/camiseta/i.test(x.nombre)&&(norm(x.nombre).includes(club)||/pelota|copa|bufanda/i.test(x.nombre)))}
function pasos(){const e=escudosEn().length>0;return["pedido",...(e?["camisetas",complementos().length?"coleccion":"segundo"]:["minis"]),"entrega","pago"]}
/* Mini de regalo: solo suman los productos desde PROP.regaloMinProducto ($13.000) y el pack de camisetas. */
let metaRegalo=0;
const sumaRegalo=p=>p&&(p.precio||0)>=PROP.regaloMinProducto;
const baseRegalo=()=>items().filter(x=>sumaRegalo(x.p)).reduce((a,x)=>a+x.p.precio*x.c,0)+precioCams(camisetas.length);
function fijarMeta(){if(!metaRegalo)metaRegalo=Math.max(baseRegalo(),PROP.regaloMinProducto)+PROP.regaloMas}
const ganaRegalo=()=>!!(PROP.barra&&metaRegalo&&baseRegalo()>=metaRegalo);
function barra(base){if(!PROP.barra)return"";const meta=metaRegalo,br=baseRegalo(),pct=Math.min(100,(base<GRATIS_DESDE?base:br)/meta*100);
  const dg=dondeGratis();
  const txt=base<GRATIS_DESDE?`Te faltan <b>${clp(GRATIS_DESDE-base)}</b> para el envío gratis ${dg} 🚚`:br<meta?`¡Envío gratis ${dg}! Te faltan <b>${clp(meta-br)}</b> para una <b>mini sorpresa de regalo</b> 🎁<small style="display:block;color:var(--suave)">Suman los productos desde ${clp(PROP.regaloMinProducto)}</small>`:`<b>¡Ganaste una mini sorpresa de regalo!</b> 🎁`;
  return `<div class="progreso">${txt}<div class="riel"><div style="width:${pct}%"></div></div><div class="hitos"><span>$0</span><span>🚚 $20.000</span><span>🎁 ${clp(meta)}</span></div></div>`}
function puntos(){const S=pasos();return `<div class="puntos">${S.map((_,k)=>`<i class="${k<=paso?"ok":""}"></i>`).join("")}</div>`}
function mirar(){
  const enCarro=new Set(carro.map(c=>c.s)), cats=[...new Set(items().map(x=>x.p.cat))];
  const todas=[...new Set(P.filter(sumaRegalo).map(x=>x.cat))].sort((a,b)=>(cats.includes(b)-cats.includes(a))||ORDEN.indexOf(a)-ORDEN.indexOf(b));
  const cat=mirarCat||todas[0];
  /* Solo productos desde $13.000: con minis no se llega a la mini de regalo (Áureo, 20-nov-2026). */
  const L=P.filter(x=>x.cat===cat&&sumaRegalo(x)&&!enCarro.has(x.slug)&&!/camiseta/i.test(x.nombre)).slice(0,12);
  return `<div class="mirar"><div class="chips2">${todas.filter(c=>!/camiseta|personaliz/i.test(c)&&P.some(x=>x.cat===c&&sumaRegalo(x))).map(c=>`<button class="${c===cat?"sel":""}" data-mcat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div class="fila-prod">${L.map(x=>`<div class="prod">${img(x)}<b>${esc(x.nombre)}</b>${clp(x.precio)}<button data-madd="${x.slug}">+ Agregar</button></div>`).join("")}
    <div class="prod todo" onclick="location.hash=''">Ver todo el catálogo →</div></div></div>`;
}
function siguiente(){const S=pasos();paso=Math.min(paso+1,S.length-1);vistaPedido()}

function vistaPedido(){
  modo("en-pedido","Tu pedido");window.scrollTo(0,0);
  const v=document.getElementById("vista"), I=items(), S=pasos();
  if(!I.length){paso=0;metaRegalo=0;v.innerHTML=`<div class="wrap vacio-carro"><p class="serif" style="font-size:26px">Tu pedido está vacío</p><p class="nota">Elige tu escudo y vuelve aquí.</p><button class="btn-grande" style="max-width:280px;margin-top:10px" onclick="location.hash=''">Ver catálogo</button></div>`;return}
  if(!escudosEn().length)camisetas=[];
  if(paso>=S.length)paso=S.length-1;
  fijarMeta();
  const etapa=S[paso], T=totales(), tc=tramosCombo(), sola=solaFila();
  const e0=escudosEn()[0], h=e0?hincha(e0.p):null, apodo=h?h[0]:"hincha";
  let html="", pie="";

  if(etapa==="pedido"){
    const g=enviadoReciente();
    html=`${g?`<div class="panel" style="border-color:var(--oro)"><p class="nota" style="margin:0">Ya enviaste este pedido (<b>${esc(g.id)}</b>). Si no alcanzó a llegar, continúa y mándalo de nuevo. Si quieres hacer otro, <a href="#" data-nuevo>empieza un pedido nuevo</a>.</p></div>`:""}<div class="panel"><h3>Lo que llevas</h3>${I.map(x=>`<div class="item">${img(x.p)}<div class="n">${esc(x.p.nombre)}<small>${clp(x.p.precio)} c/u</small></div>
      <div class="cant"><button data-q="${x.s}" data-d="-1">−</button><span>${x.c}</span><button data-q="${x.s}" data-d="1">+</button></div></div>`).join("")}
      ${T.cam?`<div class="res"><span>👕 ${camisetas.length} camiseta${camisetas.length>1?"s":""} del pack <small style="color:var(--suave)">nombre y número en el paso siguiente</small></span><span>${clp(T.cam)}</span></div>`:""}
      ${T.desc?`<div class="res"><span>Descuento por ${nEscudos()} escudos</span><span style="color:var(--verde)">−${clp(T.desc)}</span></div>`:""}
      <button class="op" style="margin-top:8px" data-mirar>${mirando?"Cerrar":"+ Seguir mirando"}</button>${mirando?mirar():""}</div>${barra(T.base)}`;
    pie=`<button class="btn-grande" data-sig>Continuar · ${clp(T.base)}</button>`;
  }

  if(etapa==="camisetas"){
    const solas=(()=>{const s=sola;if(!s)return n=>0;const m=(s.det.match(/\$[\d.]+/g)||[]).map(num);const T3={1:s.precio,2:m[0]||s.precio*2,3:m[1]||s.precio*3};return n=>n<=3?T3[n]:T3[3]+(n-3)*(m[2]||s.precio)})();
    const eqBase=(EQUIPOS_CAM.find(x=>norm(x[0])===norm(e0.p.nombre))||[e0.p.nombre])[0];
    /* Solo camisetas del mismo equipo del escudo (Áureo, 21-nov-2026): el par de config.js (parCam). Si el equipo no tiene,
       salen las de clientes de ese club; nunca las de otro equipo. El carrusel mezclado solo sale cuando no hay par. */
    const par=parCam(e0.p), cams=par.length?par:CAMISETAS.filter(c=>norm(c[2])===norm(e0.p.nombre)).slice(0,2).map(([f])=>CAM_BASE+f);
    const k=camisetas.length, opsEq=eq=>[eqBase,...EQUIPOS_CAM.map(x=>x[0]).filter(x=>x!==eqBase),OTRO_EQ].map(x=>`<option${x===eq?" selected":""}>${esc(x)}</option>`).join("");
    const fila=(c,i,reg)=>`<div class="cam-fila${reg?" regalo":""}"><img src="${fotoEq(c.eq||eqBase)}" alt="" data-fimg="${reg?"r":i}">
      <div><div class="et">${reg?"🎁 DE REGALO":"Camiseta "+(i+1)}</div><select data-ceq="${reg?"r":i}">${opsEq(c.eq||eqBase)}</select>
      <div class="nn"><input maxlength="5" placeholder="Nombre (máx. 5)" value="${esc(c.n)}" data-cn="${reg?"r":i}"><input class="num" inputmode="numeric" maxlength="2" placeholder="N°" value="${esc(c.d)}" data-cd="${reg?"r":i}"></div></div></div>`;
    const falta=PROP.camRegaloCada&&k?PROP.camRegaloCada-k:0, R=PROP.camRegaloCada;
    html=`<div class="oferta">${tag("1 de 2")}<div class="t1">Solo por llevar tu escudo</div>
      <h2>El pack del ${esc(apodo)}</h2>
      <p style="margin:0">Tu ${esc(e0.p.nombre)} + una camiseta con el nombre y el número de cada uno. ¿En tu casa hay de otro equipo? Cada camiseta puede ser de un club distinto.</p>
      <div class="montaje${par.length?" par":""}">${img(e0.p)}${cams.length?`<span class="mas">+</span><div class="cams">${cams.map(s=>`<img src="${s}" alt="">`).join("")}</div>`:""}</div>
      ${par.length?"":carrusel()}
      <div class="opciones">${[1,2,3,4,5].map(n=>`<button class="op${k===n?" sel":""}" data-cam="${n}"><b>${n===R?`${n} + 1 🎁`:n}</b><s style="color:var(--suave)">${clp(solas(n))}</s> ${clp(precioCams(n))}</button>`).join("")}</div>
      ${R&&!k?`<p class="nota" style="margin:8px 0 0;text-align:center">🎁 <b>Si llevas ${R}, te regalamos la ${R+1}.ª</b></p>`:""}
      ${k?`<div class="precios"><s>${clp(e0.p.precio+solas(k))}</s><b>${clp(e0.p.precio+precioCams(k))}</b><span>Ahorras ${clp(solas(k)-precioCams(k))}</span></div>
        ${camisetas.map((c,i)=>fila(c,i,false)).join("")}
        ${camRegalo()?fila(datos.camReg||{},0,true):`<div class="meta-cam">${tag("G")}🎁 Si llevas ${R}, te regalamos la ${R+1}.ª. ${falta>0?`Te ${falta===1?"falta 1":`faltan ${falta}`}.`:""}</div>`}`:""}
      </div>`;
    pie=k?`<button class="btn-grande oro" data-sig>Sí, agregar el pack</button>`:`<button class="btn-grande oro" data-cam="2">Quiero el pack</button>`;
    html+=`<button class="no-gracias" data-nogracias="camisetas">No, gracias, solo el escudo</button>`;
  }

  if(etapa==="coleccion"){
    const C=complementos(), pr=PROXIMOS[e0.s]||[], pct=Math.round(PROP.coleccionDesc*100);
    const en=s=>carro.some(c=>c.s===s);
    html=`<div class="oferta coleccion">${tag("2 de 2")}<div class="t1">Oferta única · solo en este paso</div>
      <h2>Completa la colección del ${esc(apodo)}</h2>
      <p style="margin:0">Escudo, camiseta y más: todo lo del ${esc(e0.p.nombre)} con <b>${pct}% de descuento</b>, en el mismo envío. Si sigues, esta oferta no vuelve a aparecer.</p>
      <div class="montaje">${img(e0.p)}<span class="mas">+</span><div class="cams">${(camisetas.length?[fotoEq((EQUIPOS_CAM.find(x=>norm(x[0])===norm(e0.p.nombre))||[])[0])]:[]).map(s=>`<img src="${s}" alt="">`).join("")}${C.slice(0,1).map(x=>img(x)).join("")}</div></div>
      ${C.map(x=>`<div class="item-c${en(x.slug)?" en":""}">${img(x)}<div class="info-c"><b>${esc(x.nombre)}</b><s style="color:var(--suave)">${clp(x.precio)}</s> ${clp(Math.round(x.precio*(1-PROP.coleccionDesc)/10)*10)}</div><button data-col="${x.slug}">${en(x.slug)?"✓ Agregado":"+ Agregar"}</button></div>`).join("")}
      ${pr.map(([n,e])=>`<div class="item-c prox"><div class="placeholder" style="width:64px;height:64px;padding:2px;font-size:9px">[foto]</div><div class="info-c"><b>${esc(n)}</b>${esc(e)}</div></div>`).join("")}
      ${T.descCol?`<div class="precios"><b>−${clp(T.descCol)}</b><span>Ahorro de la colección</span></div>`:""}
      </div><button class="no-gracias" data-nogracias="coleccion">No, gracias</button>`;
    pie=`<button class="btn-grande" data-sig>Continuar · ${clp(T.base)}</button>`;
    medir("OfertaVista",{oferta:"coleccion"});
  }

  if(etapa==="segundo"){
    const n0=nEscudos(), desc=descEscudos(n0+1)-descEscudos(n0), otros=P.filter(x=>esEscudo(x)&&x.precio&&x.slug!==e0.s).slice(0,9);
    html=`<div class="oferta">${tag("2 de 2")}<div class="t1">Una sola vez, aquí</div>
      <h2>¿Alguien más en tu familia es hincha?</h2>
      <p style="margin:0">Llévale el suyo: <b>por cada escudo te descontamos ${clp(PROP.descPorEscudo)}</b> (2 escudos = ${clp(descEscudos(2))} menos, 3 = ${clp(descEscudos(3))} menos, y así). Viajan juntos, en el mismo envío.</p>
      <button class="op" style="width:100%;margin-top:12px;display:flex;gap:10px;align-items:center" data-seg="${e0.s}">${img(e0.p)}<span style="text-align:left"><b>Otro ${esc(e0.p.nombre)}</b><s style="color:var(--suave)">${clp(e0.p.precio)}</s> <b style="display:inline">${clp(e0.p.precio-desc)}</b></span></button>
      <p class="nota" style="margin-top:12px">O elige el de otro equipo:</p>
      <div class="elige">${otros.map(x=>`<button data-seg="${x.slug}">${img(x)}<b>${esc(x.nombre)}</b><s>${clp(x.precio)}</s>${clp(x.precio-desc)}</button>`).join("")}</div></div>
      <button class="no-gracias" data-nogracias="segundo">No, gracias</button>`;
    pie=`<button class="btn-grande" data-sig>Continuar · ${clp(T.base)}</button>`;
  }

  if(etapa==="minis"){
    const M=P.filter(x=>/3D mini/i.test(x.cat)&&x.precio&&x.precio<=7000&&!carro.some(c=>c.s===x.slug)).slice(0,9);
    html=`<div class="oferta">${tag("1 de 1")}<div class="t1">Antes de terminar</div>
      <h2>Agrégale una mini por poco</h2><p style="margin:0">Van en el mismo envío. ${T.base<GRATIS_DESDE?`Con ${clp(GRATIS_DESDE-T.base)} más, el envío es gratis ${dondeGratis()}.`:""}</p>
      <div class="elige">${M.map(x=>`<button data-mas="${x.slug}">${img(x)}<b>${esc(x.nombre)}</b>+ ${clp(x.precio)}</button>`).join("")}</div></div>
      <button class="no-gracias" data-nogracias="minis">No, gracias</button>`;
    pie=`<button class="btn-grande" data-sig>Continuar · ${clp(T.base)}</button>`;
  }

  if(etapa==="entrega"){
    const punto=datos.mod==="Punto Bluexpress";
    const dedOps=[escudosEn().length?`Para el ${apodo} más grande de la casa`:"Para el más fan de la casa","Feliz cumpleaños. Que lo disfrutes armándolo","Feliz Navidad, con todo el cariño"];
    const minisFoto=P.filter(x=>/3D mini/i.test(x.cat)&&x.precio).slice(0,3);
    const sel=(i)=>`<select data-serie="${i}"><option value="">Serie ${i+1}…</option>${SERIES.map(s=>`<option${(datos.series||[])[i]===s?" selected":""}>${s}</option>`).join("")}</select>`;
    html=`<div class="panel"><h3>¿A dónde lo mandamos?</h3>
    <label class="campo">Nombre y apellido de quien recibe<input id="fNom" autocomplete="name"></label>
    <div class="fila"><label class="campo" style="flex:1">Teléfono<input id="fTel" type="tel" inputmode="tel" autocomplete="tel" placeholder="9 1234 5678"></label>
      <label class="campo" style="flex:1">Correo<input id="fMail" type="email" inputmode="email" autocomplete="email" placeholder="tu@correo.cl"></label></div>
    <div class="fila"><label class="campo" style="flex:1">Región<select id="fReg">${REGIONES.map(r=>`<option>${r}</option>`).join("")}</select></label>
      <label class="campo" style="flex:1">Comuna<input id="fCom"></label></div>
    <div class="opciones"><button class="op${!punto?" sel":""}" data-mod="Domicilio"><b>🏠 A domicilio</b></button><button class="op${punto?" sel":""}" data-mod="Punto Bluexpress"><b>📍 Punto Blue Express</b></button></div>
    ${punto?`<p class="nota" style="margin:8px 0 0">Escribe tu dirección y nosotros te buscamos el Punto Blue Express más cercano. Te lo confirmamos por WhatsApp antes de enviar.</p>`:""}
    <label class="campo" id="lDir">${punto?"Tu dirección (calle y número), para buscarte el punto más cercano":"Dirección (calle y número)"}<input id="fDir" autocomplete="address-line1" placeholder="Ej.: Av. Matta 1234"></label>
    ${punto?"":`<label class="campo" id="lRef">Depto, casa, condominio o referencia <small style="color:var(--suave)">(opcional)</small><input id="fRef" autocomplete="address-line2" placeholder="Ej.: Depto 504, torre B"></label>`}
    <div class="envio-linea"><span style="font-size:22px">🚚</span><span id="envioLinea"></span></div>
    <label class="check"><input type="checkbox" id="fReg2" ${datos.regalo?"checked":""}> Es para regalo: lo mandamos directo</label>
    ${datos.regalo&&PROP.empaque?`<label class="bump"><input type="checkbox" data-bump="empaque" ${bumps.empaque?"checked":""}><span>${tag("D")}<b>Empaque de regalo + tarjeta escrita a mano · ${clp(PROP.empaque)}</b>Llega listo para entregar.</span></label>
      ${bumps.empaque?`<div style="margin-top:8px"><input id="dedTxt" maxlength="50" placeholder="Tu dedicatoria (máx. 50 caracteres)" value="${esc(datos.ded||"")}" style="width:100%;padding:10px;border:1px solid var(--linea);border-radius:10px;font:inherit"><div class="cuenta" id="dedCuenta">${(datos.ded||"").length}/50</div>
        <div class="chips-ded">${dedOps.map(d=>`<button type="button" data-ded="${esc(d)}">“${esc(d)}”</button>`).join("")}</div></div>`:""}`:""}
    </div>
    ${ganaRegalo()?`<div class="mini-regalo">${tag("B")}<b>🎁 Ganaste una minifigura sorpresa de regalo</b>
      <p class="nota" style="margin:4px 0 0">Una figura 3D en mini bloques, como estas. Elige 4 series que te gusten y nosotros elegimos cuál te llega.</p>
      <div class="fotos">${minisFoto.map(x=>img(x)).join("")}</div>
      <div class="series">${[0,1,2,3].map(sel).join("")}</div></div>`:""}
    <div class="panel"><h3>Resumen</h3>
    ${I.map(x=>`<div class="res"><span>${esc(x.p.nombre)} × ${x.c}</span><span>${clp(x.p.precio*x.c)}</span></div>`).join("")}
    ${T.cam?`<div class="res"><span>Camisetas × ${camisetas.length}${camRegalo()?" + 1 de regalo":""} <small style="color:var(--verde)">pack</small></span><span>${clp(T.cam)}</span></div>`:""}
    ${T.descCol?`<div class="res"><span>Oferta de la colección</span><span style="color:var(--verde)">−${clp(T.descCol)}</span></div>`:""}
    ${T.desc?`<div class="res"><span>Descuento por ${nEscudos()} escudos</span><span style="color:var(--verde)">−${clp(T.desc)}</span></div>`:""}
    ${T.mini?`<div class="res"><span>Mini sorpresa × ${minis}</span><span>${clp(T.mini)}</span></div>`:""}
    ${T.emp?`<div class="res"><span>Empaque de regalo</span><span>${clp(T.emp)}</span></div>`:""}
    ${ganaRegalo()?`<div class="res"><span>🎁 Minifigura sorpresa</span><span style="color:var(--verde)">$0</span></div>`:""}
    <div class="res"><span id="envioRes"></span><span id="envioTxt"></span></div>
    ${PROP.prioridad?`<label class="prio"><input type="checkbox" id="fPrio" ${datos.prio?"checked":""}><span><b>⚡ Prioridad en el despacho +${clp(PROP.prioridad)}</b><span id="prioTxt"></span></span></label>`:""}
    <div class="res total"><span>Total</span><span id="totalTxt"></span></div>
    <div class="ahorro" id="ahorro"></div>
    <p class="nota">Tus datos los usamos solo para preparar y enviar tu pedido.</p></div>`;
    pie=`<button class="btn-grande" id="alPago">Continuar al pago</button>`;
  }

  /* Paga y envía (Áureo, 20-nov-2026): las cuentas de Javi y Caro con «Copiar» ANTES de abrir WhatsApp. */
  if(etapa==="pago"){
    const F=totalFinal(), C=cuentasListas(), sel=C.find(c=>c.quien===datos.cuenta)||C[0];
    const fila=(k,v)=>`<div class="dato-p"><div><span>${esc(k)}</span><br><b>${esc(v)}</b></div><button data-copiar="${esc(v)}">Copiar</button></div>`;
    html=`<div class="panel"><h3>Paga por transferencia</h3>
      ${fila("Total a transferir",String(F.total)).replace(`<b>${F.total}</b>`,`<b>${clp(F.total)}</b>`)}
      ${C.length?`<p class="nota" style="margin:12px 0 6px">Transfiere a <b>una</b> de estas cuentas:</p>
        ${C.length>1?`<div class="opciones">${C.map(c=>`<button class="op${c===sel?" sel":""}" data-cuenta="${esc(c.quien)}"><b>Cuenta de ${esc(c.quien)}</b></button>`).join("")}</div>`:""}
        ${sel.datos.map(([k,v])=>fila(k,v)).join("")}
        <p class="nota" style="margin:10px 0 0">Después de transferir, envíanos el pedido por WhatsApp y el comprobante. Con eso lo dejamos listo.</p>`
      :`<p class="nota" style="margin:12px 0 0">Envíanos el pedido por WhatsApp y te mandamos ahí los datos para transferir.</p>`}
      </div>
      <div class="panel"><h3>Tu pedido</h3>${resumenCorto(F).map(l=>`<div class="res"><span>${esc(l)}</span></div>`).join("")}<div class="res total"><span>Total</span><span>${clp(F.total)}</span></div></div>
      ${C.length?`<button class="no-gracias" data-enviar="despues">Enviar el pedido ahora y transferir después</button>`:""}`;
    pie=C.length?`<button class="btn-grande wa" data-enviar="pagado">Ya transferí · Enviar por WhatsApp</button>`:`<button class="btn-grande wa" data-enviar="despues">Enviar pedido por WhatsApp</button>`;
  }

  if(etapa==="pago"&&EQUIPO){
    const F=totalFinal();
    html=`<div class="panel"><h3>Modo equipo · ${esc(EQUIPO)}</h3><p class="nota" style="margin:0">El pedido se guarda en la <b>bandeja</b> como «Pendiente», con los datos del cliente. No se abre WhatsApp. Cuando el cliente pague, márcalo en la bandeja.</p></div>
      <div class="panel"><h3>Pedido de ${esc(datos.nom||"")}</h3>${resumenCorto(F).map(l=>`<div class="res"><span>${esc(l)}</span></div>`).join("")}<div class="res total"><span>Total</span><span>${clp(F.total)}</span></div></div>`;
    pie=`<button class="btn-grande" id="guardarEq">Guardar en la bandeja</button>`;
  }
  v.innerHTML=`<div class="wrap pedido">${puntos()}${html}</div><div class="barra-fija">${pie}</div>`;

  // Eventos comunes
  v.querySelectorAll("[data-sig]").forEach(b=>b.onclick=()=>{if(etapa==="camisetas"&&camisetas.length)medir("OfertaAceptada",{oferta:"pack",camisetas:camisetas.length});if(etapa==="camisetas"&&([...camisetas,...(camRegalo()?[datos.camReg||{}]:[])]).some(c=>!c.n||c.d===""||c.d===undefined)){toast("Escribe el nombre y el número de cada camiseta");return}siguiente()});
  v.querySelectorAll("[data-nogracias]").forEach(b=>b.onclick=()=>{if(b.dataset.nogracias==="camisetas")camisetas=[];siguiente()});
  v.querySelectorAll("[data-nuevo]").forEach(a=>a.onclick=ev=>{ev.preventDefault();pedidoNuevo()});
  v.querySelectorAll("[data-mirar]").forEach(b=>b.onclick=()=>{mirando=!mirando;vistaPedido()});
  v.querySelectorAll("[data-mcat]").forEach(b=>b.onclick=()=>{mirarCat=b.dataset.mcat;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  v.querySelectorAll("[data-madd]").forEach(b=>b.onclick=()=>{agregar(b.dataset.madd,1,true);const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  v.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const it=carro.find(x=>x.s===b.dataset.q);it.c+=+b.dataset.d;if(it.c<1)carro=carro.filter(x=>x!==it);guardar();vistaPedido()});
  const camDe=k=>k==="r"?(datos.camReg=datos.camReg||{n:"",d:""}):camisetas[+k];
  v.querySelectorAll("[data-cam]").forEach(b=>b.onclick=()=>{const k=+b.dataset.cam;camisetas=Array.from({length:k},(_,i)=>camisetas[i]||{n:"",d:""});const x=window.scrollY;vistaPedido();if(etapa==="camisetas")window.scrollTo(0,x)});
  v.querySelectorAll("[data-cn]").forEach(i=>i.oninput=()=>camDe(i.dataset.cn).n=i.value.toUpperCase());
  v.querySelectorAll("[data-cd]").forEach(i=>i.oninput=()=>camDe(i.dataset.cd).d=i.value.replace(/\D/g,""));
  v.querySelectorAll("[data-ceq]").forEach(s=>s.onchange=()=>{camDe(s.dataset.ceq).eq=s.value;v.querySelector(`[data-fimg="${s.dataset.ceq}"]`).src=fotoEq(s.value)});
  v.querySelectorAll("[data-col]").forEach(b=>b.onclick=()=>{const s=b.dataset.col;if(carro.some(c=>c.s===s)){carro=carro.filter(c=>c.s!==s);coleccion.delete(s);guardar()}else{agregar(s,1,true);coleccion.add(s);medir("OfertaAceptada",{oferta:"coleccion",item:s})}const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  v.querySelectorAll("[data-seg]").forEach(b=>b.onclick=()=>{agregar(b.dataset.seg,1,true);toast(`Descuento por ${nEscudos()} escudos: −${clp(descEscudos(nEscudos()))}`);siguiente()});
  v.querySelectorAll("[data-mas]").forEach(b=>b.onclick=()=>{agregar(b.dataset.mas,1);vistaPedido()});
  v.querySelectorAll("[data-copiar]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copiar);b.textContent="✓ Copiado"}catch(e){b.textContent="Mantén apretado para copiar"}});
  if(etapa==="pago"&&EQUIPO){document.getElementById("guardarEq").onclick=ev=>guardarEquipo(ev.currentTarget);return}
  if(etapa==="pago"){
    v.querySelectorAll("[data-cuenta]").forEach(b=>b.onclick=()=>{datos.cuenta=b.dataset.cuenta;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
    v.querySelectorAll("[data-enviar]").forEach(b=>b.onclick=()=>enviarPedido(b.dataset.enviar==="pagado"));
    return;
  }
  if(etapa!=="entrega")return;

  const base=T.base;
  [["fNom","nom"],["fTel","tel"],["fMail","mail"],["fReg","reg"],["fCom","com"],["fDir","dir"],["fRef","ref"]].forEach(([id,k])=>{const el=document.getElementById(id);if(!el)return;if(datos[k])el.value=datos[k];el.addEventListener("input",()=>{datos[k]=el.value;calc()});el.addEventListener("change",()=>{datos[k]=el.value;calc()})});
  const fr=document.getElementById("fReg2");fr.onchange=()=>{datos.regalo=fr.checked;if(!fr.checked)bumps.empaque=false;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)};
  v.querySelectorAll("[data-bump]").forEach(b=>b.onchange=()=>{bumps[b.dataset.bump]=b.checked;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  const de=document.getElementById("dedTxt");if(de)de.oninput=()=>{datos.ded=de.value;document.getElementById("dedCuenta").textContent=de.value.length+"/50"};
  v.querySelectorAll("[data-ded]").forEach(b=>b.onclick=()=>{datos.ded=b.dataset.ded;de.value=datos.ded;document.getElementById("dedCuenta").textContent=datos.ded.length+"/50"});
  v.querySelectorAll("[data-serie]").forEach(s=>s.onchange=()=>{datos.series=datos.series||[];datos.series[+s.dataset.serie]=s.value});
  var calc=()=>{const reg=document.getElementById("fReg").value,com=document.getElementById("fCom").value,mod=datos.mod||"Domicilio",e=envio(reg,com,mod,base);
    const stgo=reg==="Metropolitana",dias=stgo?"1 a 3 días hábiles":"2 a 5 días hábiles";
    const donde=mod==="Domicilio"?`a domicilio${com?" en "+com:""}`:`a tu Punto Blue${com?" en "+com:""}`;
    document.getElementById("envioLinea").innerHTML=`<b>Envío ${donde}: ${e.c?clp(e.c):"Gratis"}</b>${e.porque?e.porque+" · ":""}llega en ${dias}`;
    document.getElementById("envioRes").textContent="Envío "+(mod==="Domicilio"?"a domicilio":"a Punto Blue");
    document.getElementById("envioTxt").textContent=e.c?clp(e.c):"Gratis";
    const pt=document.getElementById("prioTxt");if(pt)pt.textContent="Tu pedido pasa adelante de la fila: lo armamos y despachamos antes que los pedidos que están esperando.";
    const tot=e.c+(datos.prio?PROP.prioridad:0);
    document.getElementById("totalTxt").textContent=clp(base+tot);
    const A=[];
    if(camisetas.length){const d=solasPrecio(camisetas.length)-precioCams(camisetas.length);if(d>0)A.push(["Camisetas del pack (vs. sueltas)",d])}
    if(camRegalo())A.push(["Camiseta de regalo",solaFila()?solaFila().precio:0]);
    if(T.desc)A.push([`Descuento por ${nEscudos()} escudos`,T.desc]);
    if(T.descCol)A.push(["Oferta de la colección",T.descCol]);
    if(ganaRegalo())A.push(["Minifigura sorpresa de regalo",5000]);
    if(!e.c)A.push(["Envío gratis",mod==="Domicilio"?3000:2000]);
    const ah=A.reduce((s,x)=>s+x[1],0);
    document.getElementById("ahorro").innerHTML=`<div class="fila-a"><span>Pagas</span><b>${clp(base+tot)}</b></div>${ah?`<div class="fila-a verde"><span>Ahorras en total</span><b>${clp(ah)}</b></div><ul>${A.map(([n,v])=>`<li><span>${n}</span><span>${clp(v)}</span></li>`).join("")}</ul>`:""}`;
    return{...e,tot}};
  calc();
  const fp=document.getElementById("fPrio");if(fp)fp.onchange=()=>{datos.prio=fp.checked;calc()};
  v.querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>{datos.mod=b.dataset.mod;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  document.getElementById("alPago").onclick=()=>{
    const g=id=>document.getElementById(id).value.trim();
    const falta=[["fNom","nombre"],["fTel","teléfono"],...(EQUIPO?[]:[["fMail","correo"]]),["fCom","comuna"],["fDir","dirección"]].filter(([id])=>!g(id)).map(([,n])=>n);
    if(falta.length){toast("Falta: "+falta.join(", "));return}
    if(g("fTel").replace(/\D/g,"").length<8){toast("Revisa el teléfono: debe tener al menos 8 números");return}
    if((!EQUIPO||g("fMail"))&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g("fMail"))){toast("Revisa el correo");return}
    Object.assign(datos,{nom:g("fNom"),tel:g("fTel"),mail:g("fMail"),reg:g("fReg"),com:g("fCom"),dir:g("fDir"),ref:document.getElementById("fRef")?g("fRef"):"",mod:datos.mod||"Domicilio"});
    siguiente();
  };
}

/* ---------- Pago y envío por WhatsApp ---------- */
function cuentasListas(){return (typeof CUENTAS==="undefined"?[]:CUENTAS).filter(c=>c&&c.datos&&c.datos.length&&c.datos.every(([,v])=>v&&!String(v).startsWith("(")))}
function totalFinal(){const T=totales(),mod=datos.mod||"Domicilio",e=envio(datos.reg||"Metropolitana",datos.com||"",mod,T.base),tot=e.c+(datos.prio?PROP.prioridad:0);return{T,e,mod,tot,total:T.base+tot}}
const eqBase=()=>{const e=escudosEn()[0];return e?(EQUIPOS_CAM.find(x=>norm(x[0])===norm(e.p.nombre))||[e.p.nombre])[0]:""};
/* Líneas cortas del pedido: las usa la pantalla de pago y el mensaje de WhatsApp. */
function resumenCorto(F){
  const L=items().map(x=>`${x.p.nombre}${x.c>1?` x${x.c}`:""}`);
  if(camisetas.length)L.push(`${camisetas.length} camiseta${camisetas.length>1?"s":""}${camRegalo()?" + 1 de regalo":""}: ${[...camisetas,...(camRegalo()?[datos.camReg||{}]:[])].map(c=>`${c.n} ${c.d}${(c.eq||eqBase())!==eqBase()?` (${c.eq})`:""}`).join(", ")}`);
  if(F.T.mini)L.push(`Mini sorpresa x${minis}`);
  if(ganaRegalo())L.push(`Mini de regalo${(datos.series||[]).filter(Boolean).length?` (${datos.series.filter(Boolean).join(", ")})`:""}`);
  if(F.T.emp)L.push(`Empaque de regalo${datos.ded?`: "${datos.ded}"`:""}`);
  if(datos.prio)L.push("Prioridad en el despacho");
  L.push(`Envío ${F.mod==="Domicilio"?"a domicilio":"a punto Blue"}: ${F.e.c?clp(F.e.c):"gratis"}`);
  return L;
}
/* Dirección + depto/referencia (Áureo, 21-nov-2026: casilla aparte para que en «Dirección» pongan solo calle y número).
   A la bandeja y a WhatsApp va todo junto en «dir» («Av. Matta 1234 · Depto 504»). En punto Blue no se pide referencia. */
const dirCompleta=()=>[datos.dir,(datos.mod||"Domicilio")==="Domicilio"?datos.ref:""].map(s=>(s||"").trim()).filter(Boolean).join(" · ");
function nuevoId(){const d=new Date(),pad=n=>String(n).padStart(2,"0");return`AU-${String(d.getFullYear()).slice(2)}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.floor(100+Math.random()*900)}`}
/* Modo equipo: espera la respuesta de la bandeja para decir si quedó guardado. El número se mantiene al reintentar (no duplica). */
function guardarEquipo(b){
  const F=totalFinal();datos.idEq=datos.idEq||nuevoId();const id=datos.idEq;
  const g=k=>({fNom:datos.nom,fTel:datos.tel,fMail:datos.mail,fReg:datos.reg,fCom:datos.com,fDir:dirCompleta()}[k]||"");
  b.disabled=true;b.textContent="Guardando…";
  guardarPedido({id,e:{...F.e,tot:F.tot},mod:F.mod,base:F.T.base,g,pagoA:""},true)
    .then(r=>{if(!r||!r.ok)throw new Error((r&&r.error)||"");ultimo={id,total:F.total,link:"",equipo:true};location.hash="#listo"})
    .catch(()=>{b.disabled=false;b.textContent="No se pudo guardar · Reintentar";toast("No se guardó. Revisa la señal y aprieta de nuevo.")});
}
function enviarPedido(pagado){
  const F=totalFinal(),id=nuevoId();
  const cta=pagado&&cuentasListas().length?(cuentasListas().find(c=>c.quien===datos.cuenta)||cuentasListas()[0]).quien:"";
  /* Mensaje corto (Áureo, 20-nov-2026): el detalle completo (correo, teléfono, descuentos) queda en la bandeja de pedidos. */
  const M=[`Hola! Hice el pedido ${id} en la web`,"",...resumenCorto(F).map(l=>"- "+l),"",
    `Total: ${clp(F.total)}`,
    `Para: ${datos.nom}, ${dirCompleta()}, ${datos.com}${datos.reg&&datos.reg!=="Metropolitana"?`, ${datos.reg}`:""}${F.mod!=="Domicilio"?" (buscarme el punto Blue mas cercano)":""}`,
    ...(datos.regalo?["Es para regalo"]:[]),"",
    cta?`Ya transferi a la cuenta de ${cta}. Te envio el comprobante.`:"Quedo atento/a para transferir."];
  const link=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(sinTildes(M.join("\n")))}`;
  const g=k=>({fNom:datos.nom,fTel:datos.tel,fMail:datos.mail,fReg:datos.reg,fCom:datos.com,fDir:dirCompleta()}[k]||"");
  guardarPedido({id,e:{...F.e,tot:F.tot},mod:F.mod,base:F.T.base,g,pagoA:cta});
  medir("InitiateCheckout",{value:F.total,currency:"CLP",num_items:items().reduce((s,x)=>s+x.c,0)});
  /* El carro NO se vacía aquí: si WhatsApp no se abre o la persona vuelve, el pedido sigue ahí.
     Se vacía con «Hacer un pedido nuevo». Solo se recuerda el número y el total (nunca los datos personales). */
  ultimo={id,total:F.total,link,pagado:!!cta};
  try{localStorage.setItem("aureo-enviado",JSON.stringify({id,total:F.total,pagado:!!cta,t:Date.now()}))}catch(e){}
  location.hash="#listo";
  abrirWhatsApp(link);
}

/* Copia del pedido a la bandeja de Áureo y Caro (pestaña «PEDIDOS WEB» del maestro, vía Apps Script).
   Va en segundo plano: si falla, el pedido igual sale por WhatsApp. Ahí marcan «Pagó a Javi/Caro» y pasa a VENTAS. */
function guardarPedido({id,e,mod,base,g,pagoA},esperar){
  if(!PEDIDOS_URL)return esperar?Promise.reject(new Error("apagado")):undefined;
  try{
    const T=totales(),eqB=camisetas.length?(EQUIPOS_CAM.find(x=>norm(x[0])===norm(escudosEn()[0].p.nombre))||[escudosEn()[0].p.nombre])[0]:"";
    const r=camRegalo()?(datos.camReg||{}):null;
    const p={tipo:"pedido",id,
      cliente:{nombre:g("fNom"),tel:g("fTel"),mail:g("fMail"),entrega:mod,region:g("fReg"),comuna:g("fCom"),dir:g("fDir"),necesita:""},
      items:items().map(x=>({n:x.p.nombre,c:x.c,pu:x.p.precio||0,escudo:esEscudo(x.p),col:coleccion.has(x.s)})),
      camisetas:camisetas.length?{c:camisetas.length,total:T.cam,detalle:camisetas.map(c=>`${c.n} ${c.d} - ${c.eq||eqB}`),regalo:r?`${r.n||"?"} ${r.d||"?"} - ${r.eq||eqB}`:""}:null,
      mini:T.mini?{c:minis,total:T.mini}:null,
      regaloMini:ganaRegalo(),series:(datos.series||[]).filter(Boolean).join(", "),
      empaque:T.emp||0,dedicatoria:datos.ded||"",descEscudos:T.desc||0,descCol:T.descCol||0,
      envio:e.c||0,prioridad:datos.prio?PROP.prioridad:0,total:base+e.tot,esRegalo:!!datos.regalo,pagoDeclarado:pagoA||"",ingresadoPor:EQUIPO||""};
    if(esperar)return fetch(PEDIDOS_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(p)}).then(r=>r.json());
    fetch(PEDIDOS_URL,{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(p)}).catch(()=>{});
  }catch(err){if(esperar)return Promise.reject(err)}
}

/* Celular (y navegadores de Instagram/Facebook, que bloquean ventanas nuevas): salto directo a WhatsApp.
   Computador: pestaña nueva; si el navegador la bloquea, salto directo. */
function abrirWhatsApp(link){
  const cel=/Android|iPhone|iPad|iPod|FBAN|FBAV|Instagram/i.test(navigator.userAgent)||matchMedia("(pointer:coarse)").matches;
  if(!cel){const w=window.open(link,"_blank");if(w)return}
  setTimeout(()=>{location.href=link},150);
}
function enviadoReciente(){try{const x=JSON.parse(localStorage.getItem("aureo-enviado")||"null");return x&&Date.now()-x.t<2*864e5?x:null}catch(e){return null}}
function pedidoNuevo(){carro=[];guardar();camisetas=[];coleccion=new Set();bumps={};datos={};metaRegalo=0;paso=0;ultimo=null;try{localStorage.removeItem("aureo-enviado")}catch(e){}location.hash=""}

function vistaListo(){
  modo("en-pedido","Pedido listo");window.scrollTo(0,0);
  const g=enviadoReciente();
  const u=ultimo||(g?{id:g.id,total:g.total,link:"",pagado:g.pagado}:{id:"",total:0,link:""});
  const comp=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Te envio el comprobante del pedido "+u.id)}`;
  if(u.equipo){
    document.getElementById("vista").innerHTML=`<div class="wrap pedido" style="max-width:560px"><div class="listo"><div class="ok">✓</div><h2>Guardado en la bandeja</h2>
      <p class="nota">Pedido <b>${esc(u.id)}</b> · ${clp(u.total)} · quedó «Pendiente». Cuando el cliente pague, márcalo en la bandeja.</p></div>
      <p style="text-align:center;margin-top:18px"><button class="btn-grande" data-nuevo>Ingresar otro pedido</button></p></div>`;
    document.querySelector("[data-nuevo]").onclick=pedidoNuevo;return;
  }
  const C=cuentasListas(), sel=C.find(c=>c.quien===datos.cuenta)||C[0];
  document.getElementById("vista").innerHTML=`<div class="wrap pedido" style="max-width:560px">
    <div class="listo"><div class="ok">✓</div><h2>¡Tu pedido está listo!</h2>
      <p class="nota">${u.id?`Pedido <b>${esc(u.id)}</b> · `:""}se abrió WhatsApp con todo escrito. <b>Si no alcanzaste a enviarlo</b>, ${u.link?`<a href="${u.link}" data-reabrir>ábrelo de nuevo</a>`:`<a href="#pedido">vuelve a tu pedido</a> y apriétalo otra vez`}: tu pedido sigue guardado.</p></div>
    <div class="paso-l"><div class="n">1</div><div style="flex:1"><h3>${u.pagado?"Transferencia hecha ✓":`Transfiere ${u.total?clp(u.total):"el total"}`}</h3>
      ${u.pagado?`<p class="nota" style="margin:0">Solo falta el comprobante.</p>`:!C.length?`<p class="nota" style="margin:0">Te llegan por WhatsApp los datos para transferir. <b>Esperamos tu transferencia para cerrar tu pedido.</b></p>`:`<p class="nota" style="margin:0 0 6px">Cuenta de ${esc(sel.quien)}:</p>`+sel.datos.map(([k,v])=>`<div class="dato-p"><div><span>${esc(k)}</span><br><b>${esc(v)}</b></div><button data-copiar="${esc(v)}">Copiar</button></div>`).join("")}
      ${u.total&&!u.pagado?`<div class="dato-p"><div><span>Monto</span><br><b>${clp(u.total)}</b></div><button data-copiar="${u.total}">Copiar</button></div>`:""}</div></div>
    <div class="paso-l"><div class="n">2</div><div style="flex:1"><h3>Envíanos el comprobante y cerramos tu pedido</h3>
      <a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none;height:46px" target="_blank" href="${comp}">Enviar comprobante por WhatsApp</a></div></div>
    <div class="paso-l"><div class="n">3</div><div><h3>Te confirmamos y despachamos</h3><p class="nota" style="margin:0">Javi o Caro revisan el pago, te confirman y te mandan el número de seguimiento cuando sale.</p></div></div>
    ${URGENCIA&&new Date()<=new Date(URGENCIA.hasta+"T23:59:59")?`<p class="nota" style="text-align:center;margin-top:14px"><b>${esc(URGENCIA.texto)}</b></p>`:""}
    <p style="text-align:center;margin-top:18px"><a class="avisame" target="_blank" href="${INSTAGRAM}">Síguenos en Instagram @aureo.cl</a></p>
    <p style="text-align:center;margin-top:10px"><button class="no-gracias" data-nuevo>Hacer un pedido nuevo</button></p>
  </div>`;
  const re=document.querySelector("[data-reabrir]");if(re)re.onclick=ev=>{ev.preventDefault();abrirWhatsApp(u.link)};
  document.querySelector("[data-nuevo]").onclick=pedidoNuevo;
  document.querySelectorAll("[data-copiar]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copiar);b.textContent="✓ Copiado"}catch(e){b.textContent="Mantén apretado para copiar"}});
}

