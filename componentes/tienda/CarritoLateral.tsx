"use client";

import { TEXTO_SUSTITUTO, useTienda, type LineaTienda, type PreferenciaSustituto } from "@/componentes/tienda/ContextoTienda";
import { Dialogo, ImagenProducto } from "@/componentes/tienda/Basicos";
import { useTasa } from "@/componentes/ContextoTasa";
import { IconoMas, IconoMenos, IconoWhatsApp, IconoMarcador } from "@/componentes/Iconos";
import { useRef } from "react";
import { ComparadorSucursales } from "@/componentes/tienda/Comparador";
import { MINIMO_COMPRA_USD, SUCURSALES_TIENDA, aCentimos, tarifaDelivery, type Entrega } from "@/lib/tienda/comercio";
import { WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { formatearBs, formatearUsd } from "@/lib/useTasaBcv";

export interface Totales {
  subtotal: number;
  /** null: municipio sin elegir */
  envio: number | null;
  igtf: number;
  total: number;
}

/** Texto del pedido para WhatsApp: solo lo que tiene existencia, con el desglose del total */
export function mensajePedido(
  lineas: LineaTienda[],
  entrega: Entrega,
  totales: Totales,
  encabezado = "¡Hola Sigo! Quiero hacer este pedido:",
  sustitutos?: Record<string, PreferenciaSustituto>,
): string {
  const cobrables = lineas.filter((l) => l.disponible);
  const destino =
    entrega.modo === "retiro"
      ? `Retiro en ${SUCURSALES_TIENDA[entrega.sucursal].corto}`
      : `Delivery a ${entrega.municipio ?? "(municipio por confirmar)"} desde ${SUCURSALES_TIENDA[entrega.sucursal].corto}`;
  const envio =
    entrega.modo === "retiro" ? "Retiro: gratis" : totales.envio === null ? "Envío: por confirmar" : `Envío: ${formatearUsd(totales.envio)}`;
  return [
    encabezado,
    "",
    ...cobrables.map((l) => {
      const preferencia = sustitutos ? (sustitutos[l.producto.id] ?? "similar") : null;
      return `• ${l.cantidad} × ${l.producto.nombre} (${formatearUsd(l.subtotal)})${preferencia ? ` · si no hay: ${TEXTO_SUSTITUTO[preferencia].toLowerCase()}` : ""}`;
    }),
    "",
    destino,
    `Productos: ${formatearUsd(totales.subtotal)}`,
    envio,
    totales.igtf > 0 ? `IGTF (3 %): ${formatearUsd(totales.igtf)}` : "",
    `Total referencial: ${formatearUsd(totales.total)}`,
  ]
    .filter((linea, i, todas) => linea !== "" || todas[i - 1] !== "")
    .join("\n");
}

/** "1 artículo", "3 artículos" */
export function plural(cantidad: number, singular: string, varios = `${singular}s`): string {
  return `${cantidad.toLocaleString("es-VE")} ${cantidad === 1 ? singular : varios}`;
}

export function CarritoLateral() {
  const {
    lineas,
    lineasCobrables,
    guardados,
    subtotal,
    totalArticulos,
    agregar,
    quitar,
    guardarParaDespues,
    moverAlCarrito,
    vaciar,
    entrega,
    sucursal,
    carritoAbierto,
    setCarritoAbierto,
    setSelectorEntregaAbierto,
    navegar,
  } = useTienda();
  const { tasa } = useTasa();
  const titulo = useRef<HTMLParagraphElement>(null);
  const envio = tarifaDelivery(entrega);
  const total = (aCentimos(subtotal) + aCentimos(envio ?? 0)) / 100;
  const faltante = Math.max(0, aCentimos(MINIMO_COMPRA_USD) - aCentimos(subtotal)) / 100;
  const sinExistencia = lineas.filter((l) => !l.disponible);

  /** Tras quitar una línea el botón desaparece: el foco va al resumen para no perderse en <body> */
  function conFocoSeguro(accion: () => void) {
    accion();
    window.requestAnimationFrame(() => titulo.current?.focus());
  }

  return (
    <Dialogo abierto={carritoAbierto} alCerrar={() => setCarritoAbierto(false)} titulo={`Tu carrito (${plural(totalArticulos, "artículo")})`} lado>
      <div className="flex min-h-full flex-col">
        {lineas.length === 0 ? (
          <div className="flex-1 p-6 text-center">
            <p className="text-lg font-bold text-azul">Tu carrito está vacío</p>
            <p className="mt-1 text-gris">Busca productos o escribe tu lista y la armamos por ti.</p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-azul-100 px-4">
            {lineas.map((linea) => {
              const disponible = linea.disponible;
              return (
                <li key={linea.producto.id} className="flex gap-3 py-3">
                  <ImagenProducto producto={linea.producto} className="h-16 w-16 shrink-0 rounded-2xl ring-1 ring-azul/5" />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCarritoAbierto(false);
                        navegar({ producto: linea.producto.id });
                      }}
                      className="line-clamp-2 text-left text-sm font-bold leading-tight hover:underline"
                    >
                      {linea.producto.nombre}
                    </button>
                    <p className="text-xs text-gris">{formatearUsd(linea.precio)} c/u</p>
                    {!disponible && (
                      <p className="mt-1 text-xs font-bold text-[#b4371c]">
                        Sin existencia en {SUCURSALES_TIENDA[sucursal].corto}: no se cobra ni va en el pedido. Abre el producto para ver similares.
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2">
                      <div className="flex items-center rounded-full bg-crema">
                        <button
                          type="button"
                          onClick={() => agregar(linea.producto.id, -1)}
                          className="grid h-11 w-11 place-items-center rounded-full hover:bg-azul-100"
                          aria-label={`Quitar uno de ${linea.producto.nombre}`}
                        >
                          <IconoMenos className="h-4 w-4" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-black">{linea.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => agregar(linea.producto.id, 1)}
                          disabled={linea.cantidad >= 99}
                          className="grid h-11 w-11 place-items-center rounded-full hover:bg-azul-100 disabled:opacity-40"
                          aria-label={`Agregar otro de ${linea.producto.nombre}`}
                        >
                          <IconoMas className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => conFocoSeguro(() => guardarParaDespues(linea.producto.id))}
                        className="grid h-11 w-11 place-items-center rounded-full text-gris hover:bg-crema hover:text-azul"
                        aria-label={`Guardar ${linea.producto.nombre} para después`}
                        title="Guardar para después"
                      >
                        <IconoMarcador className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => conFocoSeguro(() => quitar(linea.producto.id))}
                        className="min-h-11 px-2 text-xs font-bold text-gris hover:text-[#b4371c]"
                        aria-label={`Quitar ${linea.producto.nombre} del carrito`}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <p className={`shrink-0 text-sm font-black ${disponible ? "text-azul" : "text-gris line-through"}`}>{formatearUsd(linea.subtotal)}</p>
                </li>
              );
            })}
          </ul>
        )}

        {guardados.length > 0 && (
          <div className="border-t border-azul-100 px-4 py-3">
            <p className="text-sm font-extrabold text-azul">Guardados para después ({guardados.length})</p>
            <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
              {guardados.map((producto) => (
                <li key={producto.id} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{producto.nombre}</span>
                  <button type="button" onClick={() => moverAlCarrito(producto.id)} className="min-h-11 shrink-0 px-2 font-extrabold text-verde">
                    Mover al carrito
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lineas.length > 0 && (
          <div className="px-4 pb-3">
            <ComparadorSucursales compacto />
          </div>
        )}

        {/* Resumen fijo al pie */}
        <div className="sticky bottom-0 mt-auto space-y-3 border-t border-azul-100 bg-white p-4 [@media(max-height:640px)]:static">
          <p ref={titulo} tabIndex={-1} className="sr-only" aria-live="polite">
            {lineas.length === 0 ? "Carrito vacío" : `${plural(totalArticulos, "artículo")}, total ${formatearUsd(total)}`}
          </p>
          {lineas.length > 0 && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-azul-100" aria-hidden>
                <div className="h-full rounded-full bg-verde transition-all" style={{ width: `${Math.min(100, (subtotal / MINIMO_COMPRA_USD) * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs font-bold text-gris">
                {faltante > 0 ? `Agrega ${formatearUsd(faltante)} más para la compra mínima de ${formatearUsd(MINIMO_COMPRA_USD)}` : "Compra mínima alcanzada ✓"}
              </p>
            </div>
          )}
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gris">Subtotal</dt>
              <dd className="font-bold">{formatearUsd(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gris">{entrega.modo === "retiro" ? `Retiro en ${SUCURSALES_TIENDA[entrega.sucursal].corto}` : "Envío"}</dt>
              <dd className="text-right font-bold">
                {envio === null ? (
                  <button type="button" onClick={() => setSelectorEntregaAbierto(true)} className="text-verde underline">
                    Elige tu municipio
                  </button>
                ) : envio === 0 ? (
                  "Gratis"
                ) : (
                  formatearUsd(envio)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-azul-100 pt-1 text-base">
              <dt className="font-black text-azul">Total</dt>
              <dd className="text-right">
                <span className="font-black text-azul">{formatearUsd(total)}</span>
                {tasa && <span className="block text-xs text-gris">{formatearBs(total, tasa.valor)}</span>}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-gris">Pagos en divisas incluyen IGTF (3 %). Se calcula al elegir el método de pago.</p>
          {sinExistencia.length > 0 && (
            <p className="text-xs font-bold text-[#b4371c]">
              {plural(sinExistencia.length, "producto")} sin existencia en {SUCURSALES_TIENDA[sucursal].corto}: no se incluye
              {sinExistencia.length === 1 ? "" : "n"} en el total.
            </p>
          )}
          <button
            type="button"
            disabled={lineasCobrables.length === 0 || faltante > 0}
            onClick={() => {
              setCarritoAbierto(false);
              navegar({ vista: "checkout", producto: null });
            }}
            className="min-h-12 w-full rounded-full bg-verde font-extrabold text-white transition hover:bg-verde-700 disabled:opacity-40"
          >
            Continuar compra
          </button>
          {lineasCobrables.length > 0 && faltante === 0 && (
            <a
              href={crearEnlaceWhatsApp(WHATSAPP_ATENCION, mensajePedido(lineas, entrega, { subtotal, envio, igtf: 0, total }))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-extrabold text-verde ring-1 ring-verde/30 hover:bg-verde-100"
            >
              <IconoWhatsApp className="h-4 w-4" /> Enviar pedido por WhatsApp
            </a>
          )}
          {lineas.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Vaciar el carrito? Se quitarán todos los productos.")) conFocoSeguro(vaciar);
              }}
              className="min-h-11 w-full text-xs font-bold text-gris hover:text-[#b4371c]"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </Dialogo>
  );
}
