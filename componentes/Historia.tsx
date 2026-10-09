"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO, ESCRITORIO_CON_MOVIMIENTO } from "@/lib/gsap";
import { calcularAniosTrayectoria } from "@/datos/contacto";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";
import fotoPorlamar from "@/recursos/fotos/tienda-porlamar-2010.webp";

interface Hito {
  marca: string;
  titulo: string;
  texto: string;
  foto?: { imagen: StaticImageData; alt: string; pie: string };
}

export function Historia() {
  const referencia = useRef<HTMLDivElement>(null);

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
      });

      mm.add(ESCRITORIO_CON_MOVIMIENTO, () => {
        // Foto de archivo: pasa de sepia a color al recorrerla
        gsap.fromTo(
          "[data-foto-hito] img",
          { filter: "sepia(0.9) saturate(0.6)", scale: 1.12 },
          {
            filter: "sepia(0) saturate(1)",
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-foto-hito]", start: "top 85%", end: "bottom 45%", scrub: true },
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
      foto: {
        imagen: fotoPorlamar,
        alt: "Entrada central de Sigo en Porlamar en 2010, con el logo de la época en rosado",
        pie: "Sigo Porlamar, 2010 · Foto: Alfredo Guánchez · Google Maps",
      },
    },
    {
      marca: "Crecer",
      titulo: "Sigo Supermarket",
      texto: "Crecemos en Porlamar y llegamos a Parque Costazul y Sambil Margarita, con bodegones para importados y licores.",
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

        {/* Las líneas decorativas van fuera del <ol> para que la lista solo tenga <li> */}
        <div ref={referencia} className="relative mt-16 pl-10 md:pl-0">
          {/* Línea de tiempo que se dibuja con el scroll */}
          <div className="absolute bottom-0 left-[0.6rem] top-0 w-1 rounded-full bg-azul-100 md:left-1/2 md:-translate-x-1/2" aria-hidden />
          <div
            data-linea-progreso
            className="absolute bottom-0 left-[0.6rem] top-0 w-1 origin-top rounded-full bg-gradient-to-b from-verde-vivo to-azul md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />

          <ol className="space-y-12 sm:space-y-16">
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
                  <p className="text-[clamp(2rem,12vw,3rem)] font-black tracking-tight text-sol [overflow-wrap:anywhere] sm:text-6xl [-webkit-text-stroke:2px_var(--color-azul)]">
                    {hito.marca}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-azul">{hito.titulo}</h3>
                  <p className={`mt-2 max-w-md text-gris ${derecha ? "" : "md:ml-auto"}`}>{hito.texto}</p>
                  {hito.foto && (
                    <figure className={`mt-5 max-w-md ${derecha ? "" : "md:ml-auto"}`}>
                      <div data-foto-hito className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-azul-100">
                        <Image
                          src={hito.foto.imagen}
                          alt={hito.foto.alt}
                          fill
                          sizes="(min-width: 768px) 28rem, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="mt-2 text-xs text-gris">{hito.foto.pie}</figcaption>
                    </figure>
                  )}
                </Revelar>
              </li>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}
