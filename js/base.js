/* Base: utilidades, carga de la planilla, carrito, envío y avisos.
   Parte de: todos (cambios con cuidado). Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
let ultimo=null, coleccion=new Set();
const SERIES = ["Anime","Pokémon","Harry Potter","Marvel","Mario Bros","Sonic","Disney","Star Wars","Sanrio","Zootopia","Minecraft","Bob Esponja","Los Simpsons"];
/* REGLA DE ENVÍO GRATIS (Áureo, 19-nov-2026), pedidos desde $20.000:
   1. Santiago (Región Metropolitana): gratis, a domicilio o a punto Blue. Vale para todo el catálogo.
   2. Escudo de un club CHILENO de regiones: además gratis a PUNTO BLUE en la región de ese club (a domicilio, $3.000).
   3. Pedidos desde $40.000 (Áureo, 24-nov-2026): gratis a PUNTO BLUE en todo Chile, lleve lo que lleve (a domicilio, $3.000).
   4. Bajo eso, clubes extranjeros y el resto del catálogo: fuera de Santiago el envío se paga.
   Los clubes de Santiago no van en esta lista (ya los cubre la regla 1). Al sumar un escudo chileno de regiones, agregarlo aquí.
   Cobreloa: solo Calama. */
const REGION_CLUB = {"santiago-wanderers":"Valparaíso","everton":"Valparaíso","san-luis-de-quillota":"Valparaíso","union-la-calera":"Valparaíso","deportes-iquique":"Tarapacá","deportes-iquique-clasico":"Tarapacá","nublense":"Ñuble","huachipato":"Biobío","deportes-concepcion":"Biobío","deportes-concepcion-leon":"Biobío","universidad-de-concepcion":"Biobío","fernandez-vial":"Biobío","lota-schwager":"Biobío","rangers-de-talca":"Maule","curico-unido":"Maule","o-higgins":"O'Higgins","coquimbo-unido":"Coquimbo","deportes-la-serena":"Coquimbo","deportes-temuco":"Araucanía","cobreloa":"Antofagasta|calama","deportes-puerto-montt":"Los Lagos","san-marcos-de-arica":"Arica y Parinacota"};
const GRATIS_DESDE = 20000, GRATIS_CHILE = 40000;
/* Región (y comuna) de envío gratis del primer escudo chileno de regiones del pedido, o null. */
function clubRegional(){const x=items().find(x=>esEscudo(x.p)&&REGION_CLUB[ALIAS[x.p.slug]||x.p.slug]);if(!x)return null;const[reg,com]=REGION_CLUB[ALIAS[x.p.slug]||x.p.slug].split("|");return{p:x.p,reg,com}}
/* «Envío gratis en Santiago» o «… y a punto Blue en Biobío»: el texto corto que usan la barra y las ofertas. */
function dondeGratis(){const c=clubRegional();return "en Santiago"+(c?` y a punto Blue en ${c.com?c.com[0].toUpperCase()+c.com.slice(1):c.reg}`:"")}
/* Plazos por zona en días hábiles desde el pago (Áureo, 24-nov-2026). Son los mismos que dice el agente de Meta: si cambian, cambiar allá también. */
function diasEnvio(reg){if(reg==="Metropolitana")return"1 a 3 días hábiles";if(["Valparaíso","O'Higgins","Maule","Ñuble","Biobío"].includes(reg))return"2 a 4 días hábiles";if(reg==="Aysén"||reg==="Magallanes")return"5 a 10 días hábiles";return"3 a 6 días hábiles"}
const REGIONES = ["Metropolitana","Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo","Valparaíso","O'Higgins","Maule","Ñuble","Biobío","Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes"];

function parseCSV(t){const F=[];let f=[],c="",q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==','){f.push(c);c=""}else if(ch=='\n'||ch=='\r'){if(ch=='\r'&&t[i+1]=='\n')i++;f.push(c);F.push(f);f=[];c=""}else c+=ch}if(c!==""||f.length){f.push(c);F.push(f)}return F}
const norm=s=>(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const slug=s=>norm(s).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const clp=n=>"$"+Number(n).toLocaleString("es-CL");
const num=s=>{const d=String(s||"").replace(/[^\d]/g,"");return d?Number(d):0};
const esc=s=>String(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const sinTildes=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"");
function fotoDe(p){const u=(p.foto||"").trim();if(u){const m=u.match(/\/d\/([\w-]{20,})/)||u.match(/[?&]id=([\w-]{20,})/);if(m&&/google/.test(u))return"https://lh3.googleusercontent.com/d/"+m[1]+"=w800";return u}return`fotos/${p.slug}.jpg`}
const img=(p,cls="")=>`<img class="${cls}" src="${esc(fotoDe(p))}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.onerror=null;this.className='ph';this.src='isotipo.svg'">`;

let P=[];
async function cargar(){
  const r=await fetch(CSV_URL+"&t="+Date.now(),{cache:"no-store"});
  const F=parseCSV(await r.text()).filter(f=>f.some(x=>x.trim()));
  const H=F.shift().map(norm);const col=n=>H.findIndex(h=>h.startsWith(n));
  const K={m:col("mostrar"),c:col("categoria"),n:col("producto"),t:col("tamano"),p:col("precio"),a:col("precio antes"),e:col("etiqueta"),d:col("detalle"),f:col("foto")};
  P=F.map(f=>({mostrar:norm(f[K.m]||"si"),cat:(f[K.c]||"Otros").trim(),nombre:(f[K.n]||"").trim(),tam:(f[K.t]||"").trim(),precio:num(f[K.p]),antes:num(f[K.a]),etq:(f[K.e]||"").trim(),det:(f[K.d]||"").trim(),foto:(f[K.f]||"").trim()}))
    .filter(p=>p.nombre&&!["no","n","0"].includes(p.mostrar)).map(p=>({...p,slug:slug(p.nombre)}));
}
const esEscudo=p=>p&&p.cat==="Escudos de fútbol"&&!/a pedido/i.test(p.nombre);
const comboFila=()=>P.find(p=>/camiseta/i.test(p.nombre)&&/con escudo/i.test(p.nombre));
const solaFila=()=>P.find(p=>/camiseta/i.test(p.nombre)&&/sola/i.test(p.nombre));
function tramosCombo(){const c=comboFila();if(!c)return null;const n=(c.det.match(/\$[\d.]+/g)||[]).map(num);return{1:c.precio,2:n[0]||c.precio*2,3:n[1]||c.precio*3,extra:n[2]||c.precio}}
function hincha(p){const k=ALIAS[p.slug]||p.slug;return HINCHA[k]||null}
const porSlug=s=>P.find(p=>p.slug===s);

/* ---------- Pedido (solo productos se recuerdan; los datos personales nunca) ---------- */
/* Modo equipo (Áureo, 20-nov-2026): Javi o Caro abren aureocl.github.io/?equipo=javi (o caro) en su celular e ingresan el
   pedido con los datos del cliente. El pedido va directo a la bandeja, sin abrir WhatsApp. Queda recordado en ese navegador;
   ?equipo=salir lo apaga. No da ningún permiso: solo cambia el último paso. */
let EQUIPO="";try{const q=(new URLSearchParams(location.search).get("equipo")||"").toLowerCase();if(q==="salir")localStorage.removeItem("aureo-equipo");else if(q==="javi"||q==="caro")localStorage.setItem("aureo-equipo",q==="javi"?"Javi":"Caro");EQUIPO=localStorage.getItem("aureo-equipo")||""}catch(e){}
let carro=[];try{carro=JSON.parse(localStorage.getItem("aureo-pedido")||"[]")}catch(e){}
let camisetas=[], minis=0, series="", datos={}, bumps={}, paso=0, vistos={}, mirando=false, mirarCat="";
function regionClub(s,reg,com){const r=REGION_CLUB[ALIAS[s]||s];if(!r)return false;const[rr,cc]=r.split("|");return rr===reg&&(!cc||norm(com)===cc)}
function envio(reg,com,mod,base){
  const I=items(); /* UC y Wanderers ($19.000) pagan envío si el pedido no llega a $20.000 (Áureo, 16-nov-2026) */
  const pago={c:mod==="Domicilio"?3000:2000};
  if(reg==="Metropolitana"){if(base>=GRATIS_DESDE)return{c:0,porque:"Envío gratis en Santiago (pedido desde $20.000)"};return{...pago,porque:"Bajo $20.000 el envío se paga"}}
  const club=I.find(x=>esEscudo(x.p)&&regionClub(x.p.slug,reg,com));
  if(club&&base>=GRATIS_DESDE){return mod==="Punto Bluexpress"?{c:0,porque:`Tu ${club.p.nombre} viaja gratis a punto Blue en ${reg}`}:{c:3000,porque:`Gratis a punto Blue en ${reg}; a domicilio $3.000`}}
  if(club)return{...pago,porque:`Desde $20.000 tu ${club.p.nombre} viaja gratis a punto Blue en ${reg}`};
  if(base>=GRATIS_CHILE)return mod==="Punto Bluexpress"?{c:0,porque:"Desde $40.000 el envío es gratis a punto Blue en todo Chile"}:{c:3000,porque:"Desde $40.000 es gratis a punto Blue en todo Chile; a domicilio $3.000"};
  return{...pago,porque:"Desde $40.000 el envío es gratis a punto Blue en todo Chile"};
}
function guardar(){try{localStorage.setItem("aureo-pedido",JSON.stringify(carro))}catch(e){}pintarFlot()}
function agregar(s,c=1,silencio){const i=carro.find(x=>x.s===s);i?i.c+=c:carro.push({s,c});guardar();const p=porSlug(s);medir("AddToCart",{content_name:p.nombre,value:p.precio*c,currency:"CLP"});if(!silencio)toast(`${p.nombre} agregado a tu pedido`)}
const items=()=>carro.map(x=>({...x,p:porSlug(x.s)})).filter(x=>x.p);
const subtotal=()=>items().reduce((a,x)=>a+(x.p.precio||0)*x.c,0);
function pintarFlot(){const n=items().reduce((a,x)=>a+x.c,0);const b=document.getElementById("carroFlot");b.classList.toggle("ver",n>0);b.textContent=`Mi pedido · ${n} · ${clp(subtotal())}`}
let tt;function toast(t){document.getElementById("toastTxt").textContent=t;const el=document.getElementById("toast");el.classList.add("ver");clearTimeout(tt);tt=setTimeout(()=>el.classList.remove("ver"),3500)}

