"use client";

import { useMemo } from "react";
import type { ProductoCatalogo } from "@/datos/catalogo";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { useDepartamentos } from "@/componentes/tienda/CabeceraTienda";
import { ListaRapida } from "@/componentes/tienda/ListaRapida";
import { TarjetaProducto, RejillaCargando } from "@/componentes/tienda/TarjetaProducto";
import { ImagenProducto } from "@/componentes/tienda/Basicos";
import { buscarProductos } from "@/lib/tienda/buscar";
import { MINIMO_COMPRA_USD, aSlug, disponibleEn, nombreLegible } from "@/lib/tienda/comercio";
import { formatearUsd } from "@/lib/useTasaBcv";

/** Lo que casi todos compran: se resuelve contra el catálogo real con el buscador */
const ESENCIALES = ["harina maiz", "arroz", "aceite", "cafe", "azucar", "pasta", "leche polvo", "huevos", "mantequilla", "papel higienico"];

function Estante({ titulo, productos, accion }: { titulo: string; productos: ProductoCatalogo[]; accion?: { texto: string; alPulsar: () => void } }) {
  if (productos.length === 0) return null;
  return (
    <section className="mt-10" aria-label={titulo}>
      <div className="flex items-end justify-between gap-3 px-4">
        <h2 className="text-xl font-black text-azul sm:text-2xl">{titulo}</h2>
        {accion && (
          <button type="button" onClick={accion.alPulsar} className="min-h-11 shrink-0 text-sm font-extrabold text-verde hover:underline">
            {accion.texto} →
          </button>
        )}
      </div>
      <ul className="sin-barra mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
        {productos.map((producto) => (
          <li key={producto.id} className="flex w-40 shrink-0 sm:w-48">
            <TarjetaProducto producto={producto} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function InicioTienda() {
  const { indice, sucursal, navegar, guardados } = useTienda();
  const departamentos = useDepartamentos();

  const esenciales = useMemo(() => {
    if (!indice) return [];
    const vistos = new Set<string>();
    return ESENCIALES.flatMap((consulta) => {
      const elegido = buscarProductos(indice, consulta).productos.find((p) => disponibleEn(p, sucursal) && !vistos.has(p.id));
      if (!elegido) return [];
      vistos.add(elegido.id);
      return [elegido];
    });
  }, [indice, sucursal]);

  const frescos = useMemo(
    () =>
      indice?.entradas
        .map((e) => e.producto)
        .filter((p) => aSlug(p.departamento ?? "") === "frutas-y-vegetales" && disponibleEn(p, sucursal) && p.imagen)
        .slice(0, 12) ?? [],
    [indice, sucursal],
  );

  // Imagen representativa de cada departamento (primer producto disponible con foto)
  const portadas = useMemo(() => {
    const mapa = new Map<string, ProductoCatalogo>();
    indice?.entradas.forEach(({ producto }) => {
      const slug = aSlug(producto.departamento ?? "");
      if (!mapa.has(slug) && producto.imagen && disponibleEn(producto, sucursal)) mapa.set(slug, producto);
    });
    return mapa;
  }, [indice, sucursal]);

  return (
    <div className="pb-10">
      {/* Protagonista: escribir la lista */}
      <section className="bg-azul px-4 pb-8 pt-6 text-white sm:pb-12 sm:pt-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-sol">Nuevo · Arma tu carrito escribiendo</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">¿Qué necesitas hoy?</h1>
          <p className="mt-2 text-white/90">Escríbelo como se lo dirías a alguien de la familia. Nosotros buscamos cada producto.</p>
          <div className="mt-5">
            <ListaRapida claro />
          </div>
        </div>
      </section>

      {/* Información de compra visible desde el inicio */}
      <ul className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-2 px-4 text-sm sm:grid-cols-3">
        <li className="rounded-2xl bg-white p-3 ring-1 ring-azul/5">
          <strong className="text-azul">Delivery a toda la isla</strong>
          <span className="block text-gris">Desde $2.50 · Express en 2 a 4 horas</span>
        </li>
        <li className="rounded-2xl bg-white p-3 ring-1 ring-azul/5">
          <strong className="text-azul">Retiro en tu vehículo</strong>
          <span className="block text-gris">Costazul o Sambil, sin bajarte del carro</span>
        </li>
        <li className="rounded-2xl bg-white p-3 ring-1 ring-azul/5">
          <strong className="text-azul">Compra mínima {formatearUsd(MINIMO_COMPRA_USD)}</strong>
          <span className="block text-gris">Pago Móvil, Zelle, Cashea, efectivo y más</span>
        </li>
      </ul>

      {!indice ? (
        <div className="mx-auto mt-8 max-w-7xl px-4">
          <RejillaCargando cantidad={5} />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          {guardados.length > 0 && <Estante titulo="Guardados para después" productos={guardados} />}
          <Estante titulo="Lo esencial de tu mercado" productos={esenciales} />
          <Estante
            titulo="Frutas y vegetales"
            productos={frescos}
            accion={{ texto: "Ver todo", alPulsar: () => navegar({ vista: "listado", departamento: "frutas-y-vegetales", categoria: null, pagina: 1 }) }}
          />

          <section className="mt-10 px-4" aria-labelledby="titulo-departamentos">
            <h2 id="titulo-departamentos" className="text-xl font-black text-azul sm:text-2xl">
              Departamentos
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {departamentos.map((d) => {
                const portada = portadas.get(d.slug);
                return (
                  <li key={d.slug}>
                    <button
                      type="button"
                      onClick={() => navegar({ vista: "listado", departamento: d.slug, categoria: null, consulta: null, pagina: 1 })}
                      className="flex h-full w-full flex-col items-start gap-2 rounded-3xl bg-white p-3 text-left ring-1 ring-azul/5 transition hover:shadow-lg hover:shadow-azul/5 sm:flex-row sm:items-center sm:gap-3"
                    >
                      {portada && <ImagenProducto producto={portada} className="h-14 w-14 shrink-0 rounded-2xl" />}
                      <span className="min-w-0 max-w-full [overflow-wrap:anywhere]">
                        <span className="block font-extrabold leading-tight text-azul">{nombreLegible(d.nombre)}</span>
                        <span className="text-xs text-gris">{d.cantidad.toLocaleString("es-VE")} productos</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
