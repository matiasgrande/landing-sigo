"use client";

import { useId, useState, type ComponentType, type SVGProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MODALIDADES_ENTREGA, TARIFAS_MUNICIPIO } from "@/datos/entregas";
import { formatearBs, formatearUsd } from "@/lib/useTasaBcv";
import { useTasa } from "@/componentes/ContextoTasa";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";
import { IconoCamion, IconoCarro, IconoMoto, IconoReloj } from "@/componentes/Iconos";

const ICONOS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  retiro: IconoCarro,
  express: IconoMoto,
  especial: IconoCamion,
  programado: IconoReloj,
};

const FONDOS = ["bg-azul text-white", "bg-verde text-white", "bg-sol text-azul", "bg-white text-azul"];

function CalculadoraTarifa() {
  const [municipio, setMunicipio] = useState(TARIFAS_MUNICIPIO[0]?.municipio ?? "");
  const idSelector = useId();
  const { tasa } = useTasa();
  const seleccion = TARIFAS_MUNICIPIO.find((t) => t.municipio === municipio);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-azul/5 ring-1 ring-azul/5 sm:p-8">
      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-verde">¿Cuánto cuesta el delivery?</p>
      <label htmlFor={idSelector} className="mt-3 block text-2xl font-black text-azul">
        Elige tu municipio
      </label>
      <div className="relative mt-4">
        <select
          id={idSelector}
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          className="w-full appearance-none rounded-2xl bg-crema py-4 pl-4 pr-12 text-lg font-bold text-azul outline-none ring-azul/30 focus:ring-2"
        >
          {TARIFAS_MUNICIPIO.map((t) => (
            <option key={t.municipio} value={t.municipio}>
              {t.municipio}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-azul"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <AnimatePresence mode="wait">
        {seleccion && (
          <motion.div
            key={seleccion.municipio}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="text-6xl font-black tracking-tight text-verde">{formatearUsd(seleccion.tarifaUsd)}</p>
              {tasa && <p className="mt-1 text-sm text-gris">{formatearBs(seleccion.tarifaUsd, tasa.valor)}</p>}
            </div>
            <p
              className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                seleccion.express ? "bg-verde-100 text-verde" : "bg-azul-100 text-azul"
              }`}
            >
              {seleccion.express ? "Express disponible · 2 a 4 h" : "Delivery Especial · salida 3:00 p.m."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-6 text-xs text-gris">Tarifas publicadas en sigo.com.ve. Pueden variar sin previo aviso.</p>
    </div>
  );
}

export function Entregas() {
  return (
    <section id="entregas" className="px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <TituloSeccion
            etiqueta="Cómo te lo llevamos"
            titulo={
              <>
                Tu mercado,
                <span className="text-verde"> donde estés en la isla.</span>
              </>
            }
            descripcion="Desde Porlamar hasta Macanao: elige si lo retiras sin bajarte del carro o si te lo llevamos a la puerta."
          />
          <Revelar className="mt-10" retraso={0.1}>
            <CalculadoraTarifa />
          </Revelar>
        </div>

        {/* Tarjetas apiladas que se superponen al hacer scroll */}
        <ol className="relative space-y-6">
          {MODALIDADES_ENTREGA.map((modalidad, indice) => {
            const Icono = ICONOS[modalidad.id] ?? IconoReloj;
            return (
              <li
                key={modalidad.id}
                className="sticky"
                style={{ top: `calc(6rem + ${indice * 1.5}rem)` }}
              >
                <Revelar>
                  <article
                    className={`min-h-64 rounded-[2rem] p-7 shadow-2xl shadow-azul/15 ring-1 ring-azul/5 sm:p-9 ${FONDOS[indice % FONDOS.length]}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-current/10">
                        <Icono className="h-7 w-7" />
                      </span>
                      <span className="text-5xl font-black opacity-25">0{indice + 1}</span>
                    </div>
                    <h3 className="mt-6 text-3xl font-black tracking-tight">{modalidad.titulo}</h3>
                    <p className="mt-1 font-bold opacity-80">{modalidad.vehiculo}</p>
                    <p className="mt-4 max-w-md text-pretty opacity-90">{modalidad.descripcion}</p>
                    <div className="mt-6 flex flex-wrap gap-2 text-sm font-extrabold">
                      <span className="rounded-full bg-black/10 px-3 py-1.5">{modalidad.tiempo}</span>
                      <span className="rounded-full bg-black/10 px-3 py-1.5">{modalidad.horario}</span>
                    </div>
                  </article>
                </Revelar>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
