"use client";

import { useRef } from "react";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  pausarFueraDeVista,
  ESCRITORIO_CON_MOVIMIENTO,
} from "@/lib/gsap";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";
import { IconoTrofeo, IconoCorazon, IconoGlobo } from "@/componentes/Iconos";

const ALIADOS = [
  "Alimentos Polar",
  "Coca-Cola FEMSA",
  "Alimentos Mary",
  "Natulac",
  "Pastas Ronco",
  "Alfonzo Rivas & Cía",
  "La Lucha",
];

const INICIATIVAS = [
  {
    Icono: IconoTrofeo,
    etiqueta: "10 años",
    titulo: "Carrera Sigo",
    texto: "15K, 10K y caminata 5K: cada año corremos junto a la familia margariteña.",
    color: "bg-azul text-white",
  },
  {
    Icono: IconoCorazon,
    etiqueta: "11ª edición",
    titulo: "Carrera Infantil Sigo",
    texto: "Los más pequeños de la casa también corren con nosotros en el C.C. Parque Costazul.",
    color: "bg-sol text-azul",
  },
  {
    Icono: IconoGlobo,
    etiqueta: "Promoción",
    titulo: "Aventura Sigo en Margarita",
    texto: "Compras que se convierten en paseos para descubrir la isla junto a nuestras marcas aliadas.",
    color: "bg-coral text-white",
  },
];

export function Comunidad() {
  const seccion = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(ESCRITORIO_CON_MOVIMIENTO, () => {
        // Marquesina infinita; el scroll la acelera momentáneamente
        const marquesina = gsap.to("[data-marquesina]", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
        pausarFueraDeVista(marquesina, document.querySelector("[data-marquesina]"));

        ScrollTrigger.create({
          trigger: seccion.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (instancia) => {
            const velocidad = Math.abs(instancia.getVelocity());
            if (velocidad < 200) return;
            const impulso = gsap.utils.clamp(1, 6, 1 + velocidad / 300);
            gsap.to(marquesina, {
              timeScale: impulso,
              duration: 0.2,
              overwrite: true,
              onComplete: () => {
                gsap.to(marquesina, { timeScale: 1, duration: 1, delay: 0.2, overwrite: true });
              },
            });
          },
        });
      });
    },
    { scope: seccion },
  );

  return (
    <section id="comunidad" ref={seccion} className="overflow-hidden px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <TituloSeccion
          etiqueta="Comunidad"
          titulo={
            <>
              Más que un súper,
              <span className="text-verde"> somos parte de la isla.</span>
            </>
          }
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {INICIATIVAS.map(({ Icono, etiqueta, titulo, texto, color }, indice) => (
            <Revelar key={titulo} retraso={indice * 0.1}>
              <article className={`flex h-full flex-col rounded-[2rem] p-7 transition-transform duration-300 hover:-rotate-1 hover:scale-[1.02] ${color}`}>
                <div className="flex items-center justify-between">
                  <Icono className="h-9 w-9" />
                  <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-extrabold">{etiqueta}</span>
                </div>
                <h3 className="mt-10 text-3xl font-black leading-tight">{titulo}</h3>
                <p className="mt-3 opacity-85">{texto}</p>
              </article>
            </Revelar>
          ))}
        </div>
      </div>

      {/* Marquesina de marcas aliadas */}
      <div className="mt-20" aria-label="Marcas aliadas">
        <p className="mb-5 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-gris">De la mano de marcas que quieres</p>
        <div className="sin-barra relative flex overflow-x-auto px-5 md:overflow-hidden md:px-0 md:[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <ul data-marquesina className="flex w-max shrink-0 gap-3 pr-3">
            {[...ALIADOS, ...ALIADOS].map((aliado, indice) => (
              <li
                key={`${aliado}-${indice}`}
                aria-hidden={indice >= ALIADOS.length}
                className={`whitespace-nowrap rounded-full bg-white px-6 py-3 text-lg font-black text-azul/70 ring-1 ring-azul/10 ${
                  indice >= ALIADOS.length ? "hidden md:block" : ""
                }`}
              >
                {aliado}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
