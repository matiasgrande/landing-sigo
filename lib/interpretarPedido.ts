import { CATALOGO_DEMO, type ProductoCatalogo } from "@/datos/catalogo";

export interface LineaPedido {
  producto: ProductoCatalogo;
  cantidad: number;
}

export interface ResultadoInterpretacion {
  lineas: LineaPedido[];
  noEncontrados: string[];
}

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
  "unidad", "unidades", "und", "porfa", "pls",
]);

const UNIDADES_GRAMOS = /\b(\d+(?:\.\d+)?)\s*(g|gr|grs|gramos?)\b/;

/** Minúsculas, sin acentos ni signos, ñ -> n */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/,(?=\d)/g, ".")
    .replace(/[^a-z0-9.\/\s,;+\n]/g, " ");
}

/** Variantes singulares simples: "tomates" -> "tomate", "limones" -> "limon" */
function variantes(palabra: string): string[] {
  const resultado = [palabra];
  if (palabra.length > 3 && palabra.endsWith("es")) resultado.push(palabra.slice(0, -2));
  if (palabra.length > 2 && palabra.endsWith("s")) resultado.push(palabra.slice(0, -1));
  return resultado;
}

function extraerCantidad(fragmento: string, producto: ProductoCatalogo): number {
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

  if (cantidad === null || !Number.isFinite(cantidad) || cantidad <= 0) cantidad = 1;

  if (producto.unidad === "kg") {
    // Pasos de 250 g, mínimo 250 g
    return Math.max(0.25, Math.round(cantidad * 4) / 4);
  }
  return Math.max(1, Math.round(cantidad));
}

function buscarProducto(fragmento: string): ProductoCatalogo | null {
  const palabras = fragmento
    .split(/\s+/)
    .filter((p) => p.length > 0 && !PALABRAS_VACIAS.has(p) && !/^\d/.test(p) && !(p in NUMEROS_EN_TEXTO));
  if (palabras.length === 0) return null;

  let mejor: ProductoCatalogo | null = null;
  let mejorPuntaje = 0;

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
    }
  }
  return mejor;
}

/**
 * Convierte una lista escrita en lenguaje natural en líneas de carrito.
 * Ej.: "2 harinas pan, medio kilo de queso y una docena de huevos"
 */
export function interpretarPedido(texto: string): ResultadoInterpretacion {
  const fragmentos = normalizarTexto(texto)
    .split(/[,;\n+]+|\s+y\s+|\s+tambien\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const acumulado = new Map<string, LineaPedido>();
  const noEncontrados: string[] = [];

  for (const fragmento of fragmentos) {
    const producto = buscarProducto(fragmento);
    if (!producto) {
      noEncontrados.push(fragmento);
      continue;
    }
    const cantidad = extraerCantidad(fragmento, producto);
    const existente = acumulado.get(producto.id);
    acumulado.set(producto.id, {
      producto,
      cantidad: existente ? existente.cantidad + cantidad : cantidad,
    });
  }

  return { lineas: [...acumulado.values()], noEncontrados };
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
