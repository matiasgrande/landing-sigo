"use client";

// Punto único de registro de GSAP y sus plugins
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, Flip, DrawSVGPlugin, useGSAP);

gsap.defaults({ ease: "power3.out", duration: 0.8 });

/** Consultas para respetar "reducir movimiento" del sistema */
export const CON_MOVIMIENTO = "(prefers-reduced-motion: no-preference)";
export const SIN_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

declare global {
  interface Window {
    __animacionesListas?: boolean;
  }
}

export { gsap, ScrollTrigger, Flip, useGSAP };
