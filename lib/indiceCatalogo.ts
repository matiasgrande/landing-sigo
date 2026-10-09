import type { ProductoCatalogo } from "@/datos/catalogo";

/** Palabras que no identifican un producto (artículos, unidades, presentaciones) */
const PALABRAS_SIN_PESO = new Set([
  "de", "del", "la", "el", "los", "las", "lo", "y", "con", "sin", "en", "para", "al", "a", "x", "o",
  "kg", "kgs", "gr", "grs", "g", "gramos", "ml", "lt", "lts", "l", "litro", "litros", "cc", "oz",
  "und", "unds", "un", "unid", "unidad", "unidades", "pza", "pzas", "paq", "paquete", "pack", "cm", "mts", "m",
]);

/** Minúsculas, sin acentos, "P.A.N." -> "pan", y solo letras/números */
export function normalizarParaBuscar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([a-z])\.(?=[a-z])/g, "$1")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/ñ/g, "n")
    // Formas pegadas o separadas de marcas conocidas
    .replace(/\b7\s+up\b/g, "7up")
    .replace(/\bcocacola\b/g, "coca cola");
}

/** Cantidades y medidas sueltas ("2", "1.5", "500g", "2kg") que no describen el producto */
export function esMedida(palabra: string): boolean {
  return /^\d+(?:[.,]\d+)?(?:kgs?|k|grs?|g|ml|lts?|l|cc|oz|und|unds|x)?$/.test(palabra);
}

/** Variantes singulares simples: "tomates" -> "tomate", "limones" -> "limon" */
export function variantes(palabra: string): string[] {
  const resultado = [palabra];
  if (palabra.length > 3 && palabra.endsWith("es")) resultado.push(palabra.slice(0, -2));
  if (palabra.length > 2 && palabra.endsWith("s")) resultado.push(palabra.slice(0, -1));
  return resultado;
}

/** Palabras significativas de un texto (sin números ni unidades) */
export function palabrasClave(texto: string): string[] {
  return normalizarParaBuscar(texto)
    .split(/\s+/)
    .filter((p) => p.length > 1 && !esMedida(p) && !PALABRAS_SIN_PESO.has(p));
}

interface EntradaIndice {
  producto: ProductoCatalogo;
  /** Variantes del sustantivo principal (primera clave) */
  principal: Set<string>;
  /** Variantes de todas las palabras del nombre y sinónimos */
  nombre: Set<string>;
  /** Variantes de las palabras de su categoría */
  categoria: Set<string>;
  totalPalabras: number;
}

export interface IndiceCatalogo {
  entradas: EntradaIndice[];
  total: number;
  /** "real" si viene de sigo.com.ve, "demo" si es el catálogo de demostración */
  origen: "real" | "demo";
  extraidoEn?: string;
}

function conVariantes(palabras: string[]): Set<string> {
  return new Set(palabras.flatMap(variantes));
}

export function crearIndice(
  productos: readonly ProductoCatalogo[],
  origen: IndiceCatalogo["origen"],
  extraidoEn?: string,
): IndiceCatalogo {
  const entradas = productos.map((producto) => {
    const claves = producto.claves.length > 0 ? producto.claves : palabrasClave(producto.nombre);
    return {
      producto,
      principal: conVariantes(claves.slice(0, 1)),
      nombre: conVariantes(claves),
      categoria: conVariantes(palabrasClave(producto.categoria)),
      totalPalabras: Math.max(1, claves.length),
    };
  });
  return { entradas, total: productos.length, origen, extraidoEn };
}

export type ResultadoBusqueda =
  | { tipo: "encontrado"; producto: ProductoCatalogo; alternativas: ProductoCatalogo[] }
  | { tipo: "ambiguo"; opciones: ProductoCatalogo[] }
  | { tipo: "ninguno" };

interface Candidato {
  entrada: EntradaIndice;
  puntaje: number;
  enNombre: number;
  /** Alguna palabra pedida coincide con el sustantivo principal del producto, o con su
   * nombre y su categoría a la vez ("pollo" en "Alas de Pollo", categoría Pollo) */
  conPrincipal: boolean;
}

/**
 * Busca el producto que mejor coincide con las palabras escritas.
 * Puntaje por palabra: sustantivo principal 3, resto del nombre 2, categoría 1. La primera
 * palabra pedida suele ser el tipo de producto: si es el sustantivo principal suma 1 más.
 * Desempate: disponible en la sucursal, nombre más específico (más palabras cubiertas) y más económico.
 */
export function buscarEnIndice(
  palabras: string[],
  indice: IndiceCatalogo,
  estaDisponible: (producto: ProductoCatalogo) => boolean = (producto) => producto.disponible !== false,
  maxAlternativas = 5,
): ResultadoBusqueda {
  if (palabras.length === 0) return { tipo: "ninguno" };
  const variantesPorPalabra = palabras.map(variantes);
  const candidatos: Candidato[] = [];

  for (const entrada of indice.entradas) {
    let puntaje = 0;
    let enNombre = 0;
    let conPrincipal = false;
    for (const [posicion, opciones] of variantesPorPalabra.entries()) {
      if (opciones.some((v) => entrada.principal.has(v))) {
        // Medio punto más si también nombra su categoría: "jamón" -> Jamones antes que Untables
        puntaje += (posicion === 0 ? 4 : 3) + (opciones.some((v) => entrada.categoria.has(v)) ? 0.5 : 0);
        enNombre++;
        conPrincipal = true;
      } else if (opciones.some((v) => entrada.nombre.has(v))) {
        puntaje += 2;
        enNombre++;
        if (opciones.some((v) => entrada.categoria.has(v))) conPrincipal = true;
      } else if (opciones.some((v) => entrada.categoria.has(v))) {
        puntaje += 1;
      }
    }
    if (puntaje > 0) candidatos.push({ entrada, puntaje, enNombre, conPrincipal });
  }
  if (candidatos.length === 0) return { tipo: "ninguno" };

  candidatos.sort(
    (a, b) =>
      Number(b.conPrincipal) - Number(a.conPrincipal) ||
      b.puntaje - a.puntaje ||
      Number(estaDisponible(b.entrada.producto)) - Number(estaDisponible(a.entrada.producto)) ||
      b.enNombre / b.entrada.totalPalabras - a.enNombre / a.entrada.totalPalabras ||
      a.entrada.producto.precioUsd - b.entrada.producto.precioUsd,
  );

  const [mejor] = candidatos;
  if (!mejor) return { tipo: "ninguno" };
  // Lo pedido no es el producto principal de ninguno ("huevos" solo aparece en "Pasta al huevo"):
  // mejor preguntar que adivinar
  // Excepción: una marca que cubre todo lo pedido dentro de una sola categoría ("7up" -> Refrescos)
  const marcaClara =
    mejor.enNombre === palabras.length &&
    candidatos
      .filter((c) => c.puntaje === mejor.puntaje)
      .every((c) => c.entrada.producto.categoria === mejor.entrada.producto.categoria);
  // Coincidencia parcial y débil ("i want rice" -> "Vainilla Bean"): mejor decir que no se encontró
  if (!mejor.conPrincipal && mejor.enNombre < palabras.length) return { tipo: "ninguno" };
  if (!mejor.conPrincipal && !marcaClara) {
    return { tipo: "ambiguo", opciones: candidatos.slice(0, 3).map((c) => c.entrada.producto) };
  }
  const alternativas = candidatos
    .slice(1)
    .filter((c) => c.puntaje === mejor.puntaje)
    .slice(0, maxAlternativas)
    .map((c) => c.entrada.producto);
  return { tipo: "encontrado", producto: mejor.entrada.producto, alternativas };
}
