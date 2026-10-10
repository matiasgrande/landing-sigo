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
/** Service worker solo en producción (en desarrollo cachearía código viejo) */
function registrarServiceWorker(): void {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  const base = process.env.NEXT_PUBLIC_RUTA_BASE ?? "";
  navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {
    // Sin service worker la página funciona igual, solo que sin modo sin conexión
  });
}

export function Proveedores({ children }: { children: ReactNode }) {
  // Lo que se enfoca con teclado se revela aunque su animación de scroll no haya corrido
  useEffect(() => {
    document.addEventListener("focusin", revelarAlEnfocar);
    document.addEventListener("focusin", mostrarEnCarrusel);
    registrarServiceWorker();
    return () => {
      document.removeEventListener("focusin", revelarAlEnfocar);
      document.removeEventListener("focusin", mostrarEnCarrusel);
    };
  }, []);
  return <ProveedorTasa>{children}</ProveedorTasa>;
}
