"use client";

import { useTienda, type LineaTienda } from "@/componentes/tienda/ContextoTienda";
import { Dialogo, ImagenProducto } from "@/componentes/tienda/Basicos";
import { useTasa } from "@/componentes/ContextoTasa";
import { IconoMas, IconoMenos, IconoWhatsApp, IconoMarcador } from "@/componentes/Iconos";
import { MINIMO_COMPRA_USD, SUCURSALES_TIENDA, disponibleEn, tarifaDelivery, type Entrega } from "@/lib/tienda/comercio";
import { WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { formatearBs, formatearUsd } from "@/lib/useTasaBcv";

export function mensajePedido(lineas: LineaTienda[], entrega: Entrega, total: number, encabezado = "¡Hola Sigo! Quiero hacer este pedido:"): string {
  const destino =
    entrega.modo === "retiro"
      ? `Retiro en ${SUCURSALES_TIENDA[entrega.sucursal].corto}`
      : `Delivery a ${entrega.municipio ?? "(municipio por confirmar)"} desde ${SUCURSALES_TIENDA[entrega.sucursal].corto}`;
  return [
    encabezado,
    "",
    ...lineas.map((l) => `• ${l.cantidad} × ${l.producto.nombre} (${formatearUsd(l.subtotal)})`),
    "",
    destino,
    `Total referencial: ${formatearUsd(total)}`,
  ].join("\n");
}

export function CarritoLateral() {
  const {
    lineas,
    guardados,
    subtotal,
    totalArticulos,
    agregar,
    quitar,
    guardarParaDespues,
    moverAlCarrito,
    entrega,
    sucursal,
    carritoAbierto,
    setCarritoAbierto,
    setSelectorEntregaAbierto,
    navegar,
  } = useTienda();
  const { tasa } = useTasa();
  const envio = tarifaDelivery(entrega);
  const total = subtotal + (envio ?? 0);
  const faltante = Math.max(0, MINIMO_COMPRA_USD - subtotal);
  const sinExistencia = lineas.filter((l) => !disponibleEn(l.producto, sucursal));

  return (
    <Dialogo abierto={carritoAbierto} alCerrar={() => setCarritoAbierto(false)} titulo={`Tu carrito (${totalArticulos})`} lado>
      <div className="flex min-h-full flex-col">
        {lineas.length === 0 ? (
          <div className="flex-1 p-6 text-center">
            <p className="text-lg font-bold text-azul">Tu carrito está vacío</p>
            <p className="mt-1 text-gris">Busca productos o escribe tu lista y la armamos por ti.</p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-azul-100 px-4">
            {lineas.map((linea) => {
              const disponible = disponibleEn(linea.producto, sucursal);
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
                        Sin existencia en {SUCURSALES_TIENDA[sucursal].corto}. Abre el producto para ver similares.
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
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
                        onClick={() => guardarParaDespues(linea.producto.id)}
                        className="grid h-11 w-11 place-items-center rounded-full text-gris hover:bg-crema hover:text-azul"
                        aria-label={`Guardar ${linea.producto.nombre} para después`}
                        title="Guardar para después"
                      >
                        <IconoMarcador className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => quitar(linea.producto.id)} className="min-h-11 px-2 text-xs font-bold text-gris hover:text-[#b4371c]">
                        Quitar
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-black text-azul">{formatearUsd(linea.subtotal)}</p>
                </li>
              );
            })}
          </ul>
        )}

        {guardados.length > 0 && (
          <div className="border-t border-azul-100 px-4 py-3">
            <p className="text-sm font-extrabold text-azul">Guardados para después ({guardados.length})</p>
            <ul className="mt-2 space-y-2">
              {guardados.slice(0, 5).map((producto) => (
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

        {/* Resumen fijo al pie */}
        <div className="sticky bottom-0 mt-auto space-y-3 border-t border-azul-100 bg-white p-4">
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
              {sinExistencia.length} producto(s) sin existencia en {SUCURSALES_TIENDA[sucursal].corto}.
            </p>
          )}
          <button
            type="button"
            disabled={lineas.length === 0 || faltante > 0}
            onClick={() => {
              setCarritoAbierto(false);
              navegar({ vista: "checkout", producto: null });
            }}
            className="min-h-12 w-full rounded-full bg-verde font-extrabold text-white transition hover:bg-verde-700 disabled:opacity-40"
          >
            Continuar compra
          </button>
          {lineas.length > 0 && (
            <a
              href={crearEnlaceWhatsApp(WHATSAPP_ATENCION, mensajePedido(lineas, entrega, total))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-extrabold text-verde ring-1 ring-verde/30 hover:bg-verde-100"
            >
              <IconoWhatsApp className="h-4 w-4" /> Enviar pedido por WhatsApp
            </a>
          )}
        </div>
      </div>
    </Dialogo>
  );
}
