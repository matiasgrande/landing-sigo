"use client";

import { useEffect, type ReactNode } from "react";
import { revelarAlEnfocar } from "@/lib/gsap";
import { ProveedorTasa } from "@/componentes/ContextoTasa";

/** Proveedores globales del cliente (tasa BCV compartida) */
export function Proveedores({ children }: { children: ReactNode }) {
  // Lo que se enfoca con teclado se revela aunque su animación de scroll no haya corrido
  useEffect(() => {
    document.addEventListener("focusin", revelarAlEnfocar);
    return () => document.removeEventListener("focusin", revelarAlEnfocar);
  }, []);
  return <ProveedorTasa>{children}</ProveedorTasa>;
}
