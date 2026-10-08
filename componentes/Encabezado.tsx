"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, CON_MOVIMIENTO, ESCRITORIO_CON_MOVIMIENTO } from "@/lib/gsap";
import logoSigo from "@/recursos/logo-sigo.png";
import { URL_ECOMMERCE } from "@/datos/contacto";
import { useTasa } from "@/componentes/ContextoTasa";
import { IconoCarrito, IconoCerrar, IconoMenu } from "@/componentes/Iconos";

const ENLACES = [
  { href: "#asistente", texto: "Arma tu lista" },
  { href: "#tiendas", texto: "Tiendas" },
  { href: "#entregas", texto: "Delivery" },
  { href: "#creditos", texto: "Sigo Créditos" },
  { href: "#historia", texto: "Historia" },
] as const;

function PildoraTasa() {
  const { tasa } = useTasa();
  if (!tasa) return null;
  return (
    <span className="hidden items-center gap-2 rounded-full bg-azul-100 px-3 py-1.5 text-xs font-bold text-azul xl:inline-flex">
      <span className="h-2 w-2 rounded-full bg-verde-vivo" aria-hidden />
      BCV Bs. {tasa.valor.toLocaleString("es-VE", { maximumFractionDigits: 2 })}
    </span>
  );
}

export function Encabezado() {
  const [desplazado, setDesplazado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cabecera = useRef<HTMLElement>(null);
  const barraProgreso = useRef<HTMLDivElement>(null);
  const panelMenu = useRef<HTMLDivElement>(null);

  // Barra de progreso de lectura y estado "desplazado" de la cabecera
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(ESCRITORIO_CON_MOVIMIENTO, () => {
        gsap.fromTo(
          barraProgreso.current,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
        );
      });
      ScrollTrigger.create({
        start: 24,
        end: "max",
        onToggle: (instancia) => setDesplazado(instancia.isActive),
      });
    },
    { scope: cabecera },
  );

  // Entrada del menú móvil
  useGSAP(
    () => {
      if (!menuAbierto || !panelMenu.current) return;
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        gsap
          .timeline()
          .from(panelMenu.current, { autoAlpha: 0, y: -20, duration: 0.35 })
          .from("[data-enlace-menu]", { autoAlpha: 0, x: -20, stagger: 0.05, duration: 0.4 }, "-=0.15");
      });
    },
    { dependencies: [menuAbierto], scope: cabecera },
  );

  // Bloquea el scroll del fondo con el menú móvil abierto
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  return (
    <header ref={cabecera} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        ref={barraProgreso}
        className="fixed inset-x-0 top-0 hidden h-1 origin-left bg-gradient-to-r from-verde-vivo to-sol md:block"
        aria-hidden
      />
      <nav
        aria-label="Principal"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pl-3 pr-2 transition-all duration-300 sm:pl-4 ${
          desplazado ? "bg-white shadow-lg shadow-azul/10" : "bg-white"
        }`}
      >
        <a href="#inicio" className="flex shrink-0 items-center" aria-label="SIGO, ir al inicio">
          <Image src={logoSigo} alt="SIGO" width={44} height={44} priority className="h-10 w-10 sm:h-11 sm:w-11" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {ENLACES.map((enlace) => (
            <li key={enlace.href}>
              <a
                href={enlace.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-azul transition-colors hover:bg-azul-100"
              >
                {enlace.texto}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <PildoraTasa />
          <a
            href={URL_ECOMMERCE}
            className="inline-flex items-center gap-2 rounded-full bg-verde px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-verde-vivo sm:px-5"
          >
            <IconoCarrito className="h-4 w-4" />
            <span>Compra online</span>
          </a>
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="grid h-11 w-11 place-items-center rounded-full text-azul hover:bg-azul-100 lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
          >
            <IconoMenu />
          </button>
        </div>
      </nav>

      {menuAbierto && (
        <div
          ref={panelMenu}
          className="fixed inset-0 z-50 flex flex-col bg-azul px-6 pb-10 pt-6 text-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white p-1">
              <Image src={logoSigo} alt="SIGO" width={44} height={44} className="h-11 w-11" />
            </span>
            <button
              type="button"
              onClick={() => setMenuAbierto(false)}
              className="grid h-12 w-12 place-items-center rounded-full bg-white/10"
              aria-label="Cerrar menú"
            >
              <IconoCerrar />
            </button>
          </div>
          <ul className="mt-12 flex flex-col gap-2">
            {ENLACES.map((enlace) => (
              <li key={enlace.href} data-enlace-menu>
                <a
                  href={enlace.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block py-3 text-3xl font-black tracking-tight"
                >
                  {enlace.texto}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={URL_ECOMMERCE}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-verde-vivo px-6 py-4 text-lg font-extrabold"
          >
            <IconoCarrito className="h-5 w-5" /> Compra online
          </a>
        </div>
      )}
    </header>
  );
}
