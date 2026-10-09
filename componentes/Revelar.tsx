"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO } from "@/lib/gsap";

interface PropsRevelar {
  children: ReactNode;
  retraso?: number;
  className?: string;
  desplazamiento?: number;
  /** Etiqueta a renderizar: "li" cuando es hijo directo de una lista */
  como?: "div" | "li";
}

/** Aparece con fade + desplazamiento al entrar en el viewport */
export function Revelar({ children, retraso = 0, className, desplazamiento = 32, como = "div" }: PropsRevelar) {
  const referencia = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        // Solo opacidad: con autoAlpha (visibility:hidden) el contenido no recibe foco de teclado
        gsap.from(referencia.current, {
          opacity: 0,
          y: desplazamiento,
          delay: retraso,
          scrollTrigger: { trigger: referencia.current, start: "top bottom", once: true },
        });
      });
    },
    { scope: referencia },
  );

  const asignar = (elemento: HTMLElement | null) => {
    referencia.current = elemento;
  };
  return como === "li" ? (
    <li ref={asignar} className={className}>
      {children}
    </li>
  ) : (
    <div ref={asignar} className={className}>
      {children}
    </div>
  );
}

interface PropsTituloSeccion {
  etiqueta: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  claro?: boolean;
  centrado?: boolean;
}

export function TituloSeccion({ etiqueta, titulo, descripcion, claro = false, centrado = false }: PropsTituloSeccion) {
  return (
    <Revelar className={`max-w-2xl ${centrado ? "mx-auto text-center" : ""}`}>
      <p
        className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${
          claro ? "bg-white text-verde" : "bg-verde-100 text-verde"
        }`}
      >
        {etiqueta}
      </p>
      <h2
        className={`text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl ${
          claro ? "text-white" : "text-azul"
        }`}
      >
        {titulo}
      </h2>
      {descripcion && (
        <p className={`mt-4 text-pretty text-lg ${claro ? "text-white/90" : "text-gris"}`}>{descripcion}</p>
      )}
    </Revelar>
  );
}

/** Curva de la sonrisa del logo; se dibuja con DrawSVG */
export function Sonrisa({ className, retraso = 0.4 }: { className?: string; retraso?: number }) {
  const trazo = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(CON_MOVIMIENTO, () => {
      gsap.from(trazo.current, {
        drawSVG: "0%",
        duration: 1,
        delay: retraso,
        ease: "power2.inOut",
        scrollTrigger: { trigger: trazo.current, start: "top 95%", once: true },
      });
    });
  });

  return (
    <svg viewBox="0 0 200 30" className={className} aria-hidden fill="none">
      <path ref={trazo} d="M6 6 Q100 46 194 6" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
