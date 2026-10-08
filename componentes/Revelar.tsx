"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PropsRevelar {
  children: ReactNode;
  retraso?: number;
  className?: string;
  desplazamiento?: number;
}

/** Aparece con fade + desplazamiento al entrar en el viewport */
export function Revelar({ children, retraso = 0, className, desplazamiento = 32 }: PropsRevelar) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: desplazamiento }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
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
          claro ? "bg-white/10 text-sol" : "bg-verde-100 text-verde"
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
        <p className={`mt-4 text-pretty text-lg ${claro ? "text-white/80" : "text-gris"}`}>{descripcion}</p>
      )}
    </Revelar>
  );
}

/** Curva de la sonrisa del logo, usada como subrayado de marca */
export function Sonrisa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 30" className={className} aria-hidden fill="none">
      <motion.path
        d="M6 6 Q100 46 194 6"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
      />
    </svg>
  );
}
