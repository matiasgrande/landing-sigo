"use client";

import type { ProductoCatalogo } from "@/datos/catalogo";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { ControlCantidad, ImagenProducto, Precio } from "@/componentes/tienda/Basicos";
import { SUCURSALES_TIENDA, disponibleEn, precioEn, precioPorUnidad } from "@/lib/tienda/comercio";

export function TarjetaProducto({ producto }: { producto: ProductoCatalogo }) {
  const { sucursal, navegar } = useTienda();
  const precio = precioEn(producto, sucursal);
  const disponible = disponibleEn(producto, sucursal);
  const porUnidad = precioPorUnidad(producto, sucursal);
  const enOferta = producto.precioAnteriorUsd !== undefined && producto.precioAnteriorUsd > precio;

  return (
    <article className="flex min-w-0 flex-col rounded-3xl bg-white p-3 ring-1 ring-azul/5 transition hover:shadow-lg hover:shadow-azul/5 sm:p-4">
      <button
        type="button"
        onClick={() => navegar({ producto: producto.id })}
        className="group relative block text-left"
        aria-label={`Ver detalles de ${producto.nombre}`}
      >
        <ImagenProducto producto={producto} className="aspect-square w-full rounded-2xl bg-white" />
        {enOferta && (
          <span className="absolute left-1 top-1 rounded-full bg-coral-700 px-2 py-0.5 text-xs font-extrabold text-white">
            Ahorra ${((producto.precioAnteriorUsd ?? 0) - precio).toFixed(2)}
          </span>
        )}
        {!disponible && (
          <span className="absolute inset-x-1 bottom-1 rounded-full bg-white/95 px-2 py-1 text-center text-xs font-bold text-gris shadow-sm">
            Sin existencia en {SUCURSALES_TIENDA[sucursal].corto}
          </span>
        )}
      </button>
      <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-tinta">
        <button type="button" onClick={() => navegar({ producto: producto.id })} className="text-left hover:underline">
          {producto.nombre}
        </button>
      </h3>
      <div className="mt-2 flex flex-1 flex-col justify-end gap-2">
        <div>
          <Precio usd={precio} anterior={enOferta ? producto.precioAnteriorUsd : undefined} />
          {porUnidad && <p className="text-xs text-gris">{porUnidad}</p>}
        </div>
        <ControlCantidad producto={producto} disponible={disponible} compacto />
      </div>
    </article>
  );
}

/** Rejilla de 2 columnas en móvil, hasta 5 en escritorio ancho */
export function RejillaProductos({ productos }: { productos: ProductoCatalogo[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {productos.map((producto) => (
        <li key={producto.id} className="flex min-w-0">
          <TarjetaProducto producto={producto} />
        </li>
      ))}
    </ul>
  );
}

/** Esqueleto mientras carga el catálogo */
export function RejillaCargando({ cantidad = 10 }: { cantidad?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" aria-hidden>
      {Array.from({ length: cantidad }, (_, i) => (
        <li key={i} className="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-azul/5" />
      ))}
    </ul>
  );
}
