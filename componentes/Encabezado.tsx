"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, CON_MOVIMIENTO, ESCRITORIO_CON_MOVIMIENTO } from "@/lib/gsap";
import logoSigo from "@/recursos/logo-sigo.png";
import { URL_ECOMMERCE } from "@/datos/contacto";
import { useTasa } from "@/componentes/ContextoTasa";
import { formatearFechaTasa } from "@/lib/useTasaBcv";
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
    <span
      title={formatearFechaTasa(tasa.fecha) ? `Tasa oficial BCV del ${formatearFechaTasa(tasa.fecha)}` : "Tasa oficial BCV"}
      className="hidden items-center gap-2 rounded-full bg-azul-100 px-3 py-1.5 text-xs font-bold text-azul xl:inline-flex"
    >
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
  const botonMenu = useRef<HTMLButtonElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);

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
          // Solo opacidad: con autoAlpha (visibility:hidden) el foco no podría entrar al panel
          .from(panelMenu.current, { opacity: 0, y: -20, duration: 0.35 })
          .from("[data-enlace-menu]", { opacity: 0, x: -20, stagger: 0.05, duration: 0.4 }, "-=0.15");
      });
    },
    { dependencies: [menuAbierto], scope: cabecera },
  );

  // Menú abierto: bloquea el scroll del fondo, enfoca "Cerrar", atrapa el foco y cierra con Escape
  useEffect(() => {
    if (!menuAbierto) return;
    const boton = botonMenu.current;
    document.body.style.overflow = "hidden";
    botonCerrar.current?.focus();

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setMenuAbierto(false);
        return;
      }
      if (evento.key !== "Tab" || !panelMenu.current) return;
      const enfocables = panelMenu.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (!primero || !ultimo) return;
      const fuera = !panelMenu.current.contains(document.activeElement);
      if (evento.shiftKey && (document.activeElement === primero || fuera)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && (document.activeElement === ultimo || fuera)) {
        evento.preventDefault();
        primero.focus();
      }
    }

    // Si el botón de menú deja de verse (rotar la tablet, ventana más ancha), se cierra
    // el panel; si no, el scroll quedaría bloqueado sin forma de desbloquearlo
    function alRedimensionar() {
      if (boton && boton.offsetParent === null) setMenuAbierto(false);
    }

    document.addEventListener("keydown", alPresionarTecla);
    window.addEventListener("resize", alRedimensionar);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", alPresionarTecla);
      window.removeEventListener("resize", alRedimensionar);
      // Devuelve el foco al botón que abrió el menú (sin mover la página)
      if (boton && boton.offsetParent !== null) boton.focus({ preventScroll: true });
    };
  }, [menuAbierto]);

  // Medidas no textuales en px: con el texto ampliado solo crece el texto y la cabecera sigue cabiendo
  return (
    <header ref={cabecera} className="fixed inset-x-0 top-0 z-50 px-[12px] pt-[12px] sm:px-[20px]">
      <div
        ref={barraProgreso}
        className="fixed inset-x-0 top-0 hidden h-1 origin-left bg-gradient-to-r from-verde-vivo to-sol md:block"
        aria-hidden
      />
      <nav
        aria-label="Principal"
        className={`nav-principal mx-auto flex max-w-6xl items-center justify-between gap-[12px] rounded-full py-[8px] pl-[12px] pr-[8px] transition-all duration-300 sm:pl-[16px] ${
          desplazado ? "bg-white shadow-lg shadow-azul/10" : "bg-white"
        }`}
      >
        <a href="#inicio" className="flex shrink-0 items-center" aria-label="SIGO, ir al inicio">
          <Image src={logoSigo} alt="SIGO" width={44} height={44} priority className="h-[40px] w-[40px] sm:h-[44px] sm:w-[44px]" />
        </a>

        <ul className="enlaces-principales hidden items-center gap-1 lg:flex">
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

        <div className="flex items-center gap-[8px]">
          <PildoraTasa />
          <a
            href={URL_ECOMMERCE}
            aria-label="Compra online"
            className="inline-flex shrink-0 items-center gap-[8px] rounded-full bg-verde px-[16px] py-[10px] text-sm font-extrabold text-white transition hover:bg-verde-700 sm:px-[20px]"
          >
            <IconoCarrito className="h-[16px] w-[16px]" />
            {/* Se oculta si la cabecera no tiene espacio (pantallas de 280 px o texto ampliado) */}
            <span className="texto-compra" aria-hidden>
              Compra online
            </span>
          </a>
          <button
            ref={botonMenu}
            type="button"
            data-boton-menu
            onClick={() => setMenuAbierto(true)}
            className="boton-menu grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full text-azul hover:bg-azul-100 lg:hidden"
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
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-azul px-6 pb-10 pt-6 text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white p-1">
              <Image src={logoSigo} alt="SIGO" width={44} height={44} className="h-11 w-11" />
            </span>
            <button
              ref={botonCerrar}
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
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-verde px-6 py-4 text-lg font-extrabold"
          >
            <IconoCarrito className="h-5 w-5" /> Compra online
          </a>
        </div>
      )}
    </header>
  );
}
