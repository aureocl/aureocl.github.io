/* Arranque y navegación entre vistas (#pedido, #listo, #p/…).
   Parte de: todos (cambios con cuidado). Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
/* ---------- Navegación ---------- */
(()=>{const u=document.getElementById("urgencia");if(URGENCIA&&new Date()<=new Date(URGENCIA.hasta+"T23:59:59")){u.textContent=URGENCIA.texto;u.style.display=""}})();
if(FINAL)document.body.classList.add("final");else document.getElementById("avisoProto").style.display="";
function ruta(){document.getElementById("toast").classList.remove("ver");const h=location.hash;if(h==="#listo"){vistaListo();return}if(h==="#rapido"&&EQUIPO){vistaRapido();return}if(h.startsWith("#p/"))vistaFicha(h.slice(3));else if(h==="#pedido")vistaPedido();else vistaCatalogo()}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-add]");if(a){e.stopPropagation();agregar(a.dataset.add);return}
  const c=e.target.closest("[data-cat]");if(c){cat=c.dataset.cat;vistaCatalogo();return}
  const r=e.target.closest("[data-ir]");if(r){location.hash="#p/"+r.dataset.ir}
});
document.getElementById("buscar").addEventListener("input",()=>{if(!location.hash)vistaCatalogo()});
document.getElementById("volver").onclick=()=>{if(location.hash==="#pedido"&&paso>0){paso--;vistaPedido();return}history.length>1?history.back():(location.hash="")};
document.getElementById("carroFlot").onclick=()=>{paso=0;location.hash="#pedido"};
document.getElementById("toastVer").onclick=()=>{document.getElementById("toast").classList.remove("ver");paso=0;location.hash="#pedido"};
window.addEventListener("hashchange",()=>{if(hayNueva&&seguro()&&recargar())return;ruta();if(location.hash==="#pedido")revisarVersion()});
if(EQUIPO){const d=document.createElement("div");d.style.cssText="background:#2b2540;color:#fff;font:600 13px/1.3 system-ui;padding:8px 16px;text-align:center";d.innerHTML=`Modo equipo · ${esc(EQUIPO)}: los pedidos van a la bandeja · <a href="#rapido" style="color:#ffd76a">⚡ Ingreso rápido</a> · <a href="?equipo=salir" style="color:#e8d9ff">Salir</a>`;document.body.prepend(d)}

/* ---------- Versión nueva (Áureo, 20-nov-2026) ----------
   Una pestaña abierta desde antes de una actualización sigue con el código viejo (así se perdió el pedido 714 de la bandeja).
   Al volver a la pestaña, al entrar al pedido y al abrir, se compara el ?v= de los archivos con el index.html publicado;
   si cambió, se recarga (el carro está guardado en el navegador). Con datos a medio escribir espera a que salga del pedido. */
const firmaV=t=>((t||"").match(/(?:js|css)\/[\w.-]+\?v=\w+/g)||[]).sort().join(),FIRMA_V=firmaV(document.documentElement.innerHTML);
let hayNueva=false,ultRev=0;
const seguro=()=>location.hash==="#listo"?false:location.hash!=="#pedido"||(paso===0&&!datos.nom);
function recargar(){try{const t=+sessionStorage.getItem("aureo-recarga")||0;if(Date.now()-t<120000)return false;sessionStorage.setItem("aureo-recarga",Date.now())}catch(e){}location.reload();return true}
function revisarVersion(){if(!FIRMA_V||Date.now()-ultRev<30000)return;ultRev=Date.now();
  fetch(location.pathname+"?nv="+Date.now(),{cache:"no-store"}).then(r=>r.ok?r.text():"").then(t=>{const f=firmaV(t);if(!f||f===FIRMA_V)return;hayNueva=true;if(seguro())recargar()}).catch(()=>{})}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")revisarVersion()});
setTimeout(revisarVersion,3000);
cargar().then(()=>{pintarFlot();ruta()}).catch(()=>{document.getElementById("vista").innerHTML='<p class="vacio">No se pudo cargar el catálogo.</p>'});
