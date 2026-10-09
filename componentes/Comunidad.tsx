"use client";

import Image from "next/image";
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
import { MARCAS_ALIADAS } from "@/datos/aliados";

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
    color: "bg-coral-700 text-white",
  },
];

export function Comunidad() {
  const seccion = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(ESCRITORIO_CON_MOVIMIENTO, () => {
        // Solo aquí se activa el modo marquesina (duplicados + máscara); sin animación,
        // sin JS o en móvil queda una fila deslizable donde se ven todas las marcas
        const bloque = seccion.current?.querySelector<HTMLElement>("[data-bloque-marcas]");
        const region = bloque?.querySelector<HTMLElement>("[role='region']");
        if (bloque) bloque.dataset.animada = "";
        region?.removeAttribute("tabindex");

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

        return () => {
          if (bloque) delete bloque.dataset.animada;
          region?.setAttribute("tabindex", "0");
        };
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
              <article className={`flex h-full min-w-0 flex-col rounded-[2rem] p-7 [overflow-wrap:anywhere] transition-transform duration-300 hover:-rotate-1 hover:scale-[1.02] ${color}`}>
                <div className="flex items-center justify-between">
                  <Icono className="h-9 w-9" />
                  <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-extrabold">{etiqueta}</span>
                </div>
                <h3 className="mt-10 text-3xl font-black leading-tight">{titulo}</h3>
                <p className="mt-3 opacity-90">{texto}</p>
              </article>
            </Revelar>
          ))}
        </div>
      </div>

      {/* Marquesina de marcas aliadas (en móvil, fila deslizable) */}
      <div data-bloque-marcas className="group mt-20">
        <h3 className="mb-6 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-gris">
          De la mano de marcas que quieres
        </h3>
        {/* Región con foco para poder recorrerla con el teclado cuando es deslizable */}
        <div
          role="region"
          aria-label="Marcas aliadas"
          tabIndex={0}
          className="sin-barra relative flex overflow-x-auto px-5 group-data-[animada]:overflow-hidden group-data-[animada]:px-0 group-data-[animada]:[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        >
          <ul data-marquesina className="flex w-max shrink-0 gap-3 pr-3 md:gap-4 md:pr-4">
            {[...MARCAS_ALIADAS, ...MARCAS_ALIADAS].map((marca, indice) => {
              const duplicado = indice >= MARCAS_ALIADAS.length;
              return (
                <li
                  key={`${marca.nombre}-${indice}`}
                  aria-hidden={duplicado || undefined}
                  className={`h-24 w-40 shrink-0 items-center justify-center rounded-3xl bg-white p-4 shadow-sm ring-1 ring-azul/10 md:h-28 md:w-48 ${
                    duplicado ? "hidden group-data-[animada]:flex" : "flex"
                  }`}
                >
                  <Image
                    src={marca.logo}
                    alt={duplicado ? "" : marca.nombre}
                    sizes="12rem"
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-center text-[0.7rem] text-gris group-data-[animada]:hidden">Desliza para ver más →</p>
      </div>
    </section>
  );
}
