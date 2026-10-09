"use client";

import { useRef } from "react";
import {
  gsap,
  useGSAP,
  pausarFueraDeVista,
  CON_MOVIMIENTO,
  SIN_MOVIMIENTO,
  ESCRITORIO_CON_MOVIMIENTO,
} from "@/lib/gsap";
import { URL_ECOMMERCE, calcularAniosTrayectoria } from "@/datos/contacto";
import { Sonrisa } from "@/componentes/Revelar";
import { formatearUsd } from "@/lib/useTasaBcv";
import { IconoCarrito, IconoChat, IconoUbicacion } from "@/componentes/Iconos";

const PALABRAS_TITULO = ["Sirviendo", "con", "amor"];

const LINEAS_VISTA_PREVIA = [
  { texto: "2 Harina P.A.N.", precio: 2.4 },
  { texto: "500 g Queso blanco", precio: 3.75 },
  { texto: "1 Docena de huevos", precio: 2.9 },
];
const TOTAL_VISTA_PREVIA = LINEAS_VISTA_PREVIA.reduce((suma, linea) => suma + linea.precio, 0);

// Vista previa del asistente: refuerza la función insignia desde el primer pliegue
function TarjetaVistaPrevia() {
  return (
    <div data-hero="tarjeta" className="relative mx-auto w-full max-w-sm">
      <div className="rounded-[2rem] bg-white p-5 text-tinta shadow-2xl shadow-azul-900/40">
        <div className="flex items-center gap-3 border-b border-azul-100 pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-verde text-white">
            <IconoChat className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-azul">Asistente Sigo</p>
            <p className="text-xs text-gris">Escribe tu lista, yo armo el carrito</p>
          </div>
        </div>
        <p
          data-hero="burbuja"
          className="ml-auto mt-4 w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-azul px-4 py-2.5 text-sm font-semibold text-white"
        >
          2 harinas pan, medio kilo de queso y una docena de huevos
        </p>
        <ul className="mt-3 space-y-2 rounded-2xl bg-crema p-3">
          {LINEAS_VISTA_PREVIA.map((linea) => (
            <li key={linea.texto} data-hero="linea" className="flex items-center justify-between text-sm">
              <span className="font-semibold">{linea.texto}</span>
              <span className="font-extrabold text-verde">{formatearUsd(linea.precio)}</span>
            </li>
          ))}
        </ul>
        <div
          data-hero="total"
          className="mt-3 flex items-center justify-between rounded-2xl bg-verde px-4 py-3 text-white"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <IconoCarrito className="h-4 w-4" /> Carrito listo
          </span>
          <span className="font-black">{formatearUsd(TOTAL_VISTA_PREVIA)}</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const seccion = useRef<HTMLElement>(null);
  const anios = calcularAniosTrayectoria();

  useGSAP(
    () => {
      // Si el respaldo de red lenta ya mostró el hero, no se repite la entrada (evita el parpadeo)
      const entradaPendiente = document.documentElement.classList.contains("js");
      window.__animacionesListas = true;
      const mm = gsap.matchMedia();

      // Sin animaciones: solo mostrar lo que el CSS ocultó para la entrada
      mm.add(SIN_MOVIMIENTO, () => {
        gsap.set("[data-hero]", { autoAlpha: 1 });
      });

      mm.add(CON_MOVIMIENTO, () => {
        if (!entradaPendiente) return;
        // Entrada
        const entrada = gsap.timeline({ defaults: { ease: "power3.out" } });
        entrada
          .fromTo("[data-hero='insignia']", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 })
          .fromTo(
            "[data-hero='palabra']",
            { autoAlpha: 0, yPercent: 60, rotate: 4 },
            { autoAlpha: 1, yPercent: 0, rotate: 0, stagger: 0.12, duration: 0.8 },
            "<0.1",
          )
          .fromTo("[data-hero='anio']", { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0 }, "-=0.45")
          .fromTo("[data-hero='texto']", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0 }, "-=0.3")
          .fromTo("[data-hero='botones']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0 }, "-=0.55")
          .fromTo(
            "[data-hero='tarjeta']",
            { autoAlpha: 0, y: 40, rotate: 3 },
            { autoAlpha: 1, y: 0, rotate: 0, duration: 1 },
            0.4,
          )
          .fromTo("[data-hero='burbuja']", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.1)
          .fromTo(
            "[data-hero='linea']",
            { autoAlpha: 0, x: -12 },
            { autoAlpha: 1, x: 0, stagger: 0.22, duration: 0.45 },
            1.7,
          )
          .fromTo(
            "[data-hero='total']",
            { autoAlpha: 0, scale: 0.85 },
            { autoAlpha: 1, scale: 1, ease: "back.out(2)", duration: 0.6 },
            2.5,
          );

      });

      // Bucles y parallax solo en pantallas grandes: en móvil cuestan más de lo que aportan
      mm.add(ESCRITORIO_CON_MOVIMIENTO, () => {
        // Olas en bucle: se mueve el <svg> completo (capa compuesta), no el path
        const olas = gsap.to("[data-hero-ola]", { xPercent: -50, duration: 18, ease: "none", repeat: -1 });
        pausarFueraDeVista(olas, seccion.current);

        const flotar = gsap.to("[data-hero-flotar]", { y: -10, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });
        pausarFueraDeVista(flotar, seccion.current);

        const alScroll = { trigger: seccion.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-contenido]", { yPercent: 35, ease: "none", scrollTrigger: alScroll });
        gsap.to("[data-hero-contenido]", {
          opacity: 0,
          ease: "none",
          scrollTrigger: { ...alScroll, end: "70% top" },
        });
        gsap.to("[data-hero-sol]", { yPercent: 60, ease: "none", scrollTrigger: alScroll });
        gsap.to("[data-hero-escala]", { scale: 0.85, ease: "none", scrollTrigger: alScroll });
      });
    },
    { scope: seccion },
  );

  return (
    <section
      id="inicio"
      ref={seccion}
      className="relative isolate overflow-hidden bg-azul pb-28 pt-28 text-white sm:pb-36 sm:pt-36"
    >
      {/* Sol y brillo de fondo: guiño a la isla */}
      <div
        data-hero-sol
        className="absolute -right-28 -top-28 -z-10 h-64 w-64 rounded-full bg-sol/90 sm:-right-24 sm:-top-24 sm:h-[26rem] sm:w-[26rem] lg:-right-10 lg:h-[36rem] lg:w-[36rem]"
        aria-hidden
      />
      <div
        className="absolute -left-40 top-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(0_168_7/0.28),transparent)]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div data-hero-contenido className="min-w-0">
          <p
            data-hero="insignia"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold"
          >
            <IconoUbicacion className="h-4 w-4 text-sol" />
            Isla de Margarita · {anios} años contigo
          </p>
          <h1 className="text-[clamp(2.9rem,10vw,6.2rem)] font-black leading-[0.92] tracking-tight">
            <span className="sr-only">SIGO Supermercados: </span>
            {PALABRAS_TITULO.map((palabra) => (
              <span key={palabra} data-hero="palabra" className="mr-[0.22em] inline-block">
                {palabra}
              </span>
            ))}
            <span data-hero="anio" className="relative block text-sol">
              desde 1972
              <Sonrisa retraso={1} className="pointer-events-none absolute left-[0.04em] top-full mt-[0.04em] w-[min(70%,20rem)] text-verde-vivo" />
            </span>
          </h1>
          <p data-hero="texto" className="mt-16 max-w-xl sm:mt-20 text-pretty text-lg text-white/85 sm:text-xl">
            El supermercado de la familia margariteña. Ocho tiendas, delivery a toda la isla y ahora tu mercado a
            un mensaje de distancia.
          </p>
          <div data-hero="botones" className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={URL_ECOMMERCE}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-verde-vivo px-7 py-4 text-lg font-extrabold shadow-lg shadow-verde/30 transition hover:-translate-y-0.5 hover:bg-verde"
            >
              <IconoCarrito className="h-5 w-5" /> Compra online
            </a>
            <a
              href="#asistente"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-extrabold text-azul transition hover:-translate-y-0.5"
            >
              <IconoChat className="h-5 w-5" /> Escribe tu lista
            </a>
          </div>
        </div>

        <div data-hero-escala className="relative min-w-0">
          <div data-hero-flotar>
            <TarjetaVistaPrevia />
          </div>
        </div>
      </div>

      {/* Olas animadas en la base del hero */}
      <svg
        data-hero-ola
        className="absolute bottom-0 left-0 -z-0 h-20 w-[200%] text-crema sm:h-28"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 60 C240 120 480 0 720 60 S1200 120 1440 60 S1920 0 2160 60 S2640 120 2880 60 V120 H0Z"
        />
      </svg>
    </section>
  );
}
