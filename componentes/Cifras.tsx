"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { calcularAniosTrayectoria } from "@/datos/contacto";
import { SUCURSALES } from "@/datos/sucursales";
import { TARIFAS_MUNICIPIO } from "@/datos/entregas";
import { Revelar } from "@/componentes/Revelar";

interface PropsContador {
  valor: number;
  sufijo?: string;
}

function Contador({ valor, sufijo = "" }: PropsContador) {
  const referencia = useRef<HTMLSpanElement>(null);
  const visible = useInView(referencia, { once: true, margin: "-10%" });
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const controles = animate(0, valor, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setActual(Math.round(v)),
    });
    return () => controles.stop();
  }, [visible, valor]);

  return (
    <span ref={referencia} aria-label={`${valor}${sufijo}`}>
      {actual}
      {sufijo}
    </span>
  );
}

export function Cifras() {
  const cifras = [
    { valor: calcularAniosTrayectoria(), sufijo: "", texto: "años sirviendo a Margarita" },
    { valor: SUCURSALES.length, sufijo: "", texto: "tiendas en la isla" },
    { valor: TARIFAS_MUNICIPIO.length, sufijo: "", texto: "municipios con delivery" },
    { valor: 4, sufijo: "", texto: "formas de recibir tu mercado" },
  ];

  return (
    <section aria-label="Sigo en cifras" className="relative -mt-10 px-5 sm:-mt-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cifras.map((cifra, indice) => (
          <Revelar key={cifra.texto} retraso={indice * 0.08}>
            <div className="h-full rounded-3xl bg-white p-5 shadow-xl shadow-azul/5 ring-1 ring-azul/5 sm:p-7">
              <p className="text-5xl font-black tracking-tight text-azul sm:text-6xl">
                <Contador valor={cifra.valor} sufijo={cifra.sufijo} />
              </p>
              <p className="mt-2 text-sm font-bold text-gris sm:text-base">{cifra.texto}</p>
            </div>
          </Revelar>
        ))}
      </div>
    </section>
  );
}
