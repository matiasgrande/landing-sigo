"use client";

import { useEffect, useMemo, useState } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { ImagenProducto } from "@/componentes/tienda/Basicos";
import { plural } from "@/componentes/tienda/CarritoLateral";
import { IconoMas, IconoMenos } from "@/componentes/Iconos";
import { RECETAS_SIEMPRE, recetaPorId, temporadasEn, type Receta, type TemporadaEnFecha } from "@/datos/temporadas";
import { aCentimos, disponibleEn, precioEn, SUCURSALES_TIENDA } from "@/lib/tienda/comercio";
import { registrarEvento } from "@/lib/tienda/eventos";
import { hoyEnMargarita } from "@/lib/tienda/promociones";
import { resolverReceta, textoCantidad } from "@/lib/tienda/recetas";
import { formatearUsd } from "@/lib/useTasaBcv";

/** Temporadas activas y la próxima, calculadas en el cliente (la fecha cambia, el HTML exportado no) */
function useTemporadas(): { activas: TemporadaEnFecha[]; proxima: TemporadaEnFecha | null } | null {
  const [estado, setEstado] = useState<ReturnType<typeof temporadasEn> | null>(null);
  useEffect(() => setEstado(temporadasEn(hoyEnMargarita())), []);
  return estado;
}

function TarjetaReceta({ receta }: { receta: Receta }) {
  const { indice, sucursal, agregar, setCarritoAbierto } = useTienda();
  const [porciones, setPorciones] = useState(receta.porciones);
  const [resultado, setResultado] = useState<string | null>(null);
  const paso = receta.porciones >= 10 ? 5 : 1;

  const ingredientes = useMemo(
    () => (indice ? resolverReceta(receta, porciones, indice, (p) => disponibleEn(p, sucursal)) : []),
    [indice, receta, porciones, sucursal],
  );
  const conProducto = ingredientes.filter((i) => i.producto);
  const total = conProducto.reduce((suma, i) => (i.producto ? suma + aCentimos(precioEn(i.producto, sucursal) * i.unidades) : suma), 0) / 100;
  const idTitulo = `receta-${receta.id}`;

  function agregarTodo() {
    conProducto.forEach((i) => i.producto && agregar(i.producto.id, i.unidades));
    registrarEvento({ tipo: "receta", receta: receta.id });
    const faltan = ingredientes.length - conProducto.length;
    setResultado(
      `Agregamos ${plural(conProducto.length, "producto")}${faltan > 0 ? `; ${plural(faltan, "ingrediente")} lo consigues en tu tienda Sigo` : ""}.`,
    );
    setCarritoAbierto(true);
  }

  return (
    <article aria-labelledby={idTitulo} className="flex min-w-0 flex-col rounded-3xl bg-white p-4 ring-1 ring-azul/5">
      <h3 id={idTitulo} className="text-lg font-black text-azul">
        {receta.titulo}
      </h3>
      <p className="text-sm text-gris">{receta.descripcion}</p>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-full bg-crema p-1">
        <button
          type="button"
          onClick={() => setPorciones((p) => Math.max(paso, p - paso))}
          disabled={porciones <= paso}
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-azul-100 disabled:opacity-40"
          aria-label={`Menos ${receta.unidadPorciones}`}
        >
          <IconoMenos className="h-4 w-4" />
        </button>
        <p className="text-sm font-extrabold text-azul" aria-live="polite">
          Para {porciones} {receta.unidadPorciones}
        </p>
        <button
          type="button"
          onClick={() => setPorciones((p) => Math.min(receta.porciones * 6, p + paso))}
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-azul-100"
          aria-label={`Más ${receta.unidadPorciones}`}
        >
          <IconoMas className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-3 flex-1 space-y-2 text-sm">
        {ingredientes.map((i) => (
          <li key={i.ingrediente.nombre} className="flex items-center gap-2">
            {i.producto ? (
              <ImagenProducto producto={i.producto} className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-azul/5" />
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-crema text-xs font-black text-gris" aria-hidden>
                —
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-tight">
                {i.ingrediente.nombre} <span className="font-semibold text-gris">· {textoCantidad(i.cantidad, i.ingrediente.unidad)}</span>
              </span>
              <span className="block truncate text-xs text-gris">
                {i.producto
                  ? `${i.unidades} × ${i.producto.nombre}`
                  : i.ingrediente.enLinea === false
                    ? "Consíguelo en tu tienda Sigo (no se vende en línea)"
                    : `Sin existencia en ${SUCURSALES_TIENDA[sucursal].corto}`}
              </span>
            </span>
            {i.producto && <span className="shrink-0 font-black text-azul">{formatearUsd(precioEn(i.producto, sucursal) * i.unidades)}</span>}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={agregarTodo}
        disabled={!indice || conProducto.length === 0}
        className="mt-4 min-h-12 w-full rounded-full bg-verde px-4 font-extrabold text-white transition hover:bg-verde-700 disabled:opacity-40"
      >
        Agregar {plural(conProducto.length, "producto")} · {formatearUsd(total)}
      </button>
      <p className="mt-1 min-h-4 text-xs font-bold text-gris" aria-live="polite">
        {resultado}
      </p>
    </article>
  );
}

function RejillaRecetas({ ids }: { ids: string[] }) {
  const recetas = ids.flatMap((id) => recetaPorId(id) ?? []);
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recetas.map((receta) => (
        <TarjetaReceta key={receta.id} receta={receta} />
      ))}
    </div>
  );
}

/** Franja de inicio: la temporada activa o la que viene, con acceso a sus recetas */
export function BannerTemporada() {
  const temporadas = useTemporadas();
  const { navegar } = useTienda();
  if (!temporadas) return null;
  const actual = temporadas.activas[0];
  const destacada = actual ?? (temporadas.proxima && temporadas.proxima.faltan <= 45 ? temporadas.proxima : null);
  if (!destacada) return null;
  return (
    <section className="mx-4 mt-8 overflow-hidden rounded-3xl bg-coral-700 p-5 text-white sm:p-6" aria-labelledby="titulo-temporada">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/90">
        {actual ? "Temporada" : `Se viene en ${plural(destacada.faltan, "día")}`}
      </p>
      <h2 id="titulo-temporada" className="mt-1 text-2xl font-black sm:text-3xl">
        {destacada.temporada.nombre}
      </h2>
      <p className="mt-1 max-w-2xl text-white/90">{destacada.temporada.mensaje}</p>
      <button
        type="button"
        onClick={() => navegar({ vista: "recetas", departamento: null, categoria: null, consulta: null })}
        className="mt-4 min-h-11 rounded-full bg-white px-5 font-extrabold text-coral-700 transition hover:bg-sol hover:text-azul"
      >
        Ver recetas y kits
      </button>
    </section>
  );
}

export function VistaRecetas() {
  const temporadas = useTemporadas();
  const activas = temporadas?.activas ?? [];
  const proxima = temporadas?.proxima ?? null;
  const enTemporada = new Set(activas.flatMap((a) => a.temporada.recetas));
  const siempre = RECETAS_SIEMPRE.filter((id) => !enTemporada.has(id));

  return (
    <section className="mx-auto max-w-7xl px-4 py-6" aria-labelledby="titulo-recetas">
      <h1 id="titulo-recetas" className="text-2xl font-black text-azul sm:text-3xl">
        Recetas y temporada
      </h1>
      <p className="max-w-2xl text-sm text-gris">
        Elige para cuántos cocinas y agregamos los ingredientes con los productos reales de tu tienda. Lo fresco de carnicería y pescadería lo
        consigues en tu tienda Sigo.
      </p>

      {activas.map(({ temporada }) => (
        <div key={temporada.id} className="mt-8">
          <h2 className="text-xl font-black text-coral-700 sm:text-2xl">{temporada.nombre}</h2>
          <p className="text-sm text-gris">{temporada.mensaje}</p>
          <RejillaRecetas ids={temporada.recetas} />
        </div>
      ))}

      {proxima && activas.length === 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-black text-coral-700 sm:text-2xl">
            {proxima.temporada.nombre} <span className="text-base font-bold text-gris">· en {plural(proxima.faltan, "día")}</span>
          </h2>
          <p className="text-sm text-gris">{proxima.temporada.mensaje} Adelanta tu lista.</p>
          <RejillaRecetas ids={proxima.temporada.recetas} />
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-black text-azul sm:text-2xl">De todo el año</h2>
        <RejillaRecetas ids={siempre.filter((id) => !(proxima && activas.length === 0 && proxima.temporada.recetas.includes(id)))} />
      </div>
    </section>
  );
}
