"use client";

import { useRef } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO } from "@/lib/gsap";
import { calcularAniosTrayectoria } from "@/datos/contacto";
import { SUCURSALES } from "@/datos/sucursales";
import { TARIFAS_MUNICIPIO } from "@/datos/entregas";
import { Revelar } from "@/componentes/Revelar";

function Contador({ valor }: { valor: number }) {
  const referencia = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const elemento = referencia.current;
    if (!elemento) return;
    const mm = gsap.matchMedia();
    mm.add(CON_MOVIMIENTO, () => {
      const contador = { actual: 0 };
      elemento.textContent = "0";
      gsap.to(contador, {
        actual: valor,
        duration: 1.6,
        snap: { actual: 1 },
        onUpdate: () => {
          elemento.textContent = String(contador.actual);
        },
        scrollTrigger: { trigger: elemento, start: "top 92%", once: true },
      });
      // Al revertir (cambio de preferencia o desmontaje) se restaura el valor real
      return () => {
        elemento.textContent = String(valor);
      };
    });
  });

  // El HTML estático ya trae el valor final (SEO y sin JS)
  return <span ref={referencia}>{valor}</span>;
}

export function Cifras() {
  const cifras = [
    { valor: calcularAniosTrayectoria(), texto: "años sirviendo a Margarita" },
    { valor: SUCURSALES.length, texto: "tiendas en la isla" },
    { valor: TARIFAS_MUNICIPIO.length, texto: "municipios con delivery" },
    { valor: 4, texto: "formas de recibir tu mercado" },
  ];

  return (
    <section aria-label="Sigo en cifras" className="relative -mt-10 px-5 sm:-mt-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cifras.map((cifra, indice) => (
          <Revelar key={cifra.texto} retraso={indice * 0.08}>
            <div className="h-full rounded-3xl bg-white p-5 shadow-xl shadow-azul/5 ring-1 ring-azul/5 sm:p-7">
              <p className="text-5xl font-black tabular-nums tracking-tight text-azul sm:text-6xl">
                <Contador valor={cifra.valor} />
              </p>
              <p className="mt-2 text-sm font-bold text-gris sm:text-base">{cifra.texto}</p>
            </div>
          </Revelar>
        ))}
      </div>
    </section>
  );
}
