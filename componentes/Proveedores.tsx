"use client";

import { useEffect, type ReactNode } from "react";
import { revelarAlEnfocar } from "@/lib/gsap";
import { ProveedorTasa } from "@/componentes/ContextoTasa";

/** En filas deslizables (filtros, chips) el control enfocado con teclado se desplaza a la vista */
function mostrarEnCarrusel(evento: FocusEvent): void {
  const objetivo = evento.target;
  if (!(objetivo instanceof HTMLElement) || !objetivo.closest(".sin-barra")) return;
  objetivo.scrollIntoView({ inline: "nearest", block: "nearest" });
}

/** Proveedores globales del cliente (tasa BCV compartida) */
export function Proveedores({ children }: { children: ReactNode }) {
  // Lo que se enfoca con teclado se revela aunque su animación de scroll no haya corrido
  useEffect(() => {
    document.addEventListener("focusin", revelarAlEnfocar);
    document.addEventListener("focusin", mostrarEnCarrusel);
    return () => {
      document.removeEventListener("focusin", revelarAlEnfocar);
      document.removeEventListener("focusin", mostrarEnCarrusel);
    };
  }, []);
  return <ProveedorTasa>{children}</ProveedorTasa>;
}
