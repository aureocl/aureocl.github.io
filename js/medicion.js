/* Medición: eventos al píxel de Meta.
   Parte de: W4 · Tráfico y medición. Lo carga index.html en este orden: config → medicion → base → vitrina → pedido → app.
   Todos comparten las mismas variables globales (scripts clásicos, sin módulos). */
/* Medición: si la página tiene el píxel de Meta (fbq), manda el evento; si no, solo lo anota en la consola. */
function medir(ev,d={}){try{if(window.fbq){["ViewContent","AddToCart","InitiateCheckout","Purchase"].includes(ev)?fbq("track",ev,d):fbq("trackCustom",ev,d)}}catch(e){}console.debug("[medir]",ev,d)}
