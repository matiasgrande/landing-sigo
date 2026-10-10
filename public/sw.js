// Service worker de la tienda SIGO: funciona con señal débil o sin conexión.
// - Páginas: red primero; si no hay red, la última copia guardada.
// - Archivos de la app (/_next/static): caché primero (llevan hash, no cambian).
// - Catálogo: la copia guardada al instante y se actualiza en segundo plano.
// - Fotos de productos: caché primero, con tope de entradas.
const VERSION = "sigo-v1";
const CACHE_APP = `${VERSION}-app`;
const CACHE_DATOS = `${VERSION}-datos`;
const CACHE_FOTOS = `${VERSION}-fotos`;
const MAXIMO_FOTOS = 400;
const BASE = new URL(self.registration.scope).pathname; // "/landing-sigo/"

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_APP)
      .then((cache) => cache.addAll([`${BASE}tienda/`, BASE, `${BASE}catalogo-asistente.json`]))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => !c.startsWith(VERSION)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

async function recortarCache(nombre, maximo) {
  const cache = await caches.open(nombre);
  const claves = await cache.keys();
  await Promise.all(claves.slice(0, Math.max(0, claves.length - maximo)).map((clave) => cache.delete(clave)));
}

async function redPrimero(peticion, nombreCache, respaldoPagina = false) {
  const cache = await caches.open(nombreCache);
  try {
    const respuesta = await fetch(peticion);
    if (respuesta.ok) cache.put(peticion, respuesta.clone());
    return respuesta;
  } catch {
    const guardada =
      (await cache.match(peticion, { ignoreSearch: respaldoPagina })) ?? (respaldoPagina ? await caches.match(`${BASE}tienda/`) : undefined);
    return guardada ?? Response.error();
  }
}

async function cachePrimero(peticion, nombreCache, maximo) {
  const cache = await caches.open(nombreCache);
  const guardada = await cache.match(peticion);
  if (guardada) return guardada;
  const respuesta = await fetch(peticion);
  // Las fotos de otro dominio llegan "opacas" (status 0): igual sirven para mostrarse
  if (respuesta.ok || respuesta.type === "opaque") {
    await cache.put(peticion, respuesta.clone());
    if (maximo) recortarCache(nombreCache, maximo);
  }
  return respuesta;
}

async function guardadaYActualizar(peticion, nombreCache) {
  const cache = await caches.open(nombreCache);
  const guardada = await cache.match(peticion);
  const fresca = fetch(peticion)
    .then((respuesta) => {
      if (respuesta.ok) cache.put(peticion, respuesta.clone());
      return respuesta;
    })
    .catch(() => guardada ?? Response.error());
  return guardada ?? fresca;
}

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET") return;
  const url = new URL(peticion.url);

  if (url.origin === self.location.origin) {
    if (peticion.mode === "navigate") return evento.respondWith(redPrimero(peticion, CACHE_APP, true));
    if (url.pathname.startsWith(`${BASE}_next/static/`) || url.pathname.startsWith(`${BASE}iconos/`)) {
      return evento.respondWith(cachePrimero(peticion, CACHE_APP));
    }
    if (url.pathname.endsWith("/catalogo-asistente.json")) return evento.respondWith(guardadaYActualizar(peticion, CACHE_DATOS));
    return;
  }
  if (url.hostname.endsWith("sigo.com.ve") && url.pathname.includes("/images/")) {
    return evento.respondWith(cachePrimero(peticion, CACHE_FOTOS, MAXIMO_FOTOS));
  }
  // Tasa BCV: red primero; sin conexión, la última conocida
  if (url.hostname === "ve.dolarapi.com") return evento.respondWith(redPrimero(peticion, CACHE_DATOS));
});
