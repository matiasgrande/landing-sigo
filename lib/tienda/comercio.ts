import type { ProductoCatalogo } from "@/datos/catalogo";
import { TARIFAS_MUNICIPIO } from "@/datos/entregas";

export type ClaveSucursal = "costazul" | "sambil";

/** localStorage del carrito de la tienda; el asistente de la landing también escribe aquí */
export const CLAVE_CARRITO = "sigo:carrito-tienda";

export const SUCURSALES_TIENDA: Record<ClaveSucursal, { nombre: string; corto: string }> = {
  costazul: { nombre: "Sigo Supermarket Costazul", corto: "Costazul" },
  sambil: { nombre: "Sigo Supermarket Sambil", corto: "Sambil" },
};

export type ModoEntrega = "delivery" | "retiro";

export interface Entrega {
  modo: ModoEntrega;
  /** Municipio de destino (solo delivery) */
  municipio: string | null;
  sucursal: ClaveSucursal;
}

export const ENTREGA_INICIAL: Entrega = { modo: "delivery", municipio: null, sucursal: "costazul" };

/** Valores del prototipo: referenciales, a confirmar con SIGO */
export const MINIMO_COMPRA_USD = 10;
export const TASA_IGTF = 0.03;
/** Tope de unidades por producto en el carrito */
export const MAXIMO_POR_PRODUCTO = 99;

/** USD -> céntimos enteros, para sumar y redondear sin errores de coma flotante */
export function aCentimos(usd: number): number {
  return Math.round(usd * 100);
}

/** IGTF sobre una base en USD, redondeado al céntimo (18,50 -> 0,56) */
export function calcularIgtf(baseUsd: number): number {
  return Math.round((aCentimos(baseUsd) * Math.round(TASA_IGTF * 100)) / 100) / 100;
}

export function esMunicipioValido(municipio: unknown): municipio is string {
  return typeof municipio === "string" && TARIFAS_MUNICIPIO.some((t) => t.municipio === municipio);
}

/** Precio del producto en la sucursal que atiende el pedido */
export function precioEn(producto: ProductoCatalogo, sucursal: ClaveSucursal): number {
  return sucursal === "sambil" && producto.precioSambilUsd ? producto.precioSambilUsd : producto.precioUsd;
}

export function disponibleEn(producto: ProductoCatalogo, sucursal: ClaveSucursal): boolean {
  if (!producto.disponibleEn) return producto.disponible !== false;
  return producto.disponibleEn[sucursal];
}

export function tarifaDelivery(entrega: Entrega): number | null {
  if (entrega.modo === "retiro") return 0;
  if (!entrega.municipio) return null;
  return TARIFAS_MUNICIPIO.find((t) => t.municipio === entrega.municipio)?.tarifaUsd ?? null;
}

/** Contenido del envase según su nombre: "Aceite 1 L." -> { cantidad: 1, unidad: "L" } */
export function contenidoDe(nombre: string): { cantidad: number; unidad: "kg" | "L" } | null {
  const medida = /(\d+(?:[.,]\d+)?)\s*(kgs?|k|grs?|g|ml|lts?|l|cc)\b/i.exec(nombre);
  if (!medida?.[1] || !medida[2]) return null;
  const valor = Number(medida[1].replace(",", "."));
  if (!Number.isFinite(valor) || valor <= 0) return null;
  const unidad = medida[2].toLowerCase();
  if (unidad.startsWith("k")) return { cantidad: valor, unidad: "kg" };
  if (unidad.startsWith("g")) return { cantidad: valor / 1000, unidad: "kg" };
  if (unidad === "ml" || unidad === "cc") return { cantidad: valor / 1000, unidad: "L" };
  return { cantidad: valor, unidad: "L" };
}

/** Precio por kg o por litro, para comparar presentaciones ("$2.40 /kg") */
export function precioPorUnidad(producto: ProductoCatalogo, sucursal: ClaveSucursal): string | null {
  const contenido = contenidoDe(producto.nombre);
  // En farmacia "1G" es la dosis, no el contenido; y envases mínimos dan precios por kg sin sentido
  const esFarmacia = /farmacia|salud|medic/i.test(`${producto.departamento ?? ""} ${producto.categoria}`);
  if (!contenido || contenido.cantidad === 1 || contenido.cantidad < 0.01 || esFarmacia) return null;
  const valor = precioEn(producto, sucursal) / contenido.cantidad;
  if (!Number.isFinite(valor)) return null;
  return `$${valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /${contenido.unidad}`;
}

/** "VÍVERES" -> "Víveres"; respeta siglas y nombres ya capitalizados */
export function nombreLegible(texto: string): string {
  if (texto !== texto.toUpperCase()) return texto;
  const menores = new Set(["y", "de", "del", "la", "el", "en"]);
  return texto
    .toLowerCase()
    .split(" ")
    .map((palabra, i) => (i > 0 && menores.has(palabra) ? palabra : palabra.charAt(0).toUpperCase() + palabra.slice(1)))
    .join(" ");
}

/** Identificador para la URL: "Frutas y Vegetales" -> "frutas-y-vegetales" */
export function aSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
