/* Pedido: checkout guiado (una oferta por pantalla), totales y «Pedido listo».
   Parte de: W2 · Embudo y pedido. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */

/* ---------- Checkout guiado: una oferta por pantalla ---------- */
const escudosEn=()=>items().filter(x=>esEscudo(x.p));
const nEscudos=()=>escudosEn().reduce((a,x)=>a+x.c,0);
function solasPrecio(n){const s=solaFila();if(!s||!n)return 0;const m=(s.det.match(/\$[\d.]+/g)||[]).map(num);const T3={1:s.precio,2:m[0]||s.precio*2,3:m[1]||s.precio*3};return n<=3?T3[n]:T3[3]+(n-3)*s.precio}
function precioCams(n){const tc=tramosCombo();if(!n||!tc)return 0;return n<=3?tc[n]:tc[3]+(n-3)*tc[1]}
const camRegalo=()=>PROP.camRegaloDesde&&precioCams(camisetas.length)>=PROP.camRegaloDesde;
function totales(){
  const tc=tramosCombo(), cam=precioCams(camisetas.length), mini=minis*5000;
  const desc=PROP.segundoDesc&&nEscudos()>=2?PROP.segundoDesc:0, emp=bumps.empaque?PROP.empaque:0;
  const descCol=Math.round(items().filter(x=>coleccion.has(x.s)).reduce((s,x)=>s+x.p.precio*PROP.coleccionDesc,0)/10)*10;
  return {cam,mini,desc,emp,descCol,base:subtotal()+cam+mini+emp-desc-descCol};
}
function complementos(){const e0=escudosEn()[0];if(!e0)return[];const club=norm(e0.p.nombre);
  return P.filter(x=>x.precio&&!esEscudo(x)&&!/camiseta/i.test(x.nombre)&&(norm(x.nombre).includes(club)||/pelota|copa|bufanda/i.test(x.nombre)))}
function pasos(){const e=escudosEn().length>0;return["pedido",...(e?["camisetas",complementos().length?"coleccion":"segundo"]:["minis"]),"entrega"]}
let metaRegalo=0;
const meta=()=>metaRegalo||subtotal()+PROP.regaloMas;
function barra(base){if(!PROP.barra)return"";const meta=metaRegalo,pct=Math.min(100,base/meta*100);
  const txt=base<20000?`Te faltan <b>${clp(20000-base)}</b> para el envío gratis 🚚`:base<meta?`¡Envío gratis listo! Te faltan <b>${clp(meta-base)}</b> para una <b>mini sorpresa de regalo</b> 🎁`:`<b>¡Ganaste una mini sorpresa de regalo!</b> 🎁`;
  return `<div class="progreso">${txt}<div class="riel"><div style="width:${pct}%"></div></div><div class="hitos"><span>$0</span><span>🚚 $20.000</span><span>🎁 ${clp(meta)}</span></div></div>`}
function puntos(){const S=pasos();return `<div class="puntos">${S.map((_,k)=>`<i class="${k<=paso?"ok":""}"></i>`).join("")}</div>`}
function mirar(){
  const enCarro=new Set(carro.map(c=>c.s)), cats=[...new Set(items().map(x=>x.p.cat))];
  const todas=[...new Set(P.filter(x=>x.precio).map(x=>x.cat))].sort((a,b)=>(cats.includes(b)-cats.includes(a))||ORDEN.indexOf(a)-ORDEN.indexOf(b));
  const cat=mirarCat||todas[0];
  const L=P.filter(x=>x.cat===cat&&x.precio&&!enCarro.has(x.slug)&&!/camiseta/i.test(x.nombre)).slice(0,12);
  return `<div class="mirar"><div class="chips2">${todas.filter(c=>!/camiseta|personaliz/i.test(c)).map(c=>`<button class="${c===cat?"sel":""}" data-mcat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
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
  if(!metaRegalo)metaRegalo=subtotal()+PROP.regaloMas;
  const etapa=S[paso], T=totales(), tc=tramosCombo(), sola=solaFila();
  const e0=escudosEn()[0], h=e0?hincha(e0.p):null, apodo=h?h[0]:"hincha";
  let html="", pie="";

  if(etapa==="pedido"){
    html=`<div class="panel"><h3>Lo que llevas</h3>${I.map(x=>`<div class="item">${img(x.p)}<div class="n">${esc(x.p.nombre)}<small>${clp(x.p.precio)} c/u</small></div>
      <div class="cant"><button data-q="${x.s}" data-d="-1">−</button><span>${x.c}</span><button data-q="${x.s}" data-d="1">+</button></div></div>`).join("")}
      <button class="op" style="margin-top:8px" data-mirar>${mirando?"Cerrar":"+ Seguir mirando"}</button>${mirando?mirar():""}</div>${barra(T.base)}`;
    pie=`<button class="btn-grande" data-sig>Continuar · ${clp(T.base)}</button>`;
  }

  if(etapa==="camisetas"){
    const solas=(()=>{const s=sola;if(!s)return n=>0;const m=(s.det.match(/\$[\d.]+/g)||[]).map(num);const T3={1:s.precio,2:m[0]||s.precio*2,3:m[1]||s.precio*3};return n=>n<=3?T3[n]:T3[3]+(n-3)*s.precio})();
    const eqBase=(EQUIPOS_CAM.find(x=>norm(x[0])===norm(e0.p.nombre))||[e0.p.nombre])[0];
    const mismas=CAMISETAS.filter(c=>norm(c[2])===norm(e0.p.nombre)), cams=[...mismas,...CAMISETAS.filter(c=>!mismas.includes(c))].slice(0,2);
    const k=camisetas.length, opsEq=eq=>[eqBase,...EQUIPOS_CAM.map(x=>x[0]).filter(x=>x!==eqBase),OTRO_EQ].map(x=>`<option${x===eq?" selected":""}>${esc(x)}</option>`).join("");
    const fila=(c,i,reg)=>`<div class="cam-fila${reg?" regalo":""}"><img src="${fotoEq(c.eq||eqBase)}" alt="" data-fimg="${reg?"r":i}">
      <div><div class="et">${reg?"🎁 DE REGALO":"Camiseta "+(i+1)}</div><select data-ceq="${reg?"r":i}">${opsEq(c.eq||eqBase)}</select>
      <div class="nn"><input maxlength="5" placeholder="Nombre (máx. 5)" value="${esc(c.n)}" data-cn="${reg?"r":i}"><input class="num" inputmode="numeric" maxlength="2" placeholder="N°" value="${esc(c.d)}" data-cd="${reg?"r":i}"></div></div></div>`;
    const falta=PROP.camRegaloDesde&&k?PROP.camRegaloDesde-precioCams(k):0;
    html=`<div class="oferta">${tag("1 de 2")}<div class="t1">Solo por llevar tu escudo</div>
      <h2>El pack del ${esc(apodo)}</h2>
      <p style="margin:0">Tu ${esc(e0.p.nombre)} + una camiseta con el nombre y el número de cada uno. ¿En tu casa hay de otro equipo? Cada camiseta puede ser de un club distinto.</p>
      <div class="montaje">${img(e0.p)}<span class="mas">+</span><div class="cams">${cams.map(([f])=>`<img src="${CAM_BASE}${f}" alt="">`).join("")}</div></div>
      ${carrusel()}
      <div class="opciones">${[1,2,3,4,5].map(n=>`<button class="op${k===n?" sel":""}" data-cam="${n}"><b>${n}</b><s style="color:var(--suave)">${clp(solas(n))}</s> ${clp(precioCams(n))}</button>`).join("")}</div>
      ${k?`<div class="precios"><s>${clp(e0.p.precio+solas(k))}</s><b>${clp(e0.p.precio+precioCams(k))}</b><span>Ahorras ${clp(solas(k)-precioCams(k))}</span></div>
        ${camisetas.map((c,i)=>fila(c,i,false)).join("")}
        ${camRegalo()?fila(datos.camReg||{},0,true):`<div class="meta-cam">${tag("G")}Con ${clp(PROP.camRegaloDesde)} en camisetas te regalamos una más. ${falta>0?`Te faltan ${clp(falta)}.`:""}</div>`}`:""}
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
    const desc=PROP.segundoDesc, otros=P.filter(x=>esEscudo(x)&&x.precio&&x.slug!==e0.s).slice(0,9);
    html=`<div class="oferta">${tag("2 de 2")}<div class="t1">Una sola vez, aquí</div>
      <h2>¿Alguien más en tu familia es hincha?</h2>
      <p style="margin:0">Llévale el suyo: el segundo escudo tiene <b>${clp(desc)} menos</b> y viaja en el mismo envío.</p>
      <button class="op" style="width:100%;margin-top:12px;display:flex;gap:10px;align-items:center" data-seg="${e0.s}">${img(e0.p)}<span style="text-align:left"><b>Otro ${esc(e0.p.nombre)}</b><s style="color:var(--suave)">${clp(e0.p.precio)}</s> <b style="display:inline">${clp(e0.p.precio-desc)}</b></span></button>
      <p class="nota" style="margin-top:12px">O elige el de otro equipo:</p>
      <div class="elige">${otros.map(x=>`<button data-seg="${x.slug}">${img(x)}<b>${esc(x.nombre)}</b><s>${clp(x.precio)}</s>${clp(x.precio-desc)}</button>`).join("")}</div></div>
      <button class="no-gracias" data-nogracias="segundo">No, gracias</button>`;
    pie=`<button class="btn-grande" data-sig>Continuar · ${clp(T.base)}</button>`;
  }

  if(etapa==="minis"){
    const M=P.filter(x=>/3D mini/i.test(x.cat)&&x.precio&&x.precio<=7000&&!carro.some(c=>c.s===x.slug)).slice(0,9);
    html=`<div class="oferta">${tag("1 de 1")}<div class="t1">Antes de terminar</div>
      <h2>Agrégale una mini por poco</h2><p style="margin:0">Van en el mismo envío. ${T.base<20000?`Con ${clp(20000-T.base)} más, tu envío es gratis.`:""}</p>
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
    <div class="fila"><label class="campo" style="flex:1">Región<select id="fReg">${REGIONES.map(r=>`<option>${r}</option>`).join("")}</select></label>
      <label class="campo" style="flex:1">Comuna<input id="fCom"></label></div>
    <div class="opciones"><button class="op${!punto?" sel":""}" data-mod="Domicilio"><b>🏠 A domicilio</b></button><button class="op${punto?" sel":""}" data-mod="Punto Bluexpress"><b>📍 Punto Blue Express</b></button></div>
    ${punto?`<p class="nota" style="margin:8px 0 0">Estos son los Puntos Blue Express cerca de tu comuna. Elige uno y escribe su nombre o dirección abajo.</p>
      <iframe class="mapa" id="mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <a class="nota" style="display:block;margin-top:4px" href="https://www.blue.cl/lockers-puntos/encuentra-tu-punto" target="_blank" rel="noopener">¿No lo encuentras? Ver el buscador oficial de Blue Express →</a>`:""}
    <label class="campo" id="lDir">${punto?"Punto Blue Express elegido (nombre o dirección)":"Dirección (calle, número, depto)"}<input id="fDir" autocomplete="${punto?"off":"street-address"}"></label>
    <div class="envio-linea"><span style="font-size:22px">🚚</span><span id="envioLinea"></span></div>
    <label class="campo">¿Lo necesitas para una fecha? (opcional)<input id="fFec" placeholder="Ej: 24 de diciembre"></label>
    <label class="check"><input type="checkbox" id="fReg2" ${datos.regalo?"checked":""}> Es para regalo: lo mandamos directo</label>
    ${datos.regalo&&PROP.empaque?`<label class="bump"><input type="checkbox" data-bump="empaque" ${bumps.empaque?"checked":""}><span>${tag("D")}<b>Empaque de regalo + tarjeta escrita a mano · ${clp(PROP.empaque)}</b>Llega listo para entregar.</span></label>
      ${bumps.empaque?`<div style="margin-top:8px"><input id="dedTxt" maxlength="50" placeholder="Tu dedicatoria (máx. 50 caracteres)" value="${esc(datos.ded||"")}" style="width:100%;padding:10px;border:1px solid var(--linea);border-radius:10px;font:inherit"><div class="cuenta" id="dedCuenta">${(datos.ded||"").length}/50</div>
        <div class="chips-ded">${dedOps.map(d=>`<button type="button" data-ded="${esc(d)}">“${esc(d)}”</button>`).join("")}</div></div>`:""}`:""}
    </div>
    ${PROP.barra&&T.base>=metaRegalo?`<div class="mini-regalo">${tag("B")}<b>🎁 Ganaste una minifigura sorpresa de regalo</b>
      <p class="nota" style="margin:4px 0 0">Una figura 3D en mini bloques, como estas. Elige 4 series que te gusten y nosotros elegimos cuál te llega.</p>
      <div class="fotos">${minisFoto.map(x=>img(x)).join("")}</div>
      <div class="series">${[0,1,2,3].map(sel).join("")}</div></div>`:""}
    <div class="panel"><h3>Resumen</h3>
    ${I.map(x=>`<div class="res"><span>${esc(x.p.nombre)} × ${x.c}</span><span>${clp(x.p.precio*x.c)}</span></div>`).join("")}
    ${T.cam?`<div class="res"><span>Camisetas × ${camisetas.length}${camRegalo()?" + 1 de regalo":""} <small style="color:var(--verde)">pack</small></span><span>${clp(T.cam)}</span></div>`:""}
    ${T.descCol?`<div class="res"><span>Oferta de la colección</span><span style="color:var(--verde)">−${clp(T.descCol)}</span></div>`:""}
    ${T.desc?`<div class="res"><span>Segundo escudo</span><span style="color:var(--verde)">−${clp(T.desc)}</span></div>`:""}
    ${T.mini?`<div class="res"><span>Mini sorpresa × ${minis}</span><span>${clp(T.mini)}</span></div>`:""}
    ${T.emp?`<div class="res"><span>Empaque de regalo</span><span>${clp(T.emp)}</span></div>`:""}
    ${PROP.barra&&T.base>=metaRegalo?`<div class="res"><span>🎁 Minifigura sorpresa</span><span style="color:var(--verde)">$0</span></div>`:""}
    <div class="res"><span id="envioRes"></span><span id="envioTxt"></span></div>
    ${PROP.prioridad?`<label class="prio"><input type="checkbox" id="fPrio" ${datos.prio?"checked":""}><span><b>⚡ Prioridad en el despacho +${clp(PROP.prioridad)}</b><span id="prioTxt"></span></span></label>`:""}
    <div class="res total"><span>Total</span><span id="totalTxt"></span></div>
    <div class="ahorro" id="ahorro"></div>
    <p class="nota">Pagas por transferencia: te mandamos los datos por WhatsApp. Tus datos no se guardan en esta página: viajan solo en tu mensaje.</p></div>`;
    pie=`<button class="btn-grande wa" id="enviar">Enviar pedido por WhatsApp</button>`;
  }

  v.innerHTML=`<div class="wrap pedido">${puntos()}${html}</div><div class="barra-fija">${pie}</div>`;

  // Eventos comunes
  v.querySelectorAll("[data-sig]").forEach(b=>b.onclick=()=>{if(etapa==="camisetas"&&camisetas.length)medir("OfertaAceptada",{oferta:"pack",camisetas:camisetas.length});if(etapa==="camisetas"&&([...camisetas,...(camRegalo()?[datos.camReg||{}]:[])]).some(c=>!c.n||c.d===""||c.d===undefined)){toast("Escribe el nombre y el número de cada camiseta");return}siguiente()});
  v.querySelectorAll("[data-nogracias]").forEach(b=>b.onclick=()=>{if(b.dataset.nogracias==="camisetas")camisetas=[];siguiente()});
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
  v.querySelectorAll("[data-seg]").forEach(b=>b.onclick=()=>{agregar(b.dataset.seg,1,true);toast(`Segundo escudo agregado: −${clp(PROP.segundoDesc)}`);siguiente()});
  v.querySelectorAll("[data-mas]").forEach(b=>b.onclick=()=>{agregar(b.dataset.mas,1);vistaPedido()});
  if(etapa!=="entrega")return;

  const base=T.base;
  [["fNom","nom"],["fReg","reg"],["fCom","com"],["fDir","dir"],["fFec","fec"]].forEach(([id,k])=>{const el=document.getElementById(id);if(datos[k])el.value=datos[k];el.addEventListener("input",()=>{datos[k]=el.value;calc()});el.addEventListener("change",()=>{datos[k]=el.value;calc()})});
  const fr=document.getElementById("fReg2");fr.onchange=()=>{datos.regalo=fr.checked;if(!fr.checked)bumps.empaque=false;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)};
  v.querySelectorAll("[data-bump]").forEach(b=>b.onchange=()=>{bumps[b.dataset.bump]=b.checked;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  const de=document.getElementById("dedTxt");if(de)de.oninput=()=>{datos.ded=de.value;document.getElementById("dedCuenta").textContent=de.value.length+"/50"};
  v.querySelectorAll("[data-ded]").forEach(b=>b.onclick=()=>{datos.ded=b.dataset.ded;de.value=datos.ded;document.getElementById("dedCuenta").textContent=datos.ded.length+"/50"});
  v.querySelectorAll("[data-serie]").forEach(s=>s.onchange=()=>{datos.series=datos.series||[];datos.series[+s.dataset.serie]=s.value});
  const mapa=document.getElementById("mapa");let ultimaQ="";
  const ponMapa=()=>{if(!mapa)return;const c=document.getElementById("fCom").value.trim(),r=document.getElementById("fReg").value;const q=`Blue Express ${c||""} ${r==="Metropolitana"?"Santiago":r} Chile`;if(q===ultimaQ)return;ultimaQ=q;mapa.src="https://www.google.com/maps?q="+encodeURIComponent(q)+"&output=embed"};
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
    if(T.desc)A.push(["Segundo escudo",T.desc]);
    if(T.descCol)A.push(["Oferta de la colección",T.descCol]);
    if(PROP.barra&&base>=metaRegalo)A.push(["Minifigura sorpresa de regalo",5000]);
    if(!e.c)A.push(["Envío gratis",mod==="Domicilio"?3000:2000]);
    const ah=A.reduce((s,x)=>s+x[1],0);
    document.getElementById("ahorro").innerHTML=`<div class="fila-a"><span>Pagas</span><b>${clp(base+tot)}</b></div>${ah?`<div class="fila-a verde"><span>Ahorras en total</span><b>${clp(ah)}</b></div><ul>${A.map(([n,v])=>`<li><span>${n}</span><span>${clp(v)}</span></li>`).join("")}</ul>`:""}`;
    return{...e,tot}};
  calc();ponMapa();
  document.getElementById("fCom").addEventListener("change",ponMapa);document.getElementById("fReg").addEventListener("change",ponMapa);
  const fp=document.getElementById("fPrio");if(fp)fp.onchange=()=>{datos.prio=fp.checked;calc()};
  v.querySelectorAll("[data-mod]").forEach(b=>b.onclick=()=>{datos.mod=b.dataset.mod;const x=window.scrollY;vistaPedido();window.scrollTo(0,x)});
  document.getElementById("enviar").onclick=()=>{
    const g=id=>document.getElementById(id).value.trim();
    if(!g("fNom")||!g("fCom")||!g("fDir")){toast("Falta nombre, comuna o dirección");return}
    const d=new Date(),pad=n=>String(n).padStart(2,"0"),e=calc(),mod=datos.mod||"Domicilio";
    const id=`AU-${String(d.getFullYear()).slice(2)}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.floor(100+Math.random()*900)}`;
    const M=["Hola! Quiero confirmar mi pedido del catalogo.","",`PEDIDO: ${id}`,`FECHA: ${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`,"",
      `CLIENTE: ${g("fNom")}`,`ENTREGA: ${mod}`,`REGION: ${g("fReg")}`,`COMUNA: ${g("fCom")}`,`${mod==="Domicilio"?"DIRECCION":"PUNTO"}: ${g("fDir")}`];
    if(g("fFec"))M.push(`LO NECESITO PARA: ${g("fFec")}`);
    M.push("","LO QUE LLEVO:",...items().map(x=>`- ${x.p.nombre} x${x.c} - ${clp(x.p.precio*x.c)}`));
    if(camisetas.length){const eqB=(EQUIPOS_CAM.find(x=>norm(x[0])===norm(escudosEn()[0].p.nombre))||[escudosEn()[0].p.nombre])[0];
      M.push(`- Camiseta con escudo x${camisetas.length} - ${clp(T.cam)}`);camisetas.forEach((c,k)=>M.push(`  ${k+1}) ${c.n} ${c.d} - ${c.eq||eqB}`));
      if(camRegalo()){const r=datos.camReg||{};M.push(`  + 1 de REGALO: ${r.n||"?"} ${r.d||"?"} - ${r.eq||eqB}`)}}
    if(T.desc)M.push(`- Segundo escudo: -${clp(T.desc)}`);
    if(T.descCol)M.push(`- Oferta coleccion (${Math.round(PROP.coleccionDesc*100)}%): -${clp(T.descCol)}`);
    if(T.mini)M.push(`- Mini sorpresa x${minis} - ${clp(T.mini)}`);
    if(T.emp)M.push(`- Empaque de regalo - ${clp(T.emp)}`+(datos.ded?`\n  Dedicatoria: ${datos.ded}`:""));
    if(PROP.barra&&base>=metaRegalo)M.push(`- Minifigura sorpresa de REGALO - $0`,`  Series: ${(datos.series||[]).filter(Boolean).join(", ")||"(elige por WhatsApp)"}`);
    M.push("",`ENVIO: ${e.c?clp(e.c):"gratis"}${e.porque?` (${e.porque})`:""}`);
    if(datos.prio)M.push(`PRIORIDAD EN EL DESPACHO: si (+${clp(PROP.prioridad)})`);
    M.push(`TOTAL: ${clp(base+e.tot)}`);
    if(datos.regalo)M.push("","ES REGALO: si");
    const link=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(sinTildes(M.join("\n")))}`;
    medir("InitiateCheckout",{value:base+e.tot,currency:"CLP",num_items:items().reduce((s,x)=>s+x.c,0)});
    ultimo={id,total:base+e.tot,link};
    window.open(link,"_blank");
    carro=[];guardar();camisetas=[];coleccion=new Set();bumps={};metaRegalo=0;paso=0;
    location.hash="#listo";
  };
}

function vistaListo(){
  modo("en-pedido","Pedido listo");window.scrollTo(0,0);
  const u=ultimo||{id:"AU-xxxxxx-xxx",total:0,link:`https://wa.me/${WHATSAPP}`};
  const comp=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Te envio el comprobante del pedido "+u.id)}`;
  document.getElementById("vista").innerHTML=`<div class="wrap pedido" style="max-width:560px">
    <div class="listo"><div class="ok">✓</div><h2>¡Tu pedido está listo!</h2>
      <p class="nota">Pedido <b>${esc(u.id)}</b> · se abrió WhatsApp con todo escrito. Si no se envió, <a href="${u.link}" target="_blank">ábrelo de nuevo</a>.</p></div>
    <div class="paso-l"><div class="n">1</div><div style="flex:1"><h3>Transfiere ${u.total?clp(u.total):"el total"}</h3>
      ${DATOS_PAGO.some(([,v])=>v.startsWith("("))?`<p class="nota" style="margin:0">Te mandamos los datos de transferencia por WhatsApp, junto con la confirmación de tu pedido.</p>`:DATOS_PAGO.map(([k,v])=>`<div class="dato-p"><div><span>${k}</span><br><b>${esc(v)}</b></div><button data-copiar="${esc(v)}">Copiar</button></div>`).join("")}
      ${u.total?`<div class="dato-p"><div><span>Monto</span><br><b>${clp(u.total)}</b></div><button data-copiar="${u.total}">Copiar</button></div>`:""}</div></div>
    <div class="paso-l"><div class="n">2</div><div style="flex:1"><h3>Mándanos el comprobante</h3>
      <a class="btn-grande wa" style="display:flex;align-items:center;justify-content:center;text-decoration:none;height:46px" target="_blank" href="${comp}">Enviar comprobante por WhatsApp</a></div></div>
    <div class="paso-l"><div class="n">3</div><div><h3>Te confirmamos y despachamos</h3><p class="nota" style="margin:0">Javi o Caro revisan el pago, te confirman y te mandan el número de seguimiento cuando sale.</p></div></div>
    ${URGENCIA&&new Date()<=new Date(URGENCIA.hasta+"T23:59:59")?`<p class="nota" style="text-align:center;margin-top:14px"><b>${esc(URGENCIA.texto)}</b></p>`:""}
    <p style="text-align:center;margin-top:18px"><a class="avisame" target="_blank" href="${INSTAGRAM}">Síguenos en Instagram @aureo.cl</a></p>
  </div>`;
  document.querySelectorAll("[data-copiar]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copiar);b.textContent="✓ Copiado"}catch(e){b.textContent="Mantén apretado para copiar"}});
}

