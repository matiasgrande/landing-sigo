"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, Flip, CON_MOVIMIENTO } from "@/lib/gsap";
import {
  SUCURSALES,
  ETIQUETAS_FORMATO,
  crearEnlaceMapa,
  type FormatoSucursal,
} from "@/datos/sucursales";
import { WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { TituloSeccion } from "@/componentes/Revelar";
import { IconoUbicacion, IconoWhatsApp, IconoTienda, IconoFlecha } from "@/componentes/Iconos";

type Filtro = "todas" | FormatoSucursal;

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: "todas", texto: "Todas" },
  { valor: "supermarket", texto: "Supermarket" },
  { valor: "bodegon", texto: "Bodegón" },
  { valor: "sigo-mas", texto: "Sigo +" },
];

const ESTILO_FORMATO: Record<FormatoSucursal, string> = {
  supermarket: "bg-azul text-white",
  bodegon: "bg-sol text-azul",
  "sigo-mas": "bg-verde text-white",
};

export function Sucursales() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const seccion = useRef<HTMLElement>(null);
  const estadoFlip = useRef<Flip.FlipState | null>(null);

  // Guarda posiciones antes del cambio para animarlas con Flip después del render
  function cambiarFiltro(nuevo: Filtro) {
    if (nuevo === filtro) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      estadoFlip.current = Flip.getState("[data-sucursal], [data-flip-id='filtro-activo']");
    }
    setFiltro(nuevo);
  }

  useGSAP(
    () => {
      const estado = estadoFlip.current;
      if (!estado) return;
      estadoFlip.current = null;
      Flip.from(estado, {
        targets: "[data-sucursal], [data-flip-id='filtro-activo']",
        duration: 0.6,
        ease: "power2.inOut",
        absolute: true,
        nested: true,
        onEnter: (elementos) =>
          gsap.fromTo(elementos, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5, delay: 0.1 }),
        onLeave: (elementos) => gsap.to(elementos, { autoAlpha: 0, scale: 0.9, duration: 0.3 }),
      });
    },
    { dependencies: [filtro], scope: seccion },
  );

  // Entrada escalonada de las tarjetas al llegar a la sección
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        gsap.from("[data-sucursal]", {
          autoAlpha: 0,
          y: 40,
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-rejilla-sucursales]", start: "top 85%", once: true },
        });
      });
    },
    { scope: seccion },
  );

  return (
    <section id="tiendas" ref={seccion} className="bg-white px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <TituloSeccion
            etiqueta="Encuentra tu Sigo"
            titulo={
              <>
                Ocho tiendas,
                <span className="text-verde"> una sola familia.</span>
              </>
            }
            descripcion="Supermarkets en los centros comerciales, bodegones para tus importados y licores, y Sigo + cerca de ti, incluso dentro de tu hotel."
          />
            <div role="group" aria-label="Filtrar tiendas por formato" className="sin-barra -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
              {FILTROS.map((opcion) => {
                const activo = filtro === opcion.valor;
                return (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => cambiarFiltro(opcion.valor)}
                    aria-pressed={activo}
                    className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold transition-colors ${
                      activo ? "text-white" : "bg-crema text-azul hover:bg-azul-100"
                    }`}
                  >
                    {activo && (
                      <span data-flip-id="filtro-activo" className="absolute inset-0 rounded-full bg-azul" />
                    )}
                    <span className="relative">{opcion.texto}</span>
                  </button>
                );
              })}
            </div>
        </div>

        <ul data-rejilla-sucursales className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUCURSALES.map((sucursal) => (
              <li
                key={sucursal.id}
                data-sucursal={sucursal.id}
                style={{ display: filtro !== "todas" && sucursal.formato !== filtro ? "none" : undefined }}
                className="group flex flex-col rounded-[1.75rem] bg-crema p-6 ring-1 ring-azul/5 transition-shadow hover:shadow-xl hover:shadow-azul/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${ESTILO_FORMATO[sucursal.formato]}`}>
                    {ETIQUETAS_FORMATO[sucursal.formato]}
                  </span>
                  {sucursal.destacado && (
                    <span className="text-right text-xs font-bold text-verde">{sucursal.destacado}</span>
                  )}
                </div>
                <h3 className="mt-5 flex items-start gap-2 text-xl font-black leading-tight text-azul">
                  <IconoTienda className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
                  {sucursal.nombre}
                </h3>
                <p className="mt-2 flex items-start gap-2 text-sm text-gris">
                  <IconoUbicacion className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {sucursal.ubicacion}
                    <span className="block font-bold text-tinta/70">{sucursal.zona}</span>
                  </span>
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {sucursal.servicios.map((servicio) => (
                    <li key={servicio} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-azul">
                      {servicio}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                  <a
                    href={crearEnlaceMapa(sucursal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-azul px-3 py-2.5 text-sm font-extrabold text-white transition hover:bg-azul-700"
                  >
                    Cómo llegar <IconoFlecha className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href={crearEnlaceWhatsApp(
                      WHATSAPP_ATENCION,
                      `¡Hola Sigo! Quisiera información sobre ${sucursal.nombre} (horario y disponibilidad).`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2.5 text-sm font-extrabold text-verde ring-1 ring-verde/20 transition hover:bg-verde-100"
                  >
                    <IconoWhatsApp className="h-4 w-4" /> Horario
                  </a>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
