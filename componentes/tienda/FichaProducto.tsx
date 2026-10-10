"use client";

import { useMemo } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { ControlCantidad, Dialogo, ImagenProducto, Precio } from "@/componentes/tienda/Basicos";
import { SUCURSALES_TIENDA, ahorroEn, disponibleEn, nombreLegible, precioEn, precioPorUnidad, precioRegularEn, type ClaveSucursal } from "@/lib/tienda/comercio";
import { formatearUsd } from "@/lib/useTasaBcv";

export function FichaProducto() {
  const { ruta, porId, navegar, sucursal, indice } = useTienda();
  const producto = ruta.producto ? porId.get(ruta.producto) : undefined;

  // Similares: misma categoría, disponibles primero, precio parecido
  const similares = useMemo(() => {
    if (!producto || !indice) return [];
    const precio = precioEn(producto, sucursal);
    return indice.entradas
      .map((e) => e.producto)
      .filter((p) => p.id !== producto.id && p.categoria === producto.categoria && disponibleEn(p, sucursal))
      .sort((a, b) => Math.abs(precioEn(a, sucursal) - precio) - Math.abs(precioEn(b, sucursal) - precio))
      .slice(0, 6);
  }, [producto, indice, sucursal]);

  // Si la ficha se abrió con su propia entrada de historial, cerrarla es volver atrás (sin entradas fantasma)
  const cerrar = () => {
    const estado: unknown = window.history.state;
    if (typeof estado === "object" && estado !== null && "ficha" in estado) window.history.back();
    else navegar({ producto: null }, { reemplazar: true });
  };

  return (
    <Dialogo abierto={Boolean(producto)} alCerrar={cerrar} titulo={producto?.nombre ?? "Producto"} ancho="max-w-3xl" claveContenido={producto?.id}>
      {producto && (
        <div className="p-5">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <ImagenProducto producto={producto} className="aspect-square w-full rounded-3xl bg-white ring-1 ring-azul/5" />
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold text-verde">
                {nombreLegible(producto.departamento ?? "")} › {nombreLegible(producto.categoria)}
              </p>
              <div>
                {ahorroEn(producto, sucursal) > 0 && (
                  <p className="mb-1 inline-block rounded-full bg-coral-700 px-3 py-1 text-xs font-extrabold text-white">
                    Promoción -{producto.descuentoPorcentaje}%
                  </p>
                )}
                <Precio
                  usd={precioEn(producto, sucursal)}
                  grande
                  anterior={ahorroEn(producto, sucursal) > 0 ? precioRegularEn(producto, sucursal) : undefined}
                />
                {precioPorUnidad(producto, sucursal) && <p className="text-sm text-gris">{precioPorUnidad(producto, sucursal)}</p>}
              </div>
              <ControlCantidad producto={producto} disponible={disponibleEn(producto, sucursal)} />

              {/* Precio y existencia por tienda */}
              <div className="rounded-2xl bg-crema p-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-gris">En cada tienda</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {(Object.keys(SUCURSALES_TIENDA) as ClaveSucursal[]).map((clave) => (
                    <li key={clave} className="flex items-center justify-between gap-2">
                      <span className={`font-bold ${clave === sucursal ? "text-azul" : "text-tinta"}`}>
                        {SUCURSALES_TIENDA[clave].corto}
                        {clave === sucursal && <span className="font-semibold text-gris"> (te atiende)</span>}
                      </span>
                      <span className="text-right">
                        <span className="font-bold">{formatearUsd(precioEn(producto, clave))}</span>
                        <span className={`ml-2 text-xs font-bold ${disponibleEn(producto, clave) ? "text-verde" : "text-gris"}`}>
                          {disponibleEn(producto, clave) ? "Disponible" : "Sin existencia"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {producto.ruta && (
                <a href={producto.ruta} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-azul underline">
                  Ver en la tienda actual de sigo.com.ve
                </a>
              )}
            </div>
          </div>

          {similares.length > 0 && (
            <div className="mt-6">
              <h3 className="font-black text-azul">Similares disponibles</h3>
              <ul className="sin-barra -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
                {similares.map((s) => (
                  <li key={s.id} className="w-36 shrink-0">
                    <button type="button" onClick={() => navegar({ producto: s.id }, { reemplazar: true })} className="block w-full text-left">
                      <ImagenProducto producto={s} className="aspect-square w-full rounded-2xl bg-white ring-1 ring-azul/5" />
                      <span className="mt-1 line-clamp-2 text-xs font-bold">{s.nombre}</span>
                      <span className="text-sm font-black text-azul">{formatearUsd(precioEn(s, sucursal))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Dialogo>
  );
}
