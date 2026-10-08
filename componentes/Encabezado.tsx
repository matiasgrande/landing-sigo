"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
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
  const { scrollYProgress } = useScroll();
  const progreso = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 24);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  // Bloquea el scroll del fondo con el menú móvil abierto
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <motion.div
        className="fixed inset-x-0 top-0 h-1 origin-left bg-gradient-to-r from-verde-vivo to-sol"
        style={{ scaleX: progreso }}
        aria-hidden
      />
      <nav
        aria-label="Principal"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pl-3 pr-2 transition-all duration-300 sm:pl-4 ${
          desplazado ? "bg-white/90 shadow-lg shadow-azul/10 backdrop-blur-md" : "bg-white"
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

      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-azul px-6 pb-10 pt-6 text-white lg:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
              {ENLACES.map((enlace, indice) => (
                <motion.li
                  key={enlace.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * indice }}
                >
                  <a
                    href={enlace.href}
                    onClick={() => setMenuAbierto(false)}
                    className="block py-3 text-3xl font-black tracking-tight"
                  >
                    {enlace.texto}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href={URL_ECOMMERCE}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-verde-vivo px-6 py-4 text-lg font-extrabold"
            >
              <IconoCarrito className="h-5 w-5" /> Compra online
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
