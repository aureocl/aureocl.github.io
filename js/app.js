/* Arranque y navegación entre vistas (#pedido, #listo, #p/…).
   Parte de: todos (cambios con cuidado). Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
/* ---------- Navegación ---------- */
(()=>{const u=document.getElementById("urgencia");if(URGENCIA&&new Date()<=new Date(URGENCIA.hasta+"T23:59:59")){u.textContent=URGENCIA.texto;u.style.display=""}})();
if(FINAL)document.body.classList.add("final");else document.getElementById("avisoProto").style.display="";
function ruta(){document.getElementById("toast").classList.remove("ver");const h=location.hash;if(h==="#listo"){vistaListo();return}if(h.startsWith("#p/"))vistaFicha(h.slice(3));else if(h==="#pedido")vistaPedido();else vistaCatalogo()}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-add]");if(a){e.stopPropagation();agregar(a.dataset.add);return}
  const c=e.target.closest("[data-cat]");if(c){cat=c.dataset.cat;vistaCatalogo();return}
  const r=e.target.closest("[data-ir]");if(r){location.hash="#p/"+r.dataset.ir}
});
document.getElementById("buscar").addEventListener("input",()=>{if(!location.hash)vistaCatalogo()});
document.getElementById("volver").onclick=()=>{if(location.hash==="#pedido"&&paso>0){paso--;vistaPedido();return}history.length>1?history.back():(location.hash="")};
document.getElementById("carroFlot").onclick=()=>{paso=0;location.hash="#pedido"};
document.getElementById("toastVer").onclick=()=>{document.getElementById("toast").classList.remove("ver");paso=0;location.hash="#pedido"};
window.addEventListener("hashchange",ruta);
cargar().then(()=>{pintarFlot();ruta()}).catch(()=>{document.getElementById("vista").innerHTML='<p class="vacio">No se pudo cargar el catálogo.</p>'});
