// Extrae el catálogo público de las tiendas en línea de SIGO (nopCommerce multitienda) para el prototipo.
// www.sigo.com.ve está desactualizada: las tiendas activas son costazul. y sambil., que comparten
// los IDs de producto pero tienen precio y disponibilidad propios. Se combinan por ID.
// Uso: NODE_USE_ENV_PROXY=1 node scripts/extraer-catalogo.mjs
// Salida: datos/catalogo-sigo.json (completo). Luego: node scripts/preparar-catalogo-asistente.mjs
//
// Solo lee páginas públicas de categorías (permitidas por robots.txt), con pausas entre
// peticiones para no cargar el servidor. No toca carrito, cuentas ni checkout.

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const TIENDAS = [
  { clave: "costazul", nombre: "Sigo Supermarket Costazul", base: "https://costazul.sigo.com.ve" },
  { clave: "sambil", nombre: "Sigo Supermarket Sambil", base: "https://sambil.sigo.com.ve" },
];
const PAUSA_MS = 350;
const CONCURRENCIA = 3;
const MAX_PAGINAS = 80;
const AGENTE = "Mozilla/5.0 (prototipo landing SIGO; extraccion de catalogo)";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** Decodifica entidades HTML comunes (&#xED;, &amp;, etc.) */
function decodificar(texto) {
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function descargar(url, intentos = 3) {
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      const respuesta = await fetch(url, { headers: { "User-Agent": AGENTE }, redirect: "follow" });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      return await respuesta.text();
    } catch (error) {
      if (intento === intentos) throw new Error(`${url}: ${error instanceof Error ? error.message : error}`);
      await esperar(1500 * intento);
    }
  }
  return "";
}

/**
 * Lee el árbol de categorías del menú responsive (<ul class="mega-menu-responsive">).
 * Devuelve nodos { nombre, ruta, ancestros[], esHoja }.
 */
function leerCategorias(html) {
  const inicio = html.indexOf('class="mega-menu-responsive"');
  if (inicio < 0) throw new Error("No se encontró el menú de categorías");
  const fragmento = html.slice(inicio);
  const fin = fragmento.indexOf("</nav>") > 0 ? fragmento.indexOf("</nav>") : fragmento.length;
  const menu = fragmento.slice(0, fin);

  // Recorre etiquetas en orden para conocer la profundidad de cada enlace
  const fichas = menu.matchAll(/<ul[^>]*class="sublist"[^>]*>|<\/ul>|<a[^>]*href="(\/[^"]*)"[^>]*>([^<]*)<\/a>/g);
  const pila = [];
  const nodos = [];
  let profundidad = 0;
  for (const ficha of fichas) {
    const etiqueta = ficha[0];
    if (etiqueta.startsWith("<ul")) {
      profundidad++;
      continue;
    }
    if (etiqueta === "</ul>") {
      profundidad--;
      while (pila.length && pila[pila.length - 1].profundidad >= profundidad) pila.pop();
      continue;
    }
    const ruta = decodeURI(ficha[1] ?? "");
    const nombre = decodificar(ficha[2] ?? "");
    if (!nombre || ruta === "/") continue;
    while (pila.length && pila[pila.length - 1].profundidad >= profundidad) pila.pop();
    const nodo = { nombre, ruta, ancestros: pila.map((p) => p.nombre), profundidad, esHoja: true };
    if (pila.length) pila[pila.length - 1].nodo.esHoja = false;
    nodos.push(nodo);
    pila.push({ profundidad, nombre, nodo });
  }
  return nodos;
}

/** Extrae los productos de una página de listado */
function leerProductos(html) {
  const productos = [];
  const bloques = html.split('<div class="product-item"').slice(1);
  for (const bloque of bloques) {
    const id = /data-productid="(\d+)"/.exec(bloque)?.[1];
    const enlace = /<h2 class="product-title">\s*<a href="([^"]+)">([^<]*)<\/a>/.exec(bloque);
    if (!id || id === "0" || !enlace) continue;
    const imagen = /data-lazyloadsrc="([^"]+)"/.exec(bloque)?.[1] ?? /<img[^>]*src="(https?:[^"]+)"/.exec(bloque)?.[1];
    const precio = /class="price actual-price">\s*\$?([\d.,]+)/.exec(bloque)?.[1];
    const precioAnterior = /class="price old-price">\s*\$?([\d.,]+)/.exec(bloque)?.[1];
    const descripcion = /<div class="description">([\s\S]*?)<\/div>/.exec(bloque)?.[1];
    // Cada producto trae un <style> con la clase "Shopping-cart-add-disabled"; lo que indica
    // disponibilidad es el botón "Añadir al carrito" (los no disponibles dicen "Próximamente")
    const fichaProducto = bloque.split(/<div class="item-box"/)[0] ?? bloque;
    const disponible = fichaProducto.includes("product-box-add-to-cart-button");
    productos.push({
      id: Number(id),
      nombre: decodificar(enlace[2] ?? ""),
      ruta: enlace[1],
      imagen: imagen ?? null,
      precioUsd: precio ? Number(precio.replace(/,/g, "")) : null,
      precioAnteriorUsd: precioAnterior ? Number(precioAnterior.replace(/,/g, "")) : null,
      descripcion: descripcion ? decodificar(descripcion.replace(/<[^>]+>/g, " ")) : "",
      disponible,
    });
  }
  return productos;
}

/**
 * Recorre las páginas de una categoría. Las categorías padre repiten los productos de sus
 * hijas en decenas de páginas: de ellas solo se lee la primera, por si tienen productos propios.
 */
async function extraerCategoria(base, categoria) {
  const productos = [];
  const vistos = new Set();
  const limitePaginas = categoria.esHoja ? MAX_PAGINAS : 1;
  for (let pagina = 1; pagina <= limitePaginas; pagina++) {
    const url = `${base}${encodeURI(categoria.ruta)}?pagenumber=${pagina}`;
    const html = await descargar(url);
    const nuevos = leerProductos(html).filter((p) => !vistos.has(p.id));
    if (nuevos.length === 0) break;
    nuevos.forEach((p) => vistos.add(p.id));
    productos.push(...nuevos);
    // Sin enlace a la página siguiente: era la última
    if (!html.includes(`pagenumber=${pagina + 1}`)) break;
    await esperar(PAUSA_MS);
  }
  return productos;
}

async function principal() {
  const inicio = Date.now();
  const catalogo = new Map();
  const errores = [];
  let categorias = [];

  for (const tienda of TIENDAS) {
    const portada = await descargar(tienda.base + "/");
    const deLaTienda = leerCategorias(portada);
    if (categorias.length === 0) categorias = deLaTienda;
    const hojas = deLaTienda.filter((c) => c.esHoja);
    const padres = deLaTienda.filter((c) => !c.esHoja);
    console.log(`${tienda.nombre}: ${deLaTienda.length} categorías (${hojas.length} finales)`);

    // Primero las finales (dan la ruta más específica); luego los padres por si tienen productos propios
    const cola = [...hojas, ...padres];
    let hechas = 0;

    async function trabajador() {
      while (cola.length) {
        const categoria = cola.shift();
        if (!categoria) break;
        try {
          const productos = await extraerCategoria(tienda.base, categoria);
          const camino = [...categoria.ancestros, categoria.nombre];
          for (const producto of productos) {
            const { precioUsd, precioAnteriorUsd, disponible, ruta, ...comunes } = producto;
            const existente = catalogo.get(producto.id) ?? { ...comunes, categorias: [], tiendas: {} };
            if (categoria.esHoja && !existente.categorias.some((c) => c.join("/") === camino.join("/"))) {
              existente.categorias.push(camino);
            }
            if (existente.categorias.length === 0) existente.categorias.push(camino);
            if (!existente.tiendas[tienda.clave]) {
              existente.tiendas[tienda.clave] = { precioUsd, precioAnteriorUsd, disponible, url: tienda.base + ruta };
            }
            catalogo.set(producto.id, existente);
          }
        } catch (error) {
          errores.push(String(error instanceof Error ? error.message : error));
        }
        hechas++;
        if (hechas % 20 === 0) console.log(`  ${tienda.clave}: ${hechas}/${cola.length + hechas} · ${catalogo.size} productos`);
        if (hechas % 40 === 0) await guardar(catalogo, categorias, errores, inicio);
        await esperar(PAUSA_MS);
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCIA }, trabajador));
  }

  await guardar(catalogo, categorias, errores, inicio, true);
}

/**
 * Precio y disponibilidad que se muestran: los de la primera tienda donde está disponible
 * (Costazul primero); si no está disponible en ninguna, los de la primera donde aparece.
 */
function consolidar(producto) {
  const ofertas = TIENDAS.map((t) => ({ clave: t.clave, ...producto.tiendas[t.clave] })).filter((o) => o.precioUsd > 0);
  const elegida = ofertas.find((o) => o.disponible) ?? ofertas[0];
  if (!elegida) return null;
  return {
    ...producto,
    precioUsd: elegida.precioUsd,
    precioAnteriorUsd: elegida.precioAnteriorUsd,
    disponible: ofertas.some((o) => o.disponible),
    tienda: elegida.clave,
    url: elegida.url,
  };
}

/** Escribe el JSON (también a mitad de camino, para no perder el avance) */
async function guardar(catalogo, categorias, errores, inicio, final = false) {
  const productos = [...catalogo.values()]
    .map(consolidar)
    // Sin precio publicado (aparecen en $0) no sirven para armar un carrito
    .filter((p) => p !== null)
    .sort((a, b) => a.id - b.id);
  const salida = {
    fuente: TIENDAS.map((t) => t.base),
    extraidoEn: new Date().toISOString(),
    totalProductos: productos.length,
    disponibles: productos.filter((p) => p.disponible).length,
    categorias: categorias.map(({ nombre, ruta, ancestros, esHoja }) => ({ nombre, ruta, ancestros, esHoja })),
    productos,
  };
  const destino = path.join(process.cwd(), "datos", "catalogo-sigo.json");
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, JSON.stringify(salida));
  if (!final) return;
  console.log(`Listo: ${productos.length} productos (${salida.disponibles} disponibles) en ${Math.round((Date.now() - inicio) / 1000)} s → ${destino}`);
  if (errores.length) console.log(`Errores (${errores.length}):\n${errores.slice(0, 20).join("\n")}`);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
