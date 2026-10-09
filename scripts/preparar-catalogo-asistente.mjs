// Genera public/catalogo-asistente.json (formato compacto) a partir de datos/catalogo-sigo.json.
// Uso: node scripts/preparar-catalogo-asistente.mjs
// El asistente lo descarga bajo demanda; el formato por filas reduce mucho el peso.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PREFIJO_IMAGEN = "https://www.sigo.com.ve/images/thumbs/";

async function principal() {
  const origen = path.join(process.cwd(), "datos", "catalogo-sigo.json");
  const datos = JSON.parse(await readFile(origen, "utf8"));
  if (!Array.isArray(datos.productos) || datos.productos.length === 0) throw new Error("Catálogo vacío");

  const categorias = [];
  const indiceCategoria = new Map();
  const productos = datos.productos.map((p) => {
    // La categoría más específica (última del primer camino)
    const camino = p.categorias?.[0] ?? [];
    const nombreCategoria = camino[camino.length - 1] ?? "";
    if (!indiceCategoria.has(nombreCategoria)) {
      indiceCategoria.set(nombreCategoria, categorias.length);
      categorias.push(nombreCategoria);
    }
    const imagen = typeof p.imagen === "string" && p.imagen.startsWith(PREFIJO_IMAGEN) ? p.imagen.slice(PREFIJO_IMAGEN.length) : null;
    return [p.id, p.nombre, p.precioUsd, indiceCategoria.get(nombreCategoria), imagen, p.disponible ? 1 : 0, p.ruta];
  });

  const salida = { extraidoEn: datos.extraidoEn, categorias, productos };
  const destino = path.join(process.cwd(), "public", "catalogo-asistente.json");
  await writeFile(destino, JSON.stringify(salida));
  console.log(`${productos.length} productos, ${categorias.length} categorías → ${destino}`);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
