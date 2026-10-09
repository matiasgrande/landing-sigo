"use client";

import { useEffect, useState } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { Dialogo } from "@/componentes/tienda/Basicos";
import { TARIFAS_MUNICIPIO } from "@/datos/entregas";
import { SUCURSALES_TIENDA, type ClaveSucursal, type Entrega } from "@/lib/tienda/comercio";
import { formatearUsd } from "@/lib/useTasaBcv";

/** Elegir delivery (municipio) o retiro (sucursal), sin bloquear la navegación */
export function SelectorEntrega() {
  const { entrega, setEntrega, selectorEntregaAbierto, setSelectorEntregaAbierto } = useTienda();
  const [borrador, setBorrador] = useState<Entrega>(entrega);

  useEffect(() => {
    if (selectorEntregaAbierto) setBorrador(entrega);
  }, [selectorEntregaAbierto, entrega]);

  const tarifa = TARIFAS_MUNICIPIO.find((t) => t.municipio === borrador.municipio);
  const puedeGuardar = borrador.modo === "retiro" || borrador.municipio !== null;

  return (
    <Dialogo abierto={selectorEntregaAbierto} alCerrar={() => setSelectorEntregaAbierto(false)} titulo="¿Cómo recibes tu compra?">
      <div className="space-y-5 p-5">
        <fieldset>
          <legend className="sr-only">Modalidad</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["delivery", "retiro"] as const).map((modo) => (
              <label
                key={modo}
                className={`flex min-h-14 cursor-pointer items-start gap-2 rounded-2xl border-2 px-3 py-2 font-extrabold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sol ${
                  borrador.modo === modo ? "border-azul bg-azul-100 text-azul" : "border-azul/10 text-tinta hover:border-azul/30"
                }`}
              >
                <input
                  type="radio"
                  name="modalidad-entrega"
                  value={modo}
                  checked={borrador.modo === modo}
                  onChange={() => setBorrador({ ...borrador, modo })}
                  className="mt-1 accent-azul"
                />
                <span>
                  {modo === "delivery" ? "Delivery" : "Retiro en tienda"}
                  <span className="block text-xs font-semibold text-gris">
                    {modo === "delivery" ? "Te lo llevamos" : "En tu vehículo, sin bajarte"}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {borrador.modo === "delivery" && (
          <label className="block">
            <span className="text-sm font-bold text-azul">Municipio</span>
            <select
              value={borrador.municipio ?? ""}
              onChange={(e) => setBorrador({ ...borrador, municipio: e.target.value || null })}
              className="mt-1 h-12 w-full rounded-2xl bg-crema px-4 text-base font-semibold text-tinta ring-1 ring-azul/10"
            >
              <option value="">Elige tu municipio</option>
              {TARIFAS_MUNICIPIO.map((t) => (
                <option key={t.municipio} value={t.municipio}>
                  {t.municipio} · {formatearUsd(t.tarifaUsd)}
                  {t.express ? " · Express" : ""}
                </option>
              ))}
            </select>
            {tarifa && (
              <span className="mt-2 block text-sm text-gris">
                Envío {formatearUsd(tarifa.tarifaUsd)} · {tarifa.express ? "Express de 2 a 4 horas" : "Delivery especial, salida diaria 3:00 p.m."}
              </span>
            )}
          </label>
        )}

        <fieldset>
          <legend className="text-sm font-bold text-azul">
            {borrador.modo === "retiro" ? "¿En cuál tienda retiras?" : "Tienda que prepara tu pedido"}
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(SUCURSALES_TIENDA) as ClaveSucursal[]).map((clave) => (
              <label
                key={clave}
                className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 text-sm font-bold ${
                  borrador.sucursal === clave ? "border-verde bg-verde-100 text-verde" : "border-azul/10"
                }`}
              >
                <input
                  type="radio"
                  name="sucursal"
                  value={clave}
                  checked={borrador.sucursal === clave}
                  onChange={() => setBorrador({ ...borrador, sucursal: clave })}
                  className="accent-verde"
                />
                {SUCURSALES_TIENDA[clave].corto}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gris">Precios y existencias pueden variar entre tiendas.</p>
        </fieldset>

        <button
          type="button"
          disabled={!puedeGuardar}
          onClick={() => {
            setEntrega(borrador);
            setSelectorEntregaAbierto(false);
          }}
          className="min-h-12 w-full rounded-full bg-azul font-extrabold text-white transition hover:bg-azul-700 disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
    </Dialogo>
  );
}
