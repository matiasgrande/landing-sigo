import { CATALOGO_DEMO, type ProductoCatalogo } from "@/datos/catalogo";

export interface LineaPedido {
  producto: ProductoCatalogo;
  cantidad: number;
}

export interface ResultadoInterpretacion {
  lineas: LineaPedido[];
  noEncontrados: string[];
  /** Ajustes o dudas que el asistente debe comunicar (topes, cantidades inválidas, ambigüedades) */
  avisos: string[];
}

/** Topes razonables para una compra de supermercado */
export const MAXIMO_UNIDADES = 99;
export const MAXIMO_KG = 50;
/** Longitud máxima del texto que se interpreta */
export const MAXIMO_CARACTERES = 500;

const NUMEROS_EN_TEXTO: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7,
  ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, quince: 15, veinte: 20,
  medio: 0.5, media: 0.5, par: 2,
};

const PALABRAS_VACIAS = new Set([
  "de", "del", "la", "el", "los", "las", "lo", "para", "con", "mi", "me", "y", "o", "a", "en",
  "quiero", "necesito", "comprar", "dame", "ponme", "agrega", "agregame", "anade", "por", "favor",
  "mas", "tambien", "unos", "unas", "algo", "kilo", "kilos", "kg", "k", "gr", "grs", "g", "gramo",
  "gramos", "litro", "litros", "lt", "l", "paquete", "paquetes", "bolsa", "bolsas", "lata", "latas",
  "unidad", "unidades", "und", "porfa", "pls", "menos",
]);

const UNIDADES_GRAMOS = /\b(\d+(?:\.\d+)?)\s*(g|gr|grs|gramos?)\b/;

/** Minúsculas, sin acentos ni signos, ñ -> n */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/,(?=\d)/g, ".")
    // Un "-" delante de un número se conserva como "menos" para detectar cantidades negativas
    .replace(/(^|[\s,;])-\s*(?=\d)/g, "$1menos ")
    .replace(/[^a-z0-9.\/\s,;+\n]/g, " ");
}

/** "dos y medio" -> "2.5", "kilo y medio" -> "1.5 kilo" (antes de separar por " y ") */
function unirMedios(texto: string): string {
  const sumarMedio = (completo: string, valor: string, unidad = ""): string => {
    const numero = /^\d/.test(valor) ? Number(valor) : NUMEROS_EN_TEXTO[valor];
    if (numero === undefined || !Number.isFinite(numero)) return completo;
    return `${numero + 0.5}${unidad ? ` ${unidad}` : ""}`;
  };
  return texto
    .replace(/\b(\d+(?:\.\d+)?|[a-z]+)\s+(kilos?|kg)\s+y\s+medio\b/g, (c: string, v: string, u: string) => sumarMedio(c, v, u))
    .replace(/(^|[\s,;])(kilos?|kg)\s+y\s+medio\b/g, "$11.5 $2")
    .replace(/\b(\d+(?:\.\d+)?|[a-z]+)\s+y\s+medi[oa]\b/g, (c: string, v: string) => sumarMedio(c, v));
}

/** Variantes singulares simples: "tomates" -> "tomate", "limones" -> "limon" */
function variantes(palabra: string): string[] {
  const resultado = [palabra];
  if (palabra.length > 3 && palabra.endsWith("es")) resultado.push(palabra.slice(0, -2));
  if (palabra.length > 2 && palabra.endsWith("s")) resultado.push(palabra.slice(0, -1));
  return resultado;
}

type Cantidad = { tipo: "valida"; valor: number; ajustada: boolean } | { tipo: "invalida" };

function extraerCantidad(fragmento: string, producto: ProductoCatalogo): Cantidad {
  if (/\bmenos\s+\d/.test(fragmento)) return { tipo: "invalida" };
  let cantidad: number | null = null;

  const gramos = UNIDADES_GRAMOS.exec(fragmento);
  if (gramos?.[1] && producto.unidad === "kg") {
    cantidad = Number(gramos[1]) / 1000;
  } else {
    const fraccion = /\b(\d+)\/(\d+)\b/.exec(fragmento);
    const numero = /\b(\d+(?:\.\d+)?)\b/.exec(fragmento);
    if (fraccion?.[1] && fraccion[2] && Number(fraccion[2]) !== 0) {
      cantidad = Number(fraccion[1]) / Number(fraccion[2]);
    } else if (numero?.[1]) {
      cantidad = Number(numero[1]);
    } else if (/\bpar\b/.test(fragmento)) {
      cantidad = 2;
    } else {
      const palabra = fragmento.split(/\s+/).find((p) => p in NUMEROS_EN_TEXTO);
      if (palabra) cantidad = NUMEROS_EN_TEXTO[palabra] ?? null;
    }
  }

  // Sin número explícito se asume 1; un 0 escrito es una cantidad inválida
  if (cantidad === null) cantidad = 1;
  if (!Number.isFinite(cantidad) || cantidad <= 0) return { tipo: "invalida" };

  const maximo = producto.unidad === "kg" ? MAXIMO_KG : MAXIMO_UNIDADES;
  const ajustada = cantidad > maximo;
  if (ajustada) cantidad = maximo;

  if (producto.unidad === "kg") {
    // Pasos de 250 g, mínimo 250 g
    return { tipo: "valida", valor: Math.max(0.25, Math.round(cantidad * 4) / 4), ajustada };
  }
  return { tipo: "valida", valor: Math.max(1, Math.round(cantidad)), ajustada };
}

type Busqueda =
  | { tipo: "encontrado"; producto: ProductoCatalogo }
  | { tipo: "ambiguo"; opciones: ProductoCatalogo[] }
  | { tipo: "ninguno" };

function buscarProducto(fragmento: string): Busqueda {
  const palabras = fragmento
    .split(/\s+/)
    .filter((p) => p.length > 0 && !PALABRAS_VACIAS.has(p) && !/^\d/.test(p) && !(p in NUMEROS_EN_TEXTO));
  if (palabras.length === 0) return { tipo: "ninguno" };

  let mejor: ProductoCatalogo | null = null;
  let mejorPuntaje = 0;
  let empatados: ProductoCatalogo[] = [];

  for (const producto of CATALOGO_DEMO) {
    let puntaje = 0;
    for (const palabra of palabras) {
      const coincide = variantes(palabra).find((v) => producto.claves.includes(v));
      if (!coincide) continue;
      // La primera clave es el sustantivo principal y pesa el doble
      puntaje += producto.claves[0] === coincide ? 2 : 1;
    }
    if (puntaje > mejorPuntaje) {
      mejor = producto;
      mejorPuntaje = puntaje;
      empatados = [producto];
    } else if (puntaje > 0 && puntaje === mejorPuntaje) {
      empatados.push(producto);
    }
  }
  if (!mejor) return { tipo: "ninguno" };
  // Solo coincidió una palabra secundaria en productos distintos (p. ej. "soda"): hay que preguntar
  const nombres = new Set(empatados.map((p) => p.nombre));
  if (mejorPuntaje < 2 && nombres.size > 1) return { tipo: "ambiguo", opciones: empatados };
  return { tipo: "encontrado", producto: mejor };
}

/** Recorta textos largos para repetirlos en el chat */
function recortar(texto: string, maximo = 40): string {
  return texto.length > maximo ? `${texto.slice(0, maximo)}…` : texto;
}

/**
 * Convierte una lista escrita en lenguaje natural en líneas de carrito.
 * Ej.: "2 harinas pan, medio kilo de queso y una docena de huevos"
 */
export function interpretarPedido(texto: string): ResultadoInterpretacion {
  const fragmentos = unirMedios(normalizarTexto(texto.slice(0, MAXIMO_CARACTERES)))
    .split(/[,;\n+]+|\s+y\s+|\s+tambien\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const acumulado = new Map<string, LineaPedido>();
  const noEncontrados: string[] = [];
  const avisos: string[] = [];

  for (const fragmento of fragmentos) {
    const busqueda = buscarProducto(fragmento);
    if (busqueda.tipo === "ninguno") {
      noEncontrados.push(recortar(fragmento));
      continue;
    }
    if (busqueda.tipo === "ambiguo") {
      const opciones = busqueda.opciones.map((p) => p.nombre).join(" o ");
      avisos.push(`Con "${recortar(fragmento)}", ¿te refieres a ${opciones}? Escríbelo más específico.`);
      continue;
    }
    const { producto } = busqueda;
    const cantidad = extraerCantidad(fragmento, producto);
    if (cantidad.tipo === "invalida") {
      avisos.push(`¿Cuánto ${producto.nombre} quieres? La cantidad debe ser mayor que cero.`);
      continue;
    }
    const maximo = producto.unidad === "kg" ? MAXIMO_KG : MAXIMO_UNIDADES;
    const existente = acumulado.get(producto.id);
    const suma = (existente?.cantidad ?? 0) + cantidad.valor;
    if (cantidad.ajustada || suma > maximo) {
      avisos.push(`Ajusté ${producto.nombre} al máximo de ${maximo}${producto.unidad === "kg" ? " kg" : ""}.`);
    }
    acumulado.set(producto.id, { producto, cantidad: Math.min(suma, maximo) });
  }

  return { lineas: [...acumulado.values()], noEncontrados, avisos };
}

/** Tope por línea del carrito según su unidad */
export function maximoPara(producto: ProductoCatalogo): number {
  return producto.unidad === "kg" ? MAXIMO_KG : MAXIMO_UNIDADES;
}

export function formatearCantidad(linea: LineaPedido): string {
  if (linea.producto.unidad === "kg") {
    return linea.cantidad < 1 ? `${Math.round(linea.cantidad * 1000)} g` : `${linea.cantidad.toLocaleString("es-VE")} kg`;
  }
  return `${linea.cantidad}`;
}

export function calcularSubtotal(linea: LineaPedido): number {
  return Math.round(linea.producto.precioUsd * linea.cantidad * 100) / 100;
}
