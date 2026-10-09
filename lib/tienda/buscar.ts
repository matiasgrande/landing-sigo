import type { ProductoCatalogo } from "@/datos/catalogo";
import { normalizarParaBuscar, palabrasClave, variantes, type IndiceCatalogo } from "@/lib/indiceCatalogo";

interface Vocabulario {
  palabras: string[];
  conjunto: Set<string>;
  /** Forma normalizada -> como se escribe en el catálogo ("panales" -> "pañales") */
  visibles: Map<string, string>;
}

const vocabularios = new WeakMap<IndiceCatalogo, Vocabulario>();

/** Todas las palabras de nombres y categorías del catálogo (se calcula una vez por índice) */
function vocabularioDe(indice: IndiceCatalogo): Vocabulario {
  const existente = vocabularios.get(indice);
  if (existente) return existente;
  const conjunto = new Set<string>();
  const visibles = new Map<string, string>();
  for (const entrada of indice.entradas) {
    entrada.nombre.forEach((p) => conjunto.add(p));
    entrada.categoria.forEach((p) => conjunto.add(p));
    for (const original of entrada.producto.nombre.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      const normalizada = normalizarParaBuscar(original).trim();
      if (normalizada && !visibles.has(normalizada)) visibles.set(normalizada, original);
    }
  }
  const vocabulario = { palabras: [...conjunto].filter((p) => p.length > 2), conjunto, visibles };
  vocabularios.set(indice, vocabulario);
  return vocabulario;
}

/** Distancia de edición con corte temprano (devuelve máximo + 1 si se pasa) */
function distancia(a: string, b: string, maximo: number): number {
  if (Math.abs(a.length - b.length) > maximo) return maximo + 1;
  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimoFila = i;
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      const valor = Math.min((anterior[j] ?? 0) + 1, (actual[j - 1] ?? 0) + 1, (anterior[j - 1] ?? 0) + costo);
      actual.push(valor);
      minimoFila = Math.min(minimoFila, valor);
    }
    if (minimoFila > maximo) return maximo + 1;
    anterior = actual;
  }
  return anterior[b.length] ?? maximo + 1;
}

/**
 * Palabra del usuario -> palabras del catálogo que debe buscar.
 * Exacta (con plural/singular), o la más parecida si hay un error de tipeo ("hrina" -> "harina").
 * Si es la última palabra y se está escribiendo, también vale como prefijo ("arro" -> "arroz").
 */
function resolverPalabra(palabra: string, vocabulario: Vocabulario, esPrefijo: boolean): string[] {
  const exactas = variantes(palabra).filter((v) => vocabulario.conjunto.has(v));
  if (exactas.length > 0) return exactas;
  if (esPrefijo && palabra.length >= 2) {
    const prefijos = vocabulario.palabras.filter((p) => p.startsWith(palabra)).slice(0, 8);
    if (prefijos.length > 0) return prefijos;
  }
  if (palabra.length < 4) return [];
  const tolerancia = palabra.length >= 7 ? 2 : 1;
  let mejores: string[] = [];
  let mejorDistancia = tolerancia + 1;
  for (const candidata of vocabulario.palabras) {
    const d = distancia(palabra, candidata, tolerancia);
    if (d < mejorDistancia) {
      mejorDistancia = d;
      mejores = [candidata];
    } else if (d === mejorDistancia && d <= tolerancia) {
      mejores.push(candidata);
    }
  }
  return mejores.slice(0, 4);
}

export interface ResultadoBusquedaTienda {
  productos: ProductoCatalogo[];
  /** Palabras corregidas cuando hubo errores de tipeo ("hrina" -> "harina"), con sus tildes */
  correccion: string | null;
  /** Palabras que no coinciden con nada y se ignoraron para mostrar algo ("arroz xyzabc") */
  ignoradas: string[];
}

type Disponibilidad = (producto: ProductoCatalogo) => boolean;
const segunCatalogo: Disponibilidad = (producto) => producto.disponible !== false;

/**
 * Busca productos para la tienda: todas las palabras deben coincidir (nombre o categoría);
 * si no hay resultados así, se relaja a cualquiera de ellas.
 */
export function buscarProductos(
  indice: IndiceCatalogo,
  texto: string,
  esPrefijo = false,
  estaDisponible: Disponibilidad = segunCatalogo,
): ResultadoBusquedaTienda {
  const palabras = palabrasClave(texto);
  if (palabras.length === 0) return { productos: [], correccion: null, ignoradas: [] };
  const vocabulario = vocabularioDe(indice);
  const resueltas = palabras.map((p, i) => resolverPalabra(p, vocabulario, esPrefijo && i === palabras.length - 1));

  const corregidas = palabras.map((p, i) => {
    const opciones = resueltas[i] ?? [];
    return opciones.length > 0 && !variantes(p).some((v) => opciones.includes(v)) && !opciones.some((o) => o.startsWith(p))
      ? (opciones[0] ?? p)
      : p;
  });
  const correccion =
    corregidas.join(" ") !== palabras.join(" ") ? corregidas.map((p) => vocabulario.visibles.get(p) ?? p).join(" ") : null;

  const puntuar = (exigirTodas: boolean) => {
    const resultados: { producto: ProductoCatalogo; puntaje: number }[] = [];
    for (const entrada of indice.entradas) {
      let puntaje = 0;
      let coincidencias = 0;
      for (const opciones of resueltas) {
        if (opciones.some((o) => entrada.principal.has(o))) {
          puntaje += 3;
          coincidencias++;
        } else if (opciones.some((o) => entrada.nombre.has(o))) {
          puntaje += 2;
          coincidencias++;
        } else if (opciones.some((o) => entrada.categoria.has(o))) {
          puntaje += 1;
          coincidencias++;
        }
      }
      if (coincidencias === 0 || (exigirTodas && coincidencias < resueltas.length)) continue;
      resultados.push({ producto: entrada.producto, puntaje: puntaje - entrada.totalPalabras * 0.05 });
    }
    return resultados;
  };

  let resultados = puntuar(true);
  let ignoradas: string[] = [];
  if (resultados.length === 0) {
    resultados = puntuar(false);
    ignoradas = palabras.filter((_, i) => (resueltas[i] ?? []).length === 0);
  }
  resultados.sort(
    (a, b) =>
      b.puntaje - a.puntaje ||
      Number(estaDisponible(b.producto)) - Number(estaDisponible(a.producto)) ||
      a.producto.precioUsd - b.producto.precioUsd,
  );
  return { productos: resultados.map((r) => r.producto), correccion, ignoradas };
}

export interface SugerenciaCategoria {
  departamento: string;
  categoria: string;
  cantidad: number;
}

export interface Sugerencias {
  terminos: string[];
  categorias: SugerenciaCategoria[];
  productos: ProductoCatalogo[];
  /** Resultados con existencia (lo que muestra el listado por defecto) */
  total: number;
  correccion: string | null;
}

/** Autocompletado en tres bloques: términos, categorías y productos con precio */
export function sugerir(indice: IndiceCatalogo, texto: string, estaDisponible: Disponibilidad = segunCatalogo): Sugerencias {
  const consulta = normalizarParaBuscar(texto).trim();
  if (consulta.length < 2) return { terminos: [], categorias: [], productos: [], total: 0, correccion: null };
  const resultado = buscarProductos(indice, consulta, true, estaDisponible);
  // Las sugerencias muestran solo lo que se puede comprar en la sucursal, igual que el listado
  const productos = resultado.productos.filter(estaDisponible);
  const correccion = resultado.correccion;

  // Categorías más frecuentes entre los resultados
  const conteo = new Map<string, SugerenciaCategoria>();
  for (const producto of productos.slice(0, 200)) {
    const clave = `${producto.departamento}>${producto.categoria}`;
    const actual = conteo.get(clave) ?? { departamento: producto.departamento ?? "", categoria: producto.categoria, cantidad: 0 };
    actual.cantidad++;
    conteo.set(clave, actual);
  }
  const categorias = [...conteo.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, 3);

  // Términos: la consulta completada con palabras frecuentes de los primeros resultados
  const base = normalizarParaBuscar(correccion ?? consulta).trim().split(/\s+/);
  const ultima = base[base.length - 1] ?? "";
  const frecuencia = new Map<string, number>();
  for (const producto of productos.slice(0, 60)) {
    const palabras = palabrasClave(producto.nombre);
    const indiceUltima = palabras.findIndex((p) => p.startsWith(ultima));
    const siguiente = indiceUltima >= 0 ? palabras[indiceUltima + 1] : undefined;
    const completa = indiceUltima >= 0 ? palabras[indiceUltima] : undefined;
    const termino = [...base.slice(0, -1), completa, siguiente].filter(Boolean).join(" ");
    if (termino) frecuencia.set(termino, (frecuencia.get(termino) ?? 0) + 1);
  }
  const { visibles } = vocabularioDe(indice);
  const terminos = [...frecuencia.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([termino]) => termino.split(" ").map((p) => visibles.get(p) ?? p).join(" "))
    .slice(0, 4);

  return { terminos, categorias, productos: productos.slice(0, 5), total: productos.length, correccion };
}
