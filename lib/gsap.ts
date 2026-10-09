"use client";

// Punto único de registro de GSAP y sus plugins
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

gsap.defaults({ ease: "power3.out", duration: 0.8 });

// En móvil la barra de direcciones cambia el alto al hacer scroll: no recalcular por eso
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

/** Consultas para respetar "reducir movimiento" del sistema */
export const CON_MOVIMIENTO = "(prefers-reduced-motion: no-preference)";
export const SIN_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

/** Efectos costosos (parallax con scrub, filtros, clip-path) solo en pantallas grandes */
export const ESCRITORIO_CON_MOVIMIENTO = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/** Pausa una animación infinita mientras su contenedor no está en pantalla */
export function pausarFueraDeVista(animacion: gsap.core.Animation, contenedor: Element | null): void {
  if (!contenedor) return;
  ScrollTrigger.create({
    trigger: contenedor,
    start: "top bottom",
    end: "bottom top",
    onToggle: (instancia) => {
      if (instancia.isActive) animacion.play();
      else animacion.pause();
    },
  });
}

/**
 * Si un elemento recibe el foco (teclado) mientras su animación de entrada por scroll
 * aún no ha corrido, la completa al instante para que lo enfocado siempre sea visible.
 * No toca animaciones con scrub ni bucles infinitos.
 */
export function revelarAlEnfocar(evento: FocusEvent): void {
  for (let nodo = evento.target instanceof Element ? evento.target : null; nodo; nodo = nodo.parentElement) {
    for (const animacion of gsap.getTweensOf(nodo)) {
      const disparador = animacion.scrollTrigger;
      if (!disparador || disparador.vars.scrub || animacion.repeat() === -1) continue;
      animacion.progress(1);
    }
  }
}

declare global {
  interface Window {
    __animacionesListas?: boolean;
  }
}

export { gsap, ScrollTrigger, useGSAP };
