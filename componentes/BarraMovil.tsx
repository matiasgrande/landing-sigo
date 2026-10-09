"use client";

import { useRef } from "react";
import { ID_FORMULARIO_LISTA } from "@/componentes/AsistenteCarrito";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { URL_TIENDA, WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { IconoCarrito, IconoChat, IconoTienda, IconoWhatsApp } from "@/componentes/Iconos";

/** Barra inferior fija en móvil y botón flotante de WhatsApp en escritorio */
export function BarraMovil() {
  const contenedor = useRef<HTMLDivElement>(null);
  const enlaceWhatsApp = crearEnlaceWhatsApp(WHATSAPP_ATENCION, "¡Hola Sigo!");

  useGSAP(
    () => {
      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.set("[data-barra]", { yPercent: 150, autoAlpha: 0 });
      gsap.set("[data-flotante]", { scale: 0, autoAlpha: 0 });

      // Aparecen tras pasar el hero
      ScrollTrigger.create({
        start: () => window.innerHeight * 0.6,
        end: "max",
        onToggle: (instancia) => {
          // Visible desde el inicio hasta el final: isActive se apaga al llegar a "max" y la ocultaba
          const visible = instancia.scroll() >= instancia.start;
          const duracion = reducido ? 0 : 0.45;
          gsap.to("[data-barra]", {
            yPercent: visible ? 0 : 150,
            autoAlpha: visible ? 1 : 0,
            duration: duracion,
            ease: visible ? "back.out(1.4)" : "power2.in",
            overwrite: true,
          });
          gsap.to("[data-flotante]", {
            scale: visible ? 1 : 0,
            autoAlpha: visible ? 1 : 0,
            duration: duracion,
            ease: visible ? "back.out(2)" : "power2.in",
            overwrite: true,
          });
        },
      });
    },
    { scope: contenedor },
  );

  return (
    <div ref={contenedor}>
      <nav
        data-barra
        aria-label="Accesos rápidos"
        className="invisible fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 [@media(max-height:480px)_and_(orientation:landscape)]:hidden rounded-3xl bg-white p-1.5 shadow-xl shadow-azul/20 ring-1 ring-azul/10 lg:hidden"
      >
        {[
          { href: URL_TIENDA, texto: "Comprar", Icono: IconoCarrito, externo: false },
          { href: `#${ID_FORMULARIO_LISTA}`, texto: "Mi lista", Icono: IconoChat, externo: false },
          { href: "#tiendas", texto: "Tiendas", Icono: IconoTienda, externo: false },
          { href: enlaceWhatsApp, texto: "WhatsApp", Icono: IconoWhatsApp, externo: true },
        ].map(({ href, texto, Icono, externo }) => (
          <a
            key={texto}
            href={href}
            {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="flex min-w-0 flex-col items-center gap-0.5 rounded-2xl py-2 text-center text-[clamp(0.6rem,3.4vw,0.7rem)] font-extrabold [overflow-wrap:anywhere] text-azul active:bg-azul-100"
          >
            <Icono className={`h-5 w-5 ${externo ? "text-verde" : ""}`} />
            {texto}
          </a>
        ))}
      </nav>
      <a
        data-flotante
        href={enlaceWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="invisible fixed bottom-6 right-6 z-40 hidden h-16 w-16 place-items-center rounded-full bg-verde text-white shadow-2xl shadow-verde/40 transition-colors hover:bg-verde-700 lg:grid"
      >
        <IconoWhatsApp className="h-8 w-8" />
      </a>
    </div>
  );
}
