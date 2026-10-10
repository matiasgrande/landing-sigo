import { esObjeto, guardarAlmacen, leerAlmacen } from "@/lib/tienda/almacen";

/**
 * Registro de uso de la tienda para el panel interno. En el prototipo vive en este dispositivo;
 * en producción se enviaría a la analítica del e-commerce.
 */
export type Evento =
  | { tipo: "busqueda"; consulta: string; resultados: number; t: number }
  | { tipo: "agregar"; id: string; cantidad: number; t: number }
  | { tipo: "checkout"; t: number }
  | { tipo: "pedido"; numero: string; total: number; articulos: number; sucursal: string; paraOtro: boolean; t: number }
  | { tipo: "receta"; receta: string; t: number };

type SinTiempo<T> = T extends unknown ? Omit<T, "t"> : never;

export const CLAVE_EVENTOS = "sigo:eventos";
const MAXIMO_EVENTOS = 3000;

const esEvento = (v: unknown): v is Evento =>
  esObjeto(v) && typeof v.t === "number" && ["busqueda", "agregar", "checkout", "pedido", "receta"].includes(String(v.tipo));

export function leerEventos(): Evento[] {
  const valor = leerAlmacen<unknown>(CLAVE_EVENTOS, [], (v): v is unknown => true);
  return Array.isArray(valor) ? valor.filter(esEvento) : [];
}

export function registrarEvento(evento: SinTiempo<Evento>): void {
  const eventos = leerEventos();
  eventos.push({ ...evento, t: Date.now() } as Evento);
  guardarAlmacen(CLAVE_EVENTOS, eventos.slice(-MAXIMO_EVENTOS));
}

export function guardarEventos(eventos: Evento[]): void {
  guardarAlmacen(CLAVE_EVENTOS, eventos.slice(-MAXIMO_EVENTOS));
}
