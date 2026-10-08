"use client";

import { useRef } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO } from "@/lib/gsap";
import { calcularAniosTrayectoria } from "@/datos/contacto";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";

interface Hito {
  marca: string;
  titulo: string;
  texto: string;
}

export function Historia() {
  const referencia = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        // La línea se dibuja a medida que bajas
        gsap.fromTo(
          "[data-linea-progreso]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: referencia.current, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
          },
        );
        // Cada punto "se enciende" al alcanzarlo
        gsap.utils.toArray<HTMLElement>("[data-punto-hito]").forEach((punto) => {
          gsap.from(punto, {
            scale: 0,
            duration: 0.5,
            ease: "back.out(3)",
            scrollTrigger: { trigger: punto, start: "top 70%", once: true },
          });
        });
      });
    },
    { scope: referencia },
  );
  const anios = calcularAniosTrayectoria();

  const hitos: Hito[] = [
    {
      marca: "1972",
      titulo: "Un sueño en el Boulevard Guevara",
      texto: "José Martínez Valenzuela abre su primer negocio en pleno corazón de Porlamar.",
    },
    {
      marca: "Raíces",
      titulo: "La Proveeduría",
      texto: "El negocio crece y se convierte en La Proveeduría, en Pedregales y Porlamar: la base de lo que hoy es Sigo.",
    },
    {
      marca: "Crecer",
      titulo: "Sigo Supermarket",
      texto: "Llegamos a Parque Porlamar, Parque Costazul y Sambil Margarita, con bodegones para importados y licores.",
    },
    {
      marca: "Digital",
      titulo: "Tu súper en línea",
      texto: "Abrimos la tienda online con delivery a toda la isla, retiro en tu vehículo y Sigo Créditos.",
    },
    {
      marca: "Comunidad",
      titulo: "La Carrera Sigo",
      texto: "Diez años corriendo junto a Margarita, más la carrera infantil que ya va por su 11ª edición.",
    },
    {
      marca: "Hoy",
      titulo: `${anios} años y seguimos creciendo`,
      texto: "Ocho tiendas, Sigo + dentro de los hoteles de la isla y nuevas formas de comprar, como escribir tu lista.",
    },
  ];

  return (
    <section id="historia" className="bg-white px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <TituloSeccion
          etiqueta="Nuestra historia"
          titulo={
            <>
              Más de medio siglo
              <span className="text-verde"> creando posibilidades.</span>
            </>
          }
          descripcion="Somos una empresa margariteña, hecha por y para la gente de la isla."
        />

        <ol ref={referencia} className="relative mt-16 space-y-12 pl-10 sm:space-y-16 md:pl-0">
          {/* Línea de tiempo que se dibuja con el scroll */}
          <div className="absolute bottom-0 left-[0.6rem] top-0 w-1 rounded-full bg-azul-100 md:left-1/2 md:-translate-x-1/2" aria-hidden />
          <div
            data-linea-progreso
            className="absolute bottom-0 left-[0.6rem] top-0 w-1 origin-top rounded-full bg-gradient-to-b from-verde-vivo to-azul md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />

          {hitos.map((hito, indice) => {
            const derecha = indice % 2 === 1;
            return (
              <li key={hito.titulo} className="relative md:grid md:grid-cols-2 md:gap-16">
                <span
                  data-punto-hito
                  className="absolute -left-10 top-2 grid h-6 w-6 place-items-center rounded-full bg-white ring-4 ring-verde md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                >
                  <span className="h-2 w-2 rounded-full bg-azul" />
                </span>
                <Revelar
                  className={derecha ? "md:col-start-2" : "md:text-right"}
                  desplazamiento={40}
                >
                  <p className="text-5xl font-black tracking-tight text-sol sm:text-6xl [-webkit-text-stroke:1.5px_var(--color-azul)]">
                    {hito.marca}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-azul">{hito.titulo}</h3>
                  <p className={`mt-2 max-w-md text-gris ${derecha ? "" : "md:ml-auto"}`}>{hito.texto}</p>
                </Revelar>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
