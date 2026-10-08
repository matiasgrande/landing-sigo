"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, Flip, CON_MOVIMIENTO } from "@/lib/gsap";
import {
  SUCURSALES,
  ETIQUETAS_FORMATO,
  crearEnlaceMapa,
  estaAbierta,
  type FormatoSucursal,
} from "@/datos/sucursales";
import { WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { TituloSeccion } from "@/componentes/Revelar";
import { IconoUbicacion, IconoWhatsApp, IconoTienda, IconoFlecha, IconoReloj } from "@/componentes/Iconos";
import fotoCostazul from "@/recursos/fotos/tienda-costazul.webp";

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

/** Estado abierto/cerrado calculado solo en el cliente (evita desajustes de hidratación) */
function useEstadosApertura(): Record<string, boolean | null> {
  const [estados, setEstados] = useState<Record<string, boolean | null>>({});
  useEffect(() => {
    const calcular = () =>
      setEstados(Object.fromEntries(SUCURSALES.map((s) => [s.id, estaAbierta(s)])));
    calcular();
    const intervalo = window.setInterval(calcular, 60_000);
    return () => window.clearInterval(intervalo);
  }, []);
  return estados;
}

export function Sucursales() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const seccion = useRef<HTMLElement>(null);
  const estadoFlip = useRef<Flip.FlipState | null>(null);
  const estados = useEstadosApertura();

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

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        // Foto principal: se abre con clip-path y hace parallax mientras pasa
        gsap.fromTo(
          "[data-foto-principal]",
          { clipPath: "inset(12% 8% 12% 8% round 2rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 2rem)",
            ease: "none",
            scrollTrigger: { trigger: "[data-foto-principal]", start: "top 90%", end: "top 35%", scrub: true },
          },
        );
        gsap.fromTo(
          "[data-foto-principal] img",
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 8,
            scale: 1.05,
            ease: "none",
            scrollTrigger: { trigger: "[data-foto-principal]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        // Entrada escalonada de las tarjetas
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

        {/* Foto real de tienda con revelado y parallax */}
        <figure
          data-foto-principal
          className="relative mt-12 aspect-[4/3] overflow-hidden rounded-[2rem] bg-azul-100 sm:aspect-[16/7]"
        >
          <Image
            src={fotoCostazul}
            alt="Sigo Supermarket en el C.C. Parque Costazul, con el mural «Servimos con amor»"
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-azul-900/85 via-azul-900/10 to-transparent" aria-hidden />
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <span>
              <span className="block text-2xl font-black sm:text-3xl">Servimos con amor</span>
              <span className="text-sm font-semibold text-white/80">Sigo Supermarket Costazul</span>
            </span>
            <span className="text-[0.7rem] text-white/60">Foto: Rossmar Maicán · Google Maps</span>
          </figcaption>
        </figure>

        <div
          role="group"
          aria-label="Filtrar tiendas por formato"
          className="sin-barra -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0"
        >
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
                {activo && <span data-flip-id="filtro-activo" className="absolute inset-0 rounded-full bg-azul" />}
                <span className="relative">{opcion.texto}</span>
              </button>
            );
          })}
        </div>

        <ul data-rejilla-sucursales className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUCURSALES.map((sucursal) => {
            const abierta = estados[sucursal.id];
            return (
              <li
                key={sucursal.id}
                data-sucursal={sucursal.id}
                style={{ display: filtro !== "todas" && sucursal.formato !== filtro ? "none" : undefined }}
                className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-crema ring-1 ring-azul/5 transition-shadow hover:shadow-xl hover:shadow-azul/10"
              >
                {sucursal.foto && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={sucursal.foto.imagen}
                      alt={sucursal.foto.alt}
                      fill
                      sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-3 text-[0.65rem] font-semibold text-white drop-shadow">
                      {sucursal.foto.credito}
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${ESTILO_FORMATO[sucursal.formato]}`}>
                      {ETIQUETAS_FORMATO[sucursal.formato]}
                    </span>
                    {abierta !== undefined && abierta !== null ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                          abierta ? "bg-verde-100 text-verde" : "bg-coral/15 text-[#b4371c]"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${abierta ? "bg-verde-vivo" : "bg-coral"}`} aria-hidden />
                        {abierta ? "Abierto ahora" : "Cerrado ahora"}
                      </span>
                    ) : (
                      sucursal.destacado && (
                        <span className="text-right text-xs font-bold text-verde">{sucursal.destacado}</span>
                      )
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
                  {sucursal.horario && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-gris">
                      <IconoReloj className="h-4 w-4 shrink-0" />
                      <span>
                        {sucursal.horario.texto}
                        {sucursal.telefono && (
                          <>
                            {" · "}
                            <a href={`tel:${sucursal.telefono.replace(/[^+\d]/g, "")}`} className="font-bold text-azul underline-offset-2 hover:underline">
                              {sucursal.telefono}
                            </a>
                          </>
                        )}
                      </span>
                    </p>
                  )}
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
                        `¡Hola Sigo! Quisiera información sobre ${sucursal.nombre}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2.5 text-sm font-extrabold text-verde ring-1 ring-verde/20 transition hover:bg-verde-100"
                    >
                      <IconoWhatsApp className="h-4 w-4" /> {sucursal.horario ? "Escríbenos" : "Horario"}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-gris">
          Horarios de referencia según Google Maps; pueden variar en feriados y temporada.
        </p>
      </div>
    </section>
  );
}
