"use client";

import { useMemo } from "react";
import type { ProductoCatalogo } from "@/datos/catalogo";
import { useTienda, type OrdenListado } from "@/componentes/tienda/ContextoTienda";
import { RejillaCargando, RejillaProductos } from "@/componentes/tienda/TarjetaProducto";
import { buscarProductos } from "@/lib/tienda/buscar";
import { SUCURSALES_TIENDA, aSlug, disponibleEn, nombreLegible, precioEn } from "@/lib/tienda/comercio";

const POR_PAGINA = 24;

const ETIQUETAS_ORDEN: Record<OrdenListado, string> = {
  relevancia: "Relevancia",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
  nombre: "Nombre (A-Z)",
};

export function Listado() {
  const { indice, ruta, navegar, sucursal } = useTienda();

  const { titulo, base, correccion } = useMemo(() => {
    if (!indice) return { titulo: "", base: [] as ProductoCatalogo[], correccion: null as string | null };
    if (ruta.vista === "buscar" && ruta.consulta) {
      const resultado = buscarProductos(indice, ruta.consulta);
      return {
        titulo: `Resultados para "${resultado.correccion ?? ruta.consulta}"`,
        base: resultado.productos,
        correccion: resultado.correccion ? ruta.consulta : null,
      };
    }
    const productos = indice.entradas
      .map((e) => e.producto)
      .filter((p) => aSlug(p.departamento ?? "") === ruta.departamento);
    const nombre = productos[0]?.departamento ?? "Departamento";
    return { titulo: nombreLegible(nombre), base: productos, correccion: null };
  }, [indice, ruta.vista, ruta.consulta, ruta.departamento]);

  // Categorías presentes en la base (chips)
  const categorias = useMemo(() => {
    const conteo = new Map<string, { nombre: string; slug: string; cantidad: number }>();
    for (const p of base) {
      const slug = aSlug(p.categoria);
      const actual = conteo.get(slug) ?? { nombre: p.categoria, slug, cantidad: 0 };
      actual.cantidad++;
      conteo.set(slug, actual);
    }
    return [...conteo.values()].sort((a, b) => b.cantidad - a.cantidad);
  }, [base]);

  const filtrados = useMemo(() => {
    let lista = base;
    if (ruta.categoria) lista = lista.filter((p) => aSlug(p.categoria) === ruta.categoria);
    if (ruta.soloDisponibles) lista = lista.filter((p) => disponibleEn(p, sucursal));
    const ordenados = [...lista];
    if (ruta.orden === "precio-asc") ordenados.sort((a, b) => precioEn(a, sucursal) - precioEn(b, sucursal));
    else if (ruta.orden === "precio-desc") ordenados.sort((a, b) => precioEn(b, sucursal) - precioEn(a, sucursal));
    else if (ruta.orden === "nombre") ordenados.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    else if (ruta.vista !== "buscar") {
      // Relevancia en departamentos: primero lo disponible, luego por nombre
      ordenados.sort(
        (a, b) => Number(disponibleEn(b, sucursal)) - Number(disponibleEn(a, sucursal)) || a.nombre.localeCompare(b.nombre, "es"),
      );
    }
    return ordenados;
  }, [base, ruta.categoria, ruta.soloDisponibles, ruta.orden, ruta.vista, sucursal]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(ruta.pagina, paginas);
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const sinDisponibles = ruta.soloDisponibles && filtrados.length === 0 && base.length > 0;

  return (
    <section aria-labelledby="titulo-listado" className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Ruta" className="text-sm text-gris">
        <button type="button" onClick={() => navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, pagina: 1 })} className="hover:underline">
          Tienda
        </button>
        {ruta.categoria && ruta.vista === "listado" && (
          <>
            {" › "}
            <button type="button" onClick={() => navegar({ categoria: null, pagina: 1 })} className="hover:underline">
              {titulo}
            </button>
          </>
        )}
      </nav>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="titulo-listado" className="text-2xl font-black text-azul sm:text-3xl">
            {ruta.categoria ? nombreLegible(categorias.find((c) => c.slug === ruta.categoria)?.nombre ?? titulo) : titulo}
          </h1>
          {correccion && (
            <p className="text-sm text-gris">
              Corregimos tu búsqueda: escribiste <strong className="text-azul">{correccion}</strong>.
            </p>
          )}
          {indice && <p className="text-sm text-gris">{filtrados.length.toLocaleString("es-VE")} productos</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-azul ring-1 ring-azul/10">
            <input
              type="checkbox"
              checked={ruta.soloDisponibles}
              onChange={(e) => navegar({ soloDisponibles: e.target.checked, pagina: 1 }, { reemplazar: true })}
              className="h-4 w-4 accent-verde"
            />
            Solo disponibles en {SUCURSALES_TIENDA[sucursal].corto}
          </label>
          <label className="sr-only" htmlFor="orden-listado">
            Ordenar por
          </label>
          <select
            id="orden-listado"
            value={ruta.orden}
            onChange={(e) => navegar({ orden: e.target.value as OrdenListado, pagina: 1 }, { reemplazar: true })}
            className="min-h-11 rounded-full bg-white px-3 text-sm font-bold text-azul ring-1 ring-azul/10"
          >
            {(Object.keys(ETIQUETAS_ORDEN) as OrdenListado[]).map((orden) => (
              <option key={orden} value={orden}>
                {ETIQUETAS_ORDEN[orden]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categorias.length > 1 && (
        <ul className="sin-barra -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Categorías">
          <li>
            <button
              type="button"
              onClick={() => navegar({ categoria: null, pagina: 1 }, { reemplazar: true })}
              aria-pressed={!ruta.categoria}
              className={`min-h-10 whitespace-nowrap rounded-full px-3 text-sm font-bold ${!ruta.categoria ? "bg-verde text-white" : "bg-white text-azul ring-1 ring-azul/10"}`}
            >
              Todo
            </button>
          </li>
          {categorias.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => navegar({ categoria: c.slug, pagina: 1 }, { reemplazar: true })}
                aria-pressed={ruta.categoria === c.slug}
                className={`min-h-10 whitespace-nowrap rounded-full px-3 text-sm font-bold ${
                  ruta.categoria === c.slug ? "bg-verde text-white" : "bg-white text-azul ring-1 ring-azul/10"
                }`}
              >
                {nombreLegible(c.nombre)} <span className="opacity-60">{c.cantidad}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        {!indice ? (
          <RejillaCargando />
        ) : visibles.length > 0 ? (
          <RejillaProductos productos={visibles} />
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-azul/5">
            <p className="text-lg font-bold text-azul">
              {sinDisponibles ? `Nada disponible en ${SUCURSALES_TIENDA[sucursal].corto} con este filtro.` : "No encontramos productos."}
            </p>
            {sinDisponibles ? (
              <button type="button" onClick={() => navegar({ soloDisponibles: false, pagina: 1 })} className="mt-3 font-extrabold text-verde underline">
                Ver también los que no tienen existencia
              </button>
            ) : (
              <p className="mt-2 text-gris">Prueba con otra palabra o revisa la ortografía.</p>
            )}
          </div>
        )}
      </div>

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => navegar({ pagina: pagina - 1 })}
            className="min-h-11 rounded-full px-4 font-bold text-azul ring-1 ring-azul/10 disabled:opacity-30"
          >
            Anterior
          </button>
          {numerosDePagina(pagina, paginas).map((n, i) =>
            n === null ? (
              <span key={`h-${i}`} className="px-1 text-gris">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => navegar({ pagina: n })}
                aria-current={n === pagina ? "page" : undefined}
                className={`grid h-11 min-w-11 place-items-center rounded-full font-bold ${n === pagina ? "bg-azul text-white" : "text-azul ring-1 ring-azul/10"}`}
              >
                {n}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={pagina === paginas}
            onClick={() => navegar({ pagina: pagina + 1 })}
            className="min-h-11 rounded-full px-4 font-bold text-azul ring-1 ring-azul/10 disabled:opacity-30"
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}

/** 1 … 4 5 6 … 20 */
function numerosDePagina(actual: number, total: number): (number | null)[] {
  const visibles = new Set([1, total, actual - 1, actual, actual + 1].filter((n) => n >= 1 && n <= total));
  const ordenados = [...visibles].sort((a, b) => a - b);
  const resultado: (number | null)[] = [];
  ordenados.forEach((n, i) => {
    const anterior = ordenados[i - 1];
    if (anterior !== undefined && n - anterior > 1) resultado.push(null);
    resultado.push(n);
  });
  return resultado;
}
