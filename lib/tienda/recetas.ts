import type { ProductoCatalogo } from "@/datos/catalogo";
import type { Ingrediente, Receta } from "@/datos/temporadas";
import type { IndiceCatalogo } from "@/lib/indiceCatalogo";
import { interpretarPedido } from "@/lib/interpretarPedido";

export interface IngredienteResuelto {
  ingrediente: Ingrediente;
  /** Cantidad escalada a las porciones pedidas */
  cantidad: number;
  producto: ProductoCatalogo | null;
  /** Unidades del producto que se agregan al carrito */
  unidades: number;
}

/** Escala una cantidad: unidades enteras hacia arriba; kg y litros en pasos de 1/4; gramos de 50 en 50 */
export function escalar(ingrediente: Ingrediente, factor: number): number {
  const valor = ingrediente.cantidad * factor;
  if (ingrediente.unidad === "und") return Math.max(1, Math.ceil(valor - 0.001));
  if (ingrediente.unidad === "g") return Math.max(50, Math.round(valor / 50) * 50);
  return Math.max(0.25, Math.round(valor * 4) / 4);
}

export function textoCantidad(cantidad: number, unidad: Ingrediente["unidad"]): string {
  const numero = cantidad.toLocaleString("es-VE");
  return unidad === "und" ? numero : unidad === "g" ? `${numero} g` : unidad === "kg" ? `${numero} kg` : `${numero} L`;
}

/** Cada ingrediente pasa por el mismo intérprete que la lista escrita (peso a paquetes, litros, packs) */
export function resolverReceta(
  receta: Receta,
  porciones: number,
  indice: IndiceCatalogo,
  estaDisponible: (producto: ProductoCatalogo) => boolean,
): IngredienteResuelto[] {
  const factor = porciones / receta.porciones;
  return receta.ingredientes.map((ingrediente) => {
    const cantidad = escalar(ingrediente, factor);
    if (ingrediente.enLinea === false) return { ingrediente, cantidad, producto: null, unidades: 0 };
    const texto =
      ingrediente.unidad === "und"
        ? `${cantidad} ${ingrediente.consulta}`
        : ingrediente.unidad === "g"
          ? `${cantidad} g de ${ingrediente.consulta}`
          : ingrediente.unidad === "kg"
            ? `${cantidad} kg de ${ingrediente.consulta}`
            : `${cantidad} litros de ${ingrediente.consulta}`;
    const [linea] = interpretarPedido(texto, indice, estaDisponible).lineas;
    return linea && estaDisponible(linea.producto)
      ? { ingrediente, cantidad, producto: linea.producto, unidades: linea.cantidad }
      : { ingrediente, cantidad, producto: null, unidades: 0 };
  });
}
