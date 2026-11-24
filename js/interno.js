/* Ingreso rápido (solo modo equipo, #rapido). Áureo, 21-nov-2026.
   Para cuando Javi o Caro cierran una venta por interno (DM, WhatsApp): una sola pantalla, sin las ofertas del cliente.
   Busca y agrega productos, camisetas, mini de regalo (solo si se marca), precio editable, DESCUENTO con motivo y envío editable.
   Guarda en la bandeja igual que el modo equipo (mismo formato que guardarPedido). El descuento ya va rebajado en los precios
   de los productos (regla del maestro: cada producto va a lo que pagó); además se manda descInterno + motivoDesc.
   Lo carga index.html después de pedido.js. Usa las globales de base.js y pedido.js (P, clp, esc, norm, img, envio, nuevoId…). */
let R=null;
function rNuevo(){return{items:[],cams:[],camTotal:null,mini:false,series:[],desc:0,motivo:"",envio:null,k:{nom:"",tel:"",mail:"",reg:"Metropolitana",com:"",dir:"",mod:"Domicilio"},buscar:""}}
function rCargar(){if(R)return;try{R=JSON.parse(localStorage.getItem("aureo-rapido")||"null")}catch(e){}if(!R||!R.k)R=rNuevo()}
function rGuardar(){try{localStorage.setItem("aureo-rapido",JSON.stringify(R))}catch(e){}}
const rEscudo=()=>R.items.map(x=>porSlug(x.s)).find(esEscudo);
const rEqBase=()=>{const e=rEscudo();return e?(EQUIPOS_CAM.find(x=>norm(x[0])===norm(e.nombre))||[e.nombre])[0]:(EQUIPOS_CAM[0]||[""])[0]};
const rCamLista=n=>n?(rEscudo()?precioCams(n):solasPrecio(n)):0;
const rCamTotal=()=>R.cams.length?(R.camTotal!=null?R.camTotal:rCamLista(R.cams.length)):0;
const rBruto=()=>R.items.reduce((s,x)=>s+x.pu*x.c,0);
/* Reparte el descuento entre los productos según su valor (redondeado a $10); si no hay productos, va a las camisetas. */
function rCuentas(){
  const L=R.items.map(x=>({...x,p:porSlug(x.s),fin:x.pu*x.c,puF:x.pu})).filter(x=>x.p);
  const bruto=L.reduce((s,x)=>s+x.fin,0), cam0=rCamTotal(), d=Math.max(0,Math.min(R.desc||0,bruto+cam0));
  const dProd=Math.min(d,bruto);let resto=dProd;
  L.forEach((x,i)=>{const q=i===L.length-1?resto:Math.min(resto,Math.round(dProd*x.fin/bruto/10)*10);x.puF=Math.max(0,Math.round((x.fin-q)/x.c));resto-=x.fin-x.puF*x.c;x.fin=x.puF*x.c});
  const cam=Math.max(0,cam0-(d-dProd));
  const prod=L.reduce((s,x)=>s+x.fin,0)+cam;
  const auto=envio(R.k.reg,R.k.com,R.k.mod,prod), env=R.envio!=null?R.envio:auto.c;
  return{L,cam,prod,env,auto,total:prod+env,descReal:bruto+cam0-prod};
}

function vistaRapido(){
  if(!EQUIPO){location.hash="";return}
  rCargar();modo("en-pedido","Ingreso rápido");
  const v=document.getElementById("vista"), X=rCuentas(), q=norm(R.buscar);
  const encontrados=q?P.filter(p=>p.precio&&coincide(p.nombre+" "+p.cat,q)).slice(0,8):[];
  const opsEq=eq=>[...EQUIPOS_CAM.map(x=>x[0]),OTRO_EQ].map(x=>`<option${x===eq?" selected":""}>${esc(x)}</option>`).join("");
  const sel=i=>`<select data-rserie="${i}"><option value="">Serie ${i+1}…</option>${SERIES.map(s=>`<option${R.series[i]===s?" selected":""}>${s}</option>`).join("")}</select>`;
  v.innerHTML=`<div class="wrap pedido rapido">
    <div class="panel" style="background:#2b2540;color:#fff;border:0"><b>⚡ Ingreso rápido · ${esc(EQUIPO)}</b><p style="margin:4px 0 0;font-size:12.5px;opacity:.85">Venta cerrada por interno. Va directo a la bandeja como «Pendiente». Sin ofertas automáticas.</p></div>

    <div class="panel"><h3>1 · Productos</h3>
      <input class="r-buscar" id="rBuscar" type="search" placeholder="Escribe: colo, goku, uc, camiseta…" value="${esc(R.buscar)}" autocomplete="off">
      ${encontrados.length?`<div class="r-res">${encontrados.map(p=>`<button data-radd="${p.slug}">${img(p)}<span><b>${esc(p.nombre)}</b><small>${esc(p.cat)}</small></span><span>${clp(p.precio)}</span><i>+</i></button>`).join("")}</div>`:q?`<p class="nota">No encontré «${esc(R.buscar)}».</p>`:""}
      ${R.items.length?R.items.map((x,i)=>{const p=porSlug(x.s);return p?`<div class="item">${img(p)}<div class="n">${esc(p.nombre)}<small>Lista ${clp(p.precio)}</small>
        <label class="r-pu">Precio c/u $<input inputmode="numeric" value="${x.pu}" data-rpu="${i}"></label></div>
        <div class="cant"><button data-rq="${i}" data-d="-1">−</button><span>${x.c}</span><button data-rq="${i}" data-d="1">+</button></div></div>`:""}).join(""):`<p class="nota" style="margin:8px 0 0">Busca arriba y toca el producto para agregarlo.</p>`}
    </div>

    <div class="panel"><h3>2 · Camisetas</h3>
      <div class="r-fila"><span>Cantidad</span><div class="cant"><button data-rcam="-1">−</button><span>${R.cams.length}</span><button data-rcam="1">+</button></div></div>
      ${R.cams.map((c,i)=>`<div class="r-cam"><select data-rceq="${i}">${opsEq(c.eq||rEqBase())}</select>
        <div class="nn"><input maxlength="5" placeholder="Nombre" value="${esc(c.n)}" data-rcn="${i}"><input class="num" inputmode="numeric" maxlength="2" placeholder="N°" value="${esc(c.d)}" data-rcd="${i}"></div></div>`).join("")}
      ${R.cams.length?`<label class="r-pu">Total camisetas $<input inputmode="numeric" value="${rCamTotal()}" data-rcamt> <small>lista ${clp(rCamLista(R.cams.length))}${rEscudo()?" (pack con escudo)":" (sueltas)"}</small></label>`:""}
    </div>

    <div class="panel"><h3>3 · Minifigura de regalo</h3>
      <label class="check"><input type="checkbox" id="rMini" ${R.mini?"checked":""}> 🎁 Agregar minifigura sorpresa de regalo ($0)</label>
      ${R.mini?`<div class="series" style="margin-top:8px">${[0,1,2,3].map(sel).join("")}</div>`:`<p class="nota" style="margin:4px 0 0">Solo si se la ofrecieron al cliente.</p>`}
    </div>

    <div class="panel"><h3>4 · Descuento</h3>
      <label class="r-pu">Descuento total $<input inputmode="numeric" id="rDesc" value="${R.desc||""}" placeholder="0"></label>
      <input class="r-motivo" id="rMotivo" maxlength="60" placeholder="Motivo (ej.: cerrada por interno)" value="${esc(R.motivo)}">
      <div class="chips-ded">${["Cerrada por interno","Cliente frecuente","Reposición","Amigo/familia"].map(m=>`<button type="button" data-rmot="${m}">${m}</button>`).join("")}</div>
    </div>

    <div class="panel"><h3>5 · Cliente y envío</h3>
      <label class="campo">Nombre y apellido<input id="rNom" value="${esc(R.k.nom)}"></label>
      <div class="fila"><label class="campo" style="flex:1">Teléfono<input id="rTel" type="tel" inputmode="tel" value="${esc(R.k.tel)}"></label>
        <label class="campo" style="flex:1">Correo (opcional)<input id="rMail" type="email" value="${esc(R.k.mail)}"></label></div>
      <div class="fila"><label class="campo" style="flex:1">Región<select id="rReg">${REGIONES.map(r=>`<option${r===R.k.reg?" selected":""}>${r}</option>`).join("")}</select></label>
        <label class="campo" style="flex:1">Comuna<input id="rCom" value="${esc(R.k.com)}"></label></div>
      <div class="opciones"><button class="op${R.k.mod==="Domicilio"?" sel":""}" data-rmod="Domicilio"><b>🏠 A domicilio</b></button><button class="op${R.k.mod!=="Domicilio"?" sel":""}" data-rmod="Punto Bluexpress"><b>📍 Punto Blue</b></button></div>
      <label class="campo">Dirección<input id="rDir" value="${esc(R.k.dir)}"></label>
      <label class="r-pu" style="margin-top:10px">Envío que paga $<input inputmode="numeric" id="rEnv" value="${X.env}"> <small>${R.envio!=null?`<a href="#" data-renvauto>volver a automático (${clp(X.auto.c)})</a>`:"automático"}</small></label>
    </div>

    <div class="panel"><h3>Resumen</h3>
      ${X.L.map(x=>`<div class="res"><span>${esc(x.p.nombre)} × ${x.c}</span><span>${clp(x.fin)}</span></div>`).join("")}
      ${R.cams.length?`<div class="res"><span>Camisetas × ${R.cams.length}</span><span>${clp(X.cam)}</span></div>`:""}
      ${R.mini?`<div class="res"><span>🎁 Minifigura de regalo</span><span>$0</span></div>`:""}
      ${X.descReal?`<div class="res"><span>Descuento${R.motivo?` (${esc(R.motivo)})`:""} <small style="color:var(--suave)">ya rebajado arriba</small></span><span style="color:var(--verde)">−${clp(X.descReal)}</span></div>`:""}
      <div class="res"><span>Envío</span><span>${X.env?clp(X.env):"Gratis"}</span></div>
      <div class="res total"><span>Total</span><span>${clp(X.total)}</span></div>
      <p style="margin-top:10px"><button class="no-gracias" data-rlimpiar>Borrar todo y empezar de nuevo</button></p>
    </div>
  </div><div class="barra-fija"><button class="btn-grande" id="rGuardar">Guardar en la bandeja · ${clp(X.total)}</button></div>`;

  const re=(foco)=>{rGuardar();const y=window.scrollY;vistaRapido();window.scrollTo(0,y);if(foco){const el=document.getElementById(foco);if(el){el.focus();const n=el.value.length;try{el.setSelectionRange(n,n)}catch(e){}}}};
  const b=document.getElementById("rBuscar");let tb;b.oninput=()=>{R.buscar=b.value;clearTimeout(tb);tb=setTimeout(()=>re("rBuscar"),150)};
  v.querySelectorAll("[data-radd]").forEach(x=>x.onclick=()=>{const p=porSlug(x.dataset.radd),i=R.items.find(y=>y.s===p.slug);i?i.c++:R.items.push({s:p.slug,c:1,pu:p.precio});
    if(/camiseta/i.test(p.nombre)&&/con escudo|sola/i.test(p.nombre)){R.items=R.items.filter(y=>y.s!==p.slug);R.cams.push({n:"",d:"",eq:""});toast("Camiseta agregada: escribe nombre y número en «2 · Camisetas»")}
    else toast(p.nombre+" agregado");R.buscar="";re("rBuscar")});
  v.querySelectorAll("[data-rq]").forEach(x=>x.onclick=()=>{const it=R.items[+x.dataset.rq];it.c+=+x.dataset.d;if(it.c<1)R.items.splice(+x.dataset.rq,1);re()});
  v.querySelectorAll("[data-rpu]").forEach(x=>x.onchange=()=>{R.items[+x.dataset.rpu].pu=num(x.value);re()});
  v.querySelectorAll("[data-rcam]").forEach(x=>x.onclick=()=>{if(+x.dataset.rcam>0)R.cams.push({n:"",d:"",eq:""});else R.cams.pop();R.camTotal=null;re()});
  v.querySelectorAll("[data-rceq]").forEach(x=>x.onchange=()=>{R.cams[+x.dataset.rceq].eq=x.value;rGuardar()});
  v.querySelectorAll("[data-rcn]").forEach(x=>x.oninput=()=>{R.cams[+x.dataset.rcn].n=x.value.toUpperCase();rGuardar()});
  v.querySelectorAll("[data-rcd]").forEach(x=>x.oninput=()=>{R.cams[+x.dataset.rcd].d=x.value.replace(/\D/g,"");rGuardar()});
  const ct=v.querySelector("[data-rcamt]");if(ct)ct.onchange=()=>{R.camTotal=num(ct.value);re()};
  document.getElementById("rMini").onchange=e=>{R.mini=e.target.checked;re()};
  v.querySelectorAll("[data-rserie]").forEach(x=>x.onchange=()=>{R.series[+x.dataset.rserie]=x.value;rGuardar()});
  document.getElementById("rDesc").onchange=e=>{R.desc=num(e.target.value);re()};
  const mo=document.getElementById("rMotivo");mo.oninput=()=>{R.motivo=mo.value;rGuardar()};
  v.querySelectorAll("[data-rmot]").forEach(x=>x.onclick=()=>{R.motivo=x.dataset.rmot;re()});
  [["rNom","nom"],["rTel","tel"],["rMail","mail"],["rCom","com"],["rDir","dir"]].forEach(([id,k])=>{const el=document.getElementById(id);el.oninput=()=>{R.k[k]=el.value;rGuardar()};if(k==="com")el.onchange=()=>re()});
  document.getElementById("rReg").onchange=e=>{R.k.reg=e.target.value;re()};
  v.querySelectorAll("[data-rmod]").forEach(x=>x.onclick=()=>{R.k.mod=x.dataset.rmod;re()});
  document.getElementById("rEnv").onchange=e=>{R.envio=num(e.target.value);re()};
  const ea=v.querySelector("[data-renvauto]");if(ea)ea.onclick=e=>{e.preventDefault();R.envio=null;re()};
  v.querySelector("[data-rlimpiar]").onclick=()=>{if(confirm("¿Borrar este pedido a medio ingresar?")){R=rNuevo();re()}};
  document.getElementById("rGuardar").onclick=ev=>rEnviar(ev.currentTarget);
}

function rEnviar(btn){
  const X=rCuentas(),k=R.k,falta=[];
  if(!X.L.length&&!R.cams.length)falta.push("productos");
  [["nom","nombre"],["tel","teléfono"],["com","comuna"],["dir","dirección"]].forEach(([c,n])=>{if(!String(k[c]||"").trim())falta.push(n)});
  if(falta.length){toast("Falta: "+falta.join(", "));return}
  if(k.tel.replace(/\D/g,"").length<8){toast("Revisa el teléfono");return}
  if(k.mail&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k.mail.trim())){toast("Revisa el correo");return}
  if(R.cams.some(c=>!c.n||c.d==="")){toast("Escribe nombre y número de cada camiseta");return}
  if(X.descReal&&!R.motivo.trim()){toast("Escribe el motivo del descuento");document.getElementById("rMotivo").focus();return}
  if(R.mini&&!R.series.some(Boolean)){toast("Elige al menos una serie para la mini");return}
  const resumen=[...X.L.map(x=>`${x.p.nombre} x${x.c}: ${clp(x.fin)}`),...(R.cams.length?[`${R.cams.length} camiseta(s): ${clp(X.cam)}`]:[]),...(R.mini?["Mini de regalo"]:[]),
    ...(X.descReal?[`Descuento −${clp(X.descReal)} (${R.motivo})`]:[]),`Envío: ${X.env?clp(X.env):"gratis"}`,`TOTAL ${clp(X.total)}`];
  if(!confirm(`¿Guardar el pedido de ${k.nom} en la bandeja?\n\n${resumen.join("\n")}`))return;
  if(!PEDIDOS_URL){toast("La bandeja está apagada");return}
  R.id=R.id||nuevoId();rGuardar();
  const eqB=rEqBase();
  const p={tipo:"pedido",id:R.id,
    cliente:{nombre:k.nom.trim(),tel:k.tel.trim(),mail:(k.mail||"").trim(),entrega:k.mod,region:k.reg,comuna:k.com.trim(),dir:k.dir.trim(),necesita:""},
    items:X.L.map(x=>({n:x.p.nombre,c:x.c,pu:x.puF,escudo:esEscudo(x.p),col:false})),
    camisetas:R.cams.length?{c:R.cams.length,total:X.cam,detalle:R.cams.map(c=>`${c.n} ${c.d} - ${c.eq||eqB}`),regalo:""}:null,
    mini:null,regaloMini:!!R.mini,series:R.series.filter(Boolean).join(", "),
    empaque:0,dedicatoria:"",descEscudos:0,descCol:0,descInterno:X.descReal||0,motivoDesc:X.descReal?R.motivo.trim():"",
    envio:X.env,prioridad:0,total:X.total,esRegalo:false,pagoDeclarado:"",ingresadoPor:EQUIPO,rapido:true};
  btn.disabled=true;btn.textContent="Guardando…";
  fetch(PEDIDOS_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(p)}).then(r=>r.json())
    .then(r=>{if(!r||!r.ok)throw new Error((r&&r.error)||"");const id=R.id;R=rNuevo();rGuardar();
      document.getElementById("vista").innerHTML=`<div class="wrap pedido" style="max-width:560px"><div class="listo"><div class="ok">✓</div><h2>Guardado en la bandeja</h2>
        <p class="nota">Pedido <b>${esc(id)}</b> · ${clp(X.total)} · quedó «Pendiente».</p></div>
        <p style="text-align:center;margin-top:18px"><button class="btn-grande" onclick="vistaRapido()">Ingresar otro pedido</button></p></div>`})
    .catch(()=>{btn.disabled=false;btn.textContent="No se pudo guardar · Reintentar";toast("No se guardó. Revisa la señal y aprieta de nuevo.")});
}
