"use client";

import { useState } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { plural } from "@/componentes/tienda/CarritoLateral";
import { SUCURSALES_TIENDA } from "@/lib/tienda/comercio";
import { diasDesde, type PedidoGuardado } from "@/lib/tienda/pedidos";
import { formatearUsd } from "@/lib/useTasaBcv";

function hace(fecha: string): string {
  const dias = diasDesde(fecha);
  return dias <= 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;
}

/** Botón "Repetir pedido" con el resultado anunciado (lo que ya no hay no se agrega) */
function BotonRepetir({ pedido, principal = false }: { pedido: PedidoGuardado; principal?: boolean }) {
  const { repetirPedido, setCarritoAbierto } = useTienda();
  const [resultado, setResultado] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const agregados = repetirPedido(pedido);
          const faltan = pedido.lineas.length - agregados;
          setResultado(
            agregados === 0
              ? "Ninguno de estos productos está disponible ahora."
              : `Agregamos ${plural(agregados, "producto")}${faltan > 0 ? `; ${plural(faltan, "producto")} no ${faltan === 1 ? "está" : "están"} disponible${faltan === 1 ? "" : "s"}` : ""}.`,
          );
          if (agregados > 0) setCarritoAbierto(true);
        }}
        className={`min-h-11 rounded-full px-4 text-sm font-extrabold transition ${
          principal ? "bg-verde text-white hover:bg-verde-700" : "text-verde ring-1 ring-verde/30 hover:bg-verde-100"
        }`}
      >
        Repetir pedido
      </button>
      <p className="text-xs font-bold text-gris" aria-live="polite">
        {resultado}
      </p>
    </div>
  );
}

/** Inicio: el último mercado a un toque, con recordatorio si ya pasó la quincena */
export function ComprarDeNuevo() {
  const { pedidos, navegar } = useTienda();
  const ultimo = pedidos[0];
  if (!ultimo) return null;
  const dias = diasDesde(ultimo.fecha);
  return (
    <section className="mx-4 mt-8 rounded-3xl bg-white p-5 ring-1 ring-azul/5" aria-labelledby="titulo-comprar-de-nuevo">
      <p className="text-xs font-extrabold uppercase tracking-wider text-verde">{dias >= 14 ? "¿Ya toca reponer?" : "Comprar de nuevo"}</p>
      <h2 id="titulo-comprar-de-nuevo" className="mt-1 text-xl font-black text-azul">
        Tu último mercado fue {hace(ultimo.fecha)}
      </h2>
      <p className="mt-1 text-sm text-gris">
        {plural(ultimo.lineas.length, "producto")} · {formatearUsd(ultimo.total)} · {SUCURSALES_TIENDA[ultimo.sucursal].corto}
        {ultimo.paraOtro ? ` · para ${ultimo.paraOtro}` : ""}
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-tinta">{ultimo.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join(" · ")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <BotonRepetir pedido={ultimo} principal />
        {pedidos.length > 1 && (
          <button
            type="button"
            onClick={() => navegar({ vista: "pedidos", departamento: null, categoria: null, consulta: null })}
            className="min-h-11 text-sm font-extrabold text-azul underline"
          >
            Ver mis {pedidos.length} pedidos
          </button>
        )}
      </div>
    </section>
  );
}

export function VistaPedidos() {
  const { pedidos, navegar } = useTienda();
  return (
    <section className="mx-auto max-w-3xl px-4 py-6" aria-labelledby="titulo-pedidos">
      <h1 id="titulo-pedidos" className="text-2xl font-black text-azul sm:text-3xl">
        Mis pedidos
      </h1>
      <p className="text-sm text-gris">Guardados en este dispositivo. Repite cualquiera con un toque.</p>
      {pedidos.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center ring-1 ring-azul/5">
          <p className="text-lg font-bold text-azul">Todavía no tienes pedidos.</p>
          <button
            type="button"
            onClick={() => navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null })}
            className="mt-3 min-h-11 rounded-full bg-verde px-5 font-extrabold text-white"
          >
            Empezar a comprar
          </button>
        </div>
      ) : (
        <ol className="mt-5 space-y-3">
          {pedidos.map((pedido) => (
            <li key={pedido.numero} className="rounded-3xl bg-white p-4 ring-1 ring-azul/5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-black text-azul">Pedido {pedido.numero}</h2>
                <p className="text-sm font-bold text-gris">
                  {new Date(pedido.fecha).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })} · {hace(pedido.fecha)}
                </p>
              </div>
              <p className="text-sm text-gris">
                {plural(pedido.lineas.length, "producto")} · {formatearUsd(pedido.total)} ·{" "}
                {pedido.modo === "retiro" ? "Retiro" : "Delivery"} desde {SUCURSALES_TIENDA[pedido.sucursal].corto}
                {pedido.paraOtro ? ` · para ${pedido.paraOtro}` : ""}
              </p>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer font-bold text-azul">Ver productos</summary>
                <ul className="mt-1 list-disc pl-5 text-tinta">
                  {pedido.lineas.map((l) => (
                    <li key={l.id}>
                      {l.cantidad} × {l.nombre}
                    </li>
                  ))}
                </ul>
              </details>
              <div className="mt-3">
                <BotonRepetir pedido={pedido} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
