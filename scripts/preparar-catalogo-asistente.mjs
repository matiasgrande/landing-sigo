// Genera public/catalogo-asistente.json (formato compacto, lo usan el asistente y la tienda)
// a partir de datos/catalogo-sigo.json.
// Uso: node scripts/preparar-catalogo-asistente.mjs
// El asistente lo descarga bajo demanda; el formato por filas reduce mucho el peso.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Las imágenes se sirven igual desde cualquier subdominio de la tienda
const PREFIJO_IMAGEN = /^https:\/\/[a-z]+\.sigo\.com\.ve\/images\/thumbs\//;

async function principal() {
  const origen = path.join(process.cwd(), "datos", "catalogo-sigo.json");
  const datos = JSON.parse(await readFile(origen, "utf8"));
  if (!Array.isArray(datos.productos) || datos.productos.length === 0) throw new Error("Catálogo vacío");

  // Departamento (primer nivel), grupo intermedio opcional y categoría final de cada producto
  const departamentos = [];
  const indiceDepartamento = new Map();
  const categorias = [];
  const indiceCategoria = new Map();
  const productos = datos.productos.map((p) => {
    const camino = p.categorias?.[0] ?? [];
    const departamento = camino[0] ?? "Otros";
    if (!indiceDepartamento.has(departamento)) {
      indiceDepartamento.set(departamento, departamentos.length);
      departamentos.push(departamento);
    }
    const nombreCategoria = camino[camino.length - 1] ?? departamento;
    const grupo = camino.length > 2 ? camino[camino.length - 2] : "";
    const clave = `${departamento}>${grupo}>${nombreCategoria}`;
    if (!indiceCategoria.has(clave)) {
      indiceCategoria.set(clave, categorias.length);
      categorias.push([nombreCategoria, indiceDepartamento.get(departamento), grupo]);
    }
    const imagen = typeof p.imagen === "string" && PREFIJO_IMAGEN.test(p.imagen) ? p.imagen.replace(PREFIJO_IMAGEN, "") : null;
    // URL compacta: inicial de la tienda + ruta ("c/arroz-mary-1-k" -> costazul.sigo.com.ve/arroz-mary-1-k)
    const enlace = typeof p.url === "string" ? `${(p.tienda ?? "costazul")[0]}${new URL(p.url).pathname}` : null;
    const costazul = p.tiendas?.costazul;
    const sambil = p.tiendas?.sambil;
    // Disponibilidad por sucursal en bits: 1 = Costazul, 2 = Sambil
    const disponibilidad = (costazul?.disponible ? 1 : 0) | (sambil?.disponible ? 2 : 0);
    const precioBase = costazul?.precioUsd > 0 ? costazul.precioUsd : p.precioUsd;
    // Solo se guarda el precio de Sambil cuando difiere (0 = igual al base)
    const precioSambil = sambil?.precioUsd > 0 && sambil.precioUsd !== precioBase ? sambil.precioUsd : 0;
    return [
      p.id,
      p.nombre,
      precioBase,
      indiceCategoria.get(clave),
      imagen,
      disponibilidad,
      enlace,
      p.precioAnteriorUsd ?? 0,
      precioSambil,
    ];
  });

  const salida = { version: 2, extraidoEn: datos.extraidoEn, departamentos, categorias, productos };
  const destino = path.join(process.cwd(), "public", "catalogo-asistente.json");
  await writeFile(destino, JSON.stringify(salida));
  console.log(`${productos.length} productos, ${departamentos.length} departamentos, ${categorias.length} categorías → ${destino}`);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
