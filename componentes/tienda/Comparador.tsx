"use client";

import { useMemo } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { SUCURSALES_TIENDA, aCentimos, disponibleEn, precioEn, type ClaveSucursal } from "@/lib/tienda/comercio";
import { formatearUsd } from "@/lib/useTasaBcv";
import { plural } from "@/componentes/tienda/CarritoLateral";

interface TotalSucursal {
  clave: ClaveSucursal;
  total: number;
  /** Productos del carrito que no tienen existencia ahí */
  faltantes: number;
}

/** El mismo carrito en cada sucursal: precio y existencias reales de Costazul y Sambil */
export function useComparacionSucursales(): TotalSucursal[] {
  const { lineas } = useTienda();
  return useMemo(
    () =>
      (Object.keys(SUCURSALES_TIENDA) as ClaveSucursal[]).map((clave) => {
        let centimos = 0;
        let faltantes = 0;
        for (const { producto, cantidad } of lineas) {
          if (disponibleEn(producto, clave)) centimos += aCentimos(precioEn(producto, clave) * cantidad);
          else faltantes++;
        }
        return { clave, total: centimos / 100, faltantes };
      }),
    [lineas],
  );
}

export function ComparadorSucursales({ compacto = false }: { compacto?: boolean }) {
  const { lineas, entrega, setEntrega, sucursal } = useTienda();
  const comparacion = useComparacionSucursales();
  if (lineas.length === 0) return null;

  const actual = comparacion.find((c) => c.clave === sucursal);
  const otra = comparacion.find((c) => c.clave !== sucursal);
  if (!actual || !otra) return null;
  const ahorro = (aCentimos(actual.total) - aCentimos(otra.total)) / 100;
  // Solo se recomienda cambiar si sale más barato sin dejar más productos por fuera
  const conviene = ahorro >= 0.01 && otra.faltantes <= actual.faltantes;

  return (
    <section aria-label="Tu carrito en cada tienda" className={`rounded-2xl bg-crema ${compacto ? "p-3" : "p-4"}`}>
      <p className="text-xs font-extrabold uppercase tracking-wider text-gris">Tu carrito en cada tienda</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {comparacion.map((c) => {
          const mejor = c.total <= Math.min(...comparacion.filter((x) => x.faltantes <= c.faltantes).map((x) => x.total));
          return (
            <li
              key={c.clave}
              className={`rounded-xl bg-white p-2.5 ring-1 ${c.clave === sucursal ? "ring-2 ring-azul" : "ring-azul/10"}`}
            >
              <p className="text-xs font-bold text-gris">
                {SUCURSALES_TIENDA[c.clave].corto}
                {c.clave === sucursal && " · te atiende"}
              </p>
              <p className={`text-lg font-black ${mejor && conviene && c.clave !== sucursal ? "text-verde" : "text-azul"}`}>{formatearUsd(c.total)}</p>
              <p className={`text-xs font-semibold ${c.faltantes > 0 ? "text-[#b4371c]" : "text-verde"}`}>
                {c.faltantes > 0 ? `${plural(c.faltantes, "producto")} sin existencia` : "Todo disponible"}
              </p>
            </li>
          );
        })}
      </ul>
      {conviene && (
        <button
          type="button"
          onClick={() => setEntrega({ ...entrega, sucursal: otra.clave })}
          className="mt-2 min-h-11 w-full rounded-full bg-verde px-4 text-sm font-extrabold text-white transition hover:bg-verde-700"
        >
          Ahorra {formatearUsd(ahorro)} pidiendo en {SUCURSALES_TIENDA[otra.clave].corto}
        </button>
      )}
    </section>
  );
}
