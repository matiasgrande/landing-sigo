import { esObjeto, guardarAlmacen, leerAlmacen } from "@/lib/tienda/almacen";
import type { ClaveSucursal, ModoEntrega } from "@/lib/tienda/comercio";

/** Pedido confirmado, guardado en el dispositivo para "Comprar de nuevo" */
export interface PedidoGuardado {
  numero: string;
  /** ISO 8601 */
  fecha: string;
  sucursal: ClaveSucursal;
  modo: ModoEntrega;
  lineas: { id: string; cantidad: number; nombre: string }[];
  total: number;
  /** Nombre de quien recibe, si fue una compra para otra persona */
  paraOtro?: string;
}

export const CLAVE_PEDIDOS = "sigo:pedidos";
const MAXIMO_PEDIDOS = 20;

const esPedido = (v: unknown): v is PedidoGuardado =>
  esObjeto(v) &&
  typeof v.numero === "string" &&
  typeof v.fecha === "string" &&
  typeof v.total === "number" &&
  Array.isArray(v.lineas) &&
  v.lineas.every((l) => esObjeto(l) && typeof l.id === "string" && typeof l.cantidad === "number" && typeof l.nombre === "string");

export function leerPedidos(): PedidoGuardado[] {
  const valor = leerAlmacen<unknown>(CLAVE_PEDIDOS, [], (v): v is unknown => true);
  return Array.isArray(valor) ? valor.filter(esPedido) : [];
}

export function guardarPedido(pedido: PedidoGuardado): PedidoGuardado[] {
  const pedidos = [pedido, ...leerPedidos().filter((p) => p.numero !== pedido.numero)].slice(0, MAXIMO_PEDIDOS);
  guardarAlmacen(CLAVE_PEDIDOS, pedidos);
  return pedidos;
}

/** Días completos desde una fecha ISO */
export function diasDesde(fecha: string, ahora = Date.now()): number {
  return Math.floor((ahora - new Date(fecha).getTime()) / 86_400_000);
}
