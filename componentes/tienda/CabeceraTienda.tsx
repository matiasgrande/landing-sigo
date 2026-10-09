"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import logoSigo from "@/recursos/logo-sigo.png";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { Buscador } from "@/componentes/tienda/Buscador";
import { useTasa } from "@/componentes/ContextoTasa";
import { IconoCarrito, IconoUbicacion } from "@/componentes/Iconos";
import { formatearFechaTasa, formatearUsd } from "@/lib/useTasaBcv";
import { SUCURSALES_TIENDA, aSlug, disponibleEn, nombreLegible } from "@/lib/tienda/comercio";

/** Departamentos con al menos 3 productos con existencia en la sucursal, de mayor a menor */
export function useDepartamentos(): { nombre: string; slug: string; cantidad: number }[] {
  const { indice, sucursal } = useTienda();
  return useMemo(() => {
    const conteo = new Map<string, number>();
    indice?.entradas.forEach(({ producto }) => {
      if (!disponibleEn(producto, sucursal)) return;
      const nombre = producto.departamento ?? "Otros";
      conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
    });
    return [...conteo.entries()]
      .filter(([, cantidad]) => cantidad >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, cantidad]) => ({ nombre, slug: aSlug(nombre), cantidad }));
  }, [indice, sucursal]);
}

export function CabeceraTienda() {
  const { entrega, totalArticulos, subtotal, setCarritoAbierto, setSelectorEntregaAbierto, navegar, ruta } = useTienda();
  const { tasa } = useTasa();
  const departamentos = useDepartamentos();
  const fechaTasa = tasa ? formatearFechaTasa(tasa.fecha) : "";

  const textoEntrega =
    entrega.modo === "retiro"
      ? `Retiro en ${SUCURSALES_TIENDA[entrega.sucursal].corto}`
      : entrega.municipio
        ? `Delivery a ${entrega.municipio}`
        : "Elige dónde recibir";

  return (
    // Fija solo desde tablet: en móvil ocuparía casi media pantalla y la barra inferior ya da Buscar y Carrito
    <header className="relative z-40 bg-white shadow-sm md:sticky md:top-0 [@media(max-height:500px)]:static">
      {/* Franja: tasa BCV y aviso de prototipo */}
      <div className="bg-azul px-4 py-1.5 text-xs font-semibold text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <span className="truncate">
            {tasa
              ? `Tasa BCV ${fechaTasa ? `del ${fechaTasa}` : ""}: Bs. ${tasa.valor.toLocaleString("es-VE", { maximumFractionDigits: 2 })}`
              : "Precios en USD de referencia"}
          </span>
          <span className="shrink-0 rounded-full bg-sol px-2 py-0.5 font-extrabold text-azul">Prototipo</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="SIGO, volver a la página principal">
          <Image src={logoSigo} alt="SIGO" width={44} height={44} priority className="h-11 w-11" />
        </Link>

        <button
          type="button"
          onClick={() => setSelectorEntregaAbierto(true)}
          className="order-3 flex min-h-11 min-w-0 items-center gap-2 rounded-full px-2 text-left text-sm hover:bg-crema md:order-none"
        >
          <IconoUbicacion className="h-5 w-5 shrink-0 text-verde" />
          <span className="min-w-0">
            <span className="block truncate font-extrabold text-azul">{textoEntrega}</span>
            <span className="block truncate text-xs text-gris">
              Te atiende {SUCURSALES_TIENDA[entrega.sucursal].corto} · Cambiar
            </span>
          </span>
        </button>

        <div className="order-last w-full md:order-none md:w-auto md:flex-1">
          <Buscador />
        </div>

        <button
          type="button"
          onClick={() => setCarritoAbierto(true)}
          className="relative ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-verde px-4 font-extrabold text-white transition hover:bg-verde-700 md:ml-0"
          aria-label={`Abrir carrito, ${totalArticulos} artículos, ${formatearUsd(subtotal)}`}
        >
          <IconoCarrito className="h-5 w-5" />
          <span>{formatearUsd(subtotal)}</span>
          {totalArticulos > 0 && (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-sol px-1 text-xs font-black text-azul">
              {totalArticulos}
            </span>
          )}
        </button>
      </div>

      {/* Departamentos: fila deslizable */}
      <nav aria-label="Departamentos" className="border-t border-azul-100">
        <ul className="sin-barra mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-1.5">
          <li>
            <button
              type="button"
              onClick={() => navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, pagina: 1 })}
              className={`min-h-10 whitespace-nowrap rounded-full px-3 text-sm font-bold ${
                ruta.vista === "inicio" ? "bg-azul text-white" : "text-azul hover:bg-azul-100"
              }`}
            >
              Inicio
            </button>
          </li>
          {departamentos.map((d) => (
            <li key={d.slug}>
              <button
                type="button"
                onClick={() => navegar({ vista: "listado", departamento: d.slug, categoria: null, consulta: null, pagina: 1 })}
                aria-current={ruta.departamento === d.slug ? "page" : undefined}
                className={`min-h-10 whitespace-nowrap rounded-full px-3 text-sm font-bold ${
                  ruta.departamento === d.slug && ruta.vista === "listado" ? "bg-azul text-white" : "text-azul hover:bg-azul-100"
                }`}
              >
                {nombreLegible(d.nombre)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
