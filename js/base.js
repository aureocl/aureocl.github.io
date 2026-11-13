/* Base: utilidades, carga de la planilla, carrito, envío y avisos.
   Parte de: todos (cambios con cuidado). Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
let ultimo=null, coleccion=new Set();
const SERIES = ["Anime","Pokémon","Harry Potter","Marvel","Mario Bros","Sonic","Disney","Star Wars","Sanrio","Zootopia","Minecraft","Bob Esponja","Los Simpsons"];
/* Envío gratis a la región del club (regla de Áureo). Cobreloa: solo Calama. */
const REGION_CLUB = {"santiago-wanderers":"Valparaíso","everton":"Valparaíso","san-luis-de-quillota":"Valparaíso","deportes-iquique":"Tarapacá","nublense":"Ñuble","huachipato":"Biobío","deportes-concepcion":"Biobío","rangers-de-talca":"Maule","curico-unido":"Maule","o-higgins":"O'Higgins","coquimbo-unido":"Coquimbo","deportes-la-serena":"Coquimbo","deportes-temuco":"Araucanía","cobreloa":"Antofagasta|calama","deportes-puerto-montt":"Los Lagos"};
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
function tramosCombo(){const c=comboFila();if(!c)return null;const n=(c.det.match(/\$[\d.]+/g)||[]).map(num);return{1:c.precio,2:n[0]||c.precio*2,3:n[1]||c.precio*3}}
function hincha(p){const k=ALIAS[p.slug]||p.slug;return HINCHA[k]||null}
const porSlug=s=>P.find(p=>p.slug===s);

/* ---------- Pedido (solo productos se recuerdan; los datos personales nunca) ---------- */
let carro=[];try{carro=JSON.parse(localStorage.getItem("aureo-pedido")||"[]")}catch(e){}
let camisetas=[], minis=0, series="", datos={}, bumps={}, paso=0, vistos={}, mirando=false, mirarCat="";
function regionClub(s,reg,com){const r=REGION_CLUB[ALIAS[s]||s];if(!r)return false;const[rr,cc]=r.split("|");return rr===reg&&(!cc||norm(com)===cc)}
function envio(reg,com,mod,base){
  const I=items(),esc19=I.some(x=>esEscudo(x.p)&&x.p.precio>=19000);
  if(reg==="Metropolitana"){if(base>=20000||esc19)return{c:0,porque:"Envío gratis en Santiago (pedido desde $20.000)"};return{c:mod==="Domicilio"?3000:2000,porque:"Bajo $20.000 el envío se paga"}}
  const club=I.find(x=>esEscudo(x.p)&&regionClub(x.p.slug,reg,com));
  if(club&&base>=20000){return mod==="Punto Bluexpress"?{c:0,porque:`Tu ${club.p.nombre} viaja gratis a punto Bluexpress en ${reg}`}:{c:3000,porque:`Gratis a punto Bluexpress en ${reg}; a domicilio $3.000`}}
  return{c:mod==="Domicilio"?3000:2000,porque:""};
}
function guardar(){try{localStorage.setItem("aureo-pedido",JSON.stringify(carro))}catch(e){}pintarFlot()}
function agregar(s,c=1,silencio){const i=carro.find(x=>x.s===s);i?i.c+=c:carro.push({s,c});guardar();const p=porSlug(s);medir("AddToCart",{content_name:p.nombre,value:p.precio*c,currency:"CLP"});if(!silencio)toast(`${p.nombre} agregado a tu pedido`)}
const items=()=>carro.map(x=>({...x,p:porSlug(x.s)})).filter(x=>x.p);
const subtotal=()=>items().reduce((a,x)=>a+(x.p.precio||0)*x.c,0);
function pintarFlot(){const n=items().reduce((a,x)=>a+x.c,0);const b=document.getElementById("carroFlot");b.classList.toggle("ver",n>0);b.textContent=`Mi pedido · ${n} · ${clp(subtotal())}`}
let tt;function toast(t){document.getElementById("toastTxt").textContent=t;const el=document.getElementById("toast");el.classList.add("ver");clearTimeout(tt);tt=setTimeout(()=>el.classList.remove("ver"),3500)}

