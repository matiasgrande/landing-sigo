import type { IndiceCatalogo } from "@/lib/indiceCatalogo";
import { buscarProductos } from "@/lib/tienda/buscar";
import { esObjeto, guardarAlmacen, leerAlmacen } from "@/lib/tienda/almacen";

/**
 * Promociones del prototipo. sigo.com.ve hoy no publica descuentos, así que SIGO las crea
 * desde el panel interno; mientras no haya ninguna guardada se muestran unas de ejemplo.
 */
export interface Promocion {
  /** Id del producto */
  id: string;
  /** Descuento en %, de 1 a 90 */
  descuento: number;
  /** Último día vigente (AAAA-MM-DD, hora de Margarita) */
  hasta: string;
  /** Creada automáticamente para la demostración */
  ejemplo?: boolean;
}

export const CLAVE_PROMOCIONES = "sigo:promociones";

/** Productos de uso diario con un descuento de demostración */
const SEMILLAS: { consulta: string; descuento: number }[] = [
  { consulta: "harina maiz pan", descuento: 10 },
  { consulta: "cafe", descuento: 15 },
  { consulta: "aceite", descuento: 10 },
  { consulta: "queso blanco", descuento: 12 },
  { consulta: "pasta", descuento: 10 },
  { consulta: "detergente", descuento: 20 },
  { consulta: "papel higienico", descuento: 15 },
  { consulta: "cerveza polar", descuento: 8 },
];

/** Hoy en Margarita, AAAA-MM-DD */
export function hoyEnMargarita(fecha = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas", year: "numeric", month: "2-digit", day: "2-digit" }).format(fecha);
}

function finDeMes(fecha = new Date()): string {
  const [anio, mes] = hoyEnMargarita(fecha).split("-").map(Number);
  const ultimo = new Date(Date.UTC(anio ?? 2026, mes ?? 1, 0));
  return ultimo.toISOString().slice(0, 10);
}

const esPromocion = (v: unknown): v is Promocion =>
  esObjeto(v) &&
  typeof v.id === "string" &&
  typeof v.descuento === "number" &&
  v.descuento >= 1 &&
  v.descuento <= 90 &&
  typeof v.hasta === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v.hasta);

/** null: nunca se guardaron promociones (se usan las de ejemplo) */
export function leerPromociones(): Promocion[] | null {
  const valor = leerAlmacen<unknown>(CLAVE_PROMOCIONES, null, (v): v is unknown => true);
  return Array.isArray(valor) ? valor.filter(esPromocion) : null;
}

export function guardarPromociones(promociones: Promocion[]): void {
  guardarAlmacen(CLAVE_PROMOCIONES, promociones);
}

/** Promociones de ejemplo resueltas contra el catálogo real (primer resultado disponible) */
export function promocionesDeEjemplo(indice: IndiceCatalogo): Promocion[] {
  const hasta = finDeMes();
  const vistos = new Set<string>();
  return SEMILLAS.flatMap(({ consulta, descuento }) => {
    const producto = buscarProductos(indice, consulta).productos.find((p) => p.disponible !== false && p.imagen && !vistos.has(p.id));
    if (!producto) return [];
    vistos.add(producto.id);
    return [{ id: producto.id, descuento, hasta, ejemplo: true }];
  });
}

export function promocionesVigentes(promociones: Promocion[], hoy = hoyEnMargarita()): Promocion[] {
  return promociones.filter((p) => p.hasta >= hoy);
}

/** Índice con el descuento aplicado a los productos en promoción (los demás se comparten tal cual) */
export function aplicarPromociones(indice: IndiceCatalogo, promociones: Promocion[]): IndiceCatalogo {
  if (promociones.length === 0) return indice;
  const porId = new Map(promociones.map((p) => [p.id, p.descuento]));
  return {
    ...indice,
    entradas: indice.entradas.map((entrada) => {
      const descuento = porId.get(entrada.producto.id);
      return descuento ? { ...entrada, producto: { ...entrada.producto, descuentoPorcentaje: descuento } } : entrada;
    }),
  };
}
