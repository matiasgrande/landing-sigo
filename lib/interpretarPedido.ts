import type { ProductoCatalogo } from "@/datos/catalogo";
import { buscarEnIndice, normalizarParaBuscar, type IndiceCatalogo } from "@/lib/indiceCatalogo";

export interface LineaPedido {
  producto: ProductoCatalogo;
  cantidad: number;
  /** Otras opciones igual de válidas (marca o presentación), para "Cambiar" en el carrito */
  alternativas?: ProductoCatalogo[];
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

/** Peso pedido en gramos ("2 kg", "medio kilo", "500 gr"); null si no se pidió por peso */
export function pesoPedidoEnGramos(fragmento: string): number | null {
  const kilos = /\b(\d+(?:\.\d+)?|[a-z]+)?\s*(?:kg|kgs|kilos?)\b/.exec(fragmento);
  if (kilos) {
    const valor = kilos[1];
    const numero = valor === undefined ? 1 : /^\d/.test(valor) ? Number(valor) : NUMEROS_EN_TEXTO[valor] ?? 1;
    return Number.isFinite(numero) && numero > 0 ? numero * 1000 : null;
  }
  const gramos = UNIDADES_GRAMOS.exec(fragmento);
  return gramos?.[1] ? Number(gramos[1]) : null;
}

/** Peso del paquete según su nombre: "Carne Molida 400 Gr" -> 400; "Arroz 1 Kg" -> 1000 */
export function pesoDelPaqueteEnGramos(nombre: string): number | null {
  const medida = /(\d+(?:[.,]\d+)?)\s*(kgs?|k|grs?|g)\b/i.exec(nombre);
  if (!medida?.[1] || !medida[2]) return null;
  const valor = Number(medida[1].replace(",", "."));
  if (!Number.isFinite(valor) || valor <= 0) return null;
  return medida[2].toLowerCase().startsWith("k") ? valor * 1000 : valor;
}

/** Formas venezolanas de pedir que no coinciden con el nombre del catálogo */
const SINONIMOS: [RegExp, string][] = [
  [/\bharinas? (?:pan|p a n|p\.a\.n\.?)\b/g, "harina maiz"],
  [/\bpasta dental\b/g, "crema dental"],
  [/\bpapel (?:toilet|tualet|de bano)\b/g, "papel higienico"],
  [/\bgaseosas?\b/g, "refresco"],
  [/\bcaraotas? negras?\b/g, "caraota negra"],
];

function aplicarSinonimos(fragmento: string): string {
  return SINONIMOS.reduce((texto, [patron, reemplazo]) => texto.replace(patron, reemplazo), fragmento);
}

/** Unidades de un multipack según su nombre: "Cerveza Polar (36 Unidades)" -> 36 */
export function unidadesDelPack(nombre: string): number | null {
  const pack = /(\d+)\s*(?:unidades|und|unds|unid|pack|uds)\b/i.exec(nombre);
  const unidades = pack?.[1] ? Number(pack[1]) : null;
  return unidades && unidades > 1 ? unidades : null;
}

/** Palabras del fragmento que describen el producto (sin cantidades ni relleno) */
function palabrasDelFragmento(fragmento: string): string[] {
  return normalizarParaBuscar(
    fragmento
      .split(/\s+/)
      .filter((p) => p.length > 0 && !PALABRAS_VACIAS.has(p) && !/^\d/.test(p) && !(p in NUMEROS_EN_TEXTO))
      .join(" "),
  )
    .split(/\s+/)
    .filter((p) => p.length > 1);
}

/** Recorta textos largos para repetirlos en el chat */
function recortar(texto: string, maximo = 40): string {
  return texto.length > maximo ? `${texto.slice(0, maximo)}…` : texto;
}

/**
 * Convierte una lista escrita en lenguaje natural en líneas de carrito.
 * Ej.: "2 harinas pan, medio kilo de queso y una docena de huevos"
 */
export function interpretarPedido(texto: string, indice: IndiceCatalogo): ResultadoInterpretacion {
  const fragmentos = unirMedios(normalizarTexto(texto.slice(0, MAXIMO_CARACTERES)))
    .split(/[,;:\n+]+|\s+y\s+|\s+tambien\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const acumulado = new Map<string, LineaPedido>();
  const noEncontrados: string[] = [];
  const avisos: string[] = [];

  for (const fragmento of fragmentos) {
    const busqueda = buscarEnIndice(palabrasDelFragmento(aplicarSinonimos(fragmento)), indice);
    if (busqueda.tipo === "ninguno") {
      noEncontrados.push(recortar(fragmento));
      continue;
    }
    if (busqueda.tipo === "ambiguo") {
      const opciones = busqueda.opciones.map((p) => p.nombre).join(" o ");
      avisos.push(`Con "${recortar(fragmento)}", ¿te refieres a ${opciones}? Escríbelo más específico.`);
      continue;
    }
    let { producto, alternativas } = busqueda;
    let cantidad = extraerCantidad(fragmento, producto);
    // "6 cervezas" no son 6 cajas de 36: si se piden varias unidades y el elegido es un multipack,
    // se prefiere una alternativa individual; si no la hay, se calcula cuántos packs hacen falta
    const unidadesPack = unidadesDelPack(producto.nombre);
    const pidePack = /\b(caja|cajas|pack|packs|bulto|bultos|paca|pacas)\b/.test(fragmento);
    if (cantidad.tipo === "valida" && cantidad.valor > 1 && unidadesPack && !pidePack) {
      const individual = alternativas.find((a) => !unidadesDelPack(a.nombre) && a.disponible !== false);
      if (individual) {
        alternativas = [producto, ...alternativas.filter((a) => a.id !== individual.id)];
        producto = individual;
      } else if (cantidad.valor >= unidadesPack) {
        // Solo se vende en packs (p. ej. papel higiénico): "2 papel" son 2 paquetes, pero
        // "48 cervezas" con cajas de 36 son 2 cajas
        const packs = Math.ceil(cantidad.valor / unidadesPack);
        avisos.push(`Para ${cantidad.valor} unidades agregué ${packs} × ${producto.nombre.replace(/\.$/, "")}.`);
        cantidad = { tipo: "valida", valor: packs, ajustada: false };
      }
    }
    // Pedido por peso de un producto que se vende en paquetes: "2 kg de carne" -> 5 paquetes de 400 g
    const pesoPedido = producto.unidad === "unidad" ? pesoPedidoEnGramos(fragmento) : null;
    const pesoPaquete = pesoPedido ? pesoDelPaqueteEnGramos(producto.nombre) : null;
    if (cantidad.tipo === "valida" && pesoPedido && pesoPaquete && pesoPedido !== pesoPaquete) {
      const paquetes = Math.max(1, Math.round(pesoPedido / pesoPaquete));
      const ajustada = paquetes > MAXIMO_UNIDADES;
      cantidad = { tipo: "valida", valor: Math.min(paquetes, MAXIMO_UNIDADES), ajustada };
      const pedido = pesoPedido >= 1000 ? `${(pesoPedido / 1000).toLocaleString("es-VE")} kg` : `${pesoPedido} g`;
      avisos.push(`Para ${pedido} de ${producto.nombre.split(/\s\d/)[0]} agregué ${cantidad.valor} paquete${cantidad.valor === 1 ? "" : "s"}.`);
    }
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
    acumulado.set(producto.id, {
      producto,
      cantidad: Math.min(suma, maximo),
      ...(alternativas.length > 0 && { alternativas }),
    });
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
