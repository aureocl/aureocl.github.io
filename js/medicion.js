/* Medición: eventos al píxel de Meta + registro anónimo de visitas para la pestaña «Visitas» de la bandeja.
   Parte de: W4 · Tráfico y medición. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → interno → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */

/* Medición: si la página tiene el píxel de Meta (fbq), manda el evento; si no, solo lo anota en la consola.
   Además anota el paso en la visita (ver abajo). */
function medir(ev,d={}){try{if(window.fbq){["ViewContent","AddToCart","InitiateCheckout","Purchase"].includes(ev)?fbq("track",ev,d):fbq("trackCustom",ev,d)}}catch(e){}
  try{VISITA.evento(ev,d)}catch(e){}console.debug("[medir]",ev,d)}

/* ---------- Visitas (W4, 25-nov-2026) ----------
   Una fila por visita en la hoja VISITAS del maestro (script «Aureo · Pedidos web», versión 13).
   ANÓNIMO: un número al azar por navegador y otro por visita. Nunca nombre, teléfono, correo ni dirección.
   Guarda: de dónde llegó, celular o computador, cuánto tardó en verse el catálogo, hasta qué paso llegó, qué productos vio
   y agregó, ofertas vistas y aceptadas, búsquedas sin resultado, el N° de pedido (AU-…) si lo envió y fotos que fallaron.
   Se manda al esconder la página (cambiar de app, cerrar) y al enviar el pedido. No cuenta el modo equipo ni localhost
   (para probar en local: ?medir=1).
   Pasos: 1 entró · 2 vio un producto · 3 agregó · 4 empezó el pedido · 5 envió el pedido. «Pagó» lo cruza la bandeja.
   Links con origen: agregar ?o=agente, ?o=qr, ?o=bio, ?o=anuncio (o utm_source/utm_medium) para saber de dónde llegan. */
const VISITA=(()=>{
  const ses=(()=>{try{return sessionStorage}catch(e){return null}})(),loc=(()=>{try{return localStorage}catch(e){return null}})();
  const azar=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
  const leer=(s,k)=>{try{return JSON.parse(s&&s.getItem(k)||"null")}catch(e){return null}};
  const grabar=(s,k,v)=>{try{s&&s.setItem(k,JSON.stringify(v))}catch(e){}};
  const corto=(t,n=80)=>String(t||"").replace(/\s+/g," ").trim().slice(0,n);
  const sumar=(L,x,max=40)=>{x=corto(x);if(x&&!L.includes(x)&&L.length<max)L.push(x)};
  const AFUERA=/localhost|127\.0\.0\.1|\.local$/.test(location.hostname)&&!/[?&]medir=1/.test(location.search);
  const BOT=navigator.webdriver||/bot|crawl|spider|headless|lighthouse|facebookexternalhit|preview/i.test(navigator.userAgent);

  let visitante=null;try{visitante=loc&&loc.getItem("aureo-visitante")}catch(e){}
  if(!visitante){visitante=azar();try{loc&&loc.setItem("aureo-visitante",visitante)}catch(e){}}

  function origen(){
    const q=new URLSearchParams(location.search),o=(q.get("o")||"").toLowerCase(),src=(q.get("utm_source")||"").toLowerCase(),med=(q.get("utm_medium")||"").toLowerCase();
    const ua=navigator.userAgent,ref=document.referrer||"";
    const O={agente:"Agente de WhatsApp",wsp:"WhatsApp",whatsapp:"WhatsApp",qr:"QR de la tarjeta",bio:"Instagram",ig:"Instagram",instagram:"Instagram",
      anuncio:"Anuncio de Meta",ads:"Anuncio de Meta",fb:"Facebook",tiktok:"TikTok",correo:"Correo"};
    if(o)return O[o]||corto(o,30);
    if(/facebook|instagram|meta|fb|ig/.test(src))return /cpc|paid|ads|anuncio|pago/.test(med)?"Anuncio de Meta":/insta|ig/.test(src)?"Instagram":"Facebook";
    if(src)return corto(src,30);
    if(/aureocl\.github\.io\/armar/.test(ref))return"QR de la tarjeta";
    if(/Instagram/.test(ua)||/instagram\.com/.test(ref))return"Instagram";
    if(/FBAN|FBAV|FB_IAB/.test(ua)||/facebook\.com/.test(ref))return q.get("fbclid")?"Facebook (puede ser anuncio)":"Facebook";
    if(/google\./.test(ref))return"Google";
    if(/whatsapp|wa\.me/.test(ref))return"WhatsApp";
    if(/tiktok/.test(ref)||/TikTok|musical_ly|BytedanceWebview/.test(ua))return"TikTok";
    if(ref&&!ref.includes(location.hostname))return corto(ref.replace(/^https?:\/\/(www\.)?/,"").split("/")[0],40);
    return"Directo / link guardado";
  }
  function dispositivo(){
    const ua=navigator.userAgent,lado=Math.min(screen.width,screen.height);
    if(/iPad|Tablet/.test(ua)||(/Android/.test(ua)&&!/Mobile/.test(ua))||(navigator.maxTouchPoints>1&&/Macintosh/.test(ua)))return"Tablet";
    if(/Mobi|Android|iPhone|iPod/.test(ua)||(navigator.maxTouchPoints>0&&lado<600))return"Celular";
    return"Computador";
  }

  /* La visita sigue viva mientras la persona vuelva antes de 30 minutos (el catálogo se recarga solo con versión nueva). */
  let V=leer(ses,"aureo-visita");
  if(!V||Date.now()-(V.ult||0)>30*60e3){
    V={id:azar(),t0:Date.now(),origen:origen(),disp:dispositivo(),entrada:corto(location.pathname+location.hash,60),
      carga:null,paso:1,vio:[],agrego:[],ofV:[],ofA:[],busq:[],pedido:"",compro:[],err:0,fotos:[],corte:"",enviada:""};
  }
  const guardar=()=>{V.ult=Date.now();grabar(ses,"aureo-visita",V)};
  const subir=n=>{if(n>V.paso)V.paso=n};
  guardar();

  /* Velocidad: segundos hasta que se ve la primera foto del catálogo (solo en la primera carga de la visita). */
  if(V.carga===null){let n=0;const mirar=()=>{
    const im=document.querySelector("#vista img");
    if(im&&im.complete&&im.naturalWidth>0){V.carga=Math.round(performance.now()/100)/10;guardar();return}
    if(++n<300)setTimeout(mirar,100)};setTimeout(mirar,100)}

  /* Fotos que no cargaron y errores de la página. */
  addEventListener("error",e=>{const t=e.target;
    if(t&&t.tagName==="IMG"){const f=(t.currentSrc||t.src||"").split("/").pop().split("?")[0];if(f&&!/isotipo/.test(f)){sumar(V.fotos,f,20);guardar()}}
    else if(e.message){V.err++;guardar()}},true);

  /* Búsquedas sin resultado: el catálogo muestra «¿No está …?» (.a-pedido). */
  let tb;document.addEventListener("input",e=>{if(e.target.id!=="buscar")return;clearTimeout(tb);tb=setTimeout(()=>{
    const q=e.target.value.trim();if(q.length>=3&&document.querySelector("#vista .a-pedido")){sumar(V.busq,q.toLowerCase(),20);guardar()}},1500)});

  /* Pedido: entrar a #pedido con algo = paso 4; la etapa más lejana queda como «corte» por si no lo envía. */
  const ETAPAS=["pedido","camisetas","coleccion","segundo","minis","entrega","pago"];
  const OFERTA={camisetas:"Pack de camisetas",coleccion:"Completa la colección",segundo:"2.º escudo con descuento",minis:"Minifiguras"};
  setInterval(()=>{if(location.hash!=="#pedido")return;
    try{if(typeof items==="function"&&items().length)subir(4);
      if(typeof pasos==="function"&&typeof paso==="number"){const e=pasos()[paso];if(OFERTA[e])sumar(V.ofV,OFERTA[e]);
        if(ETAPAS.indexOf(e)>ETAPAS.indexOf(V.corte))V.corte=e}}catch(err){}
    guardar()},1000);

  function evento(ev,d){
    if(ev==="ViewContent"){subir(2);sumar(V.vio,d.content_name)}
    else if(ev==="AddToCart"){subir(3);sumar(V.agrego,d.content_name)}
    else if(ev==="OfertaVista"&&d.oferta==="coleccion")sumar(V.ofV,OFERTA.coleccion);
    else if(ev==="OfertaAceptada")sumar(V.ofA,{pack:"Pack de camisetas","pack-ficha":"Pack de camisetas",coleccion:"Completa la colección"}[d.oferta]||d.oferta);
    else if(ev==="InitiateCheckout"){subir(5);
      try{if(typeof carro!=="undefined"&&typeof porSlug==="function")carro.forEach(c=>{const p=porSlug(c.s);if(p)sumar(V.compro,p.nombre)})}catch(e){}
      setTimeout(()=>{try{if(typeof ultimo!=="undefined"&&ultimo&&ultimo.id){V.pedido=ultimo.id;guardar();enviar()}}catch(e){}},50)}
    guardar();
  }

  /* Envío: una sola fila por visita (el script la reescribe si llega de nuevo). Solo si cambió algo. */
  function enviar(){
    if(AFUERA||BOT||typeof PEDIDOS_URL==="undefined"||!PEDIDOS_URL)return;
    try{if(typeof EQUIPO!=="undefined"&&EQUIPO)return}catch(e){}
    const {enviada,t0,ult,...datos}=V,firma=JSON.stringify(datos);
    if(firma===V.enviada)return;
    V.enviada=firma;guardar();
    const cuerpo=JSON.stringify({tipo:"visita",visitante,dur:Math.round((Date.now()-t0)/1000),...datos});
    try{if(navigator.sendBeacon&&navigator.sendBeacon(PEDIDOS_URL,new Blob([cuerpo],{type:"text/plain;charset=utf-8"})))return}catch(e){}
    try{fetch(PEDIDOS_URL,{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain;charset=utf-8"},body:cuerpo}).catch(()=>{})}catch(e){}
  }
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")enviar()});
  addEventListener("pagehide",enviar);

  /* «Ahora mismo»: un aviso corto al entrar, al cambiar de pantalla y cada 60 s mientras se ve (máximo 30 min por visita). */
  function lugar(){const h=location.hash;
    if(h.startsWith("#p/")){try{const p=typeof porSlug==="function"&&porSlug(decodeURIComponent(h.slice(3)));if(p)return p.nombre+" (ficha)"}catch(e){}return"Ficha de producto"}
    if(h==="#pedido")return"Pedido";if(h==="#listo")return"Pedido listo";return"Catálogo"}
  let ultimoVivo=0;
  function vivo(){
    if(AFUERA||BOT||document.visibilityState!=="visible"||typeof PEDIDOS_URL==="undefined"||!PEDIDOS_URL)return;
    try{if(typeof EQUIPO!=="undefined"&&EQUIPO)return}catch(e){}
    if(Date.now()-V.t0>30*60e3||Date.now()-ultimoVivo<5000)return;ultimoVivo=Date.now();
    try{navigator.sendBeacon(PEDIDOS_URL,new Blob([JSON.stringify({tipo:"vivo",v:V.id,pag:corto(lugar(),60)})],{type:"text/plain;charset=utf-8"}))}catch(e){}
  }
  addEventListener("load",()=>setTimeout(vivo,1500));
  addEventListener("hashchange",()=>setTimeout(vivo,800));
  setInterval(vivo,60e3);

  return{evento,enviar};
})();
