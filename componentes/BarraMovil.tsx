"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { URL_ECOMMERCE, WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { IconoCarrito, IconoChat, IconoTienda, IconoWhatsApp } from "@/componentes/Iconos";

/** Barra inferior fija en móvil y botón flotante de WhatsApp en escritorio */
export function BarraMovil() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  const enlaceWhatsApp = crearEnlaceWhatsApp(WHATSAPP_ATENCION, "¡Hola Sigo!");

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.nav
            key="barra"
            aria-label="Accesos rápidos"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-3xl bg-white/95 p-1.5 shadow-2xl shadow-azul/25 ring-1 ring-azul/10 backdrop-blur-md lg:hidden"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          >
            {[
              { href: URL_ECOMMERCE, texto: "Comprar", Icono: IconoCarrito, externo: false },
              { href: "#asistente", texto: "Mi lista", Icono: IconoChat, externo: false },
              { href: "#tiendas", texto: "Tiendas", Icono: IconoTienda, externo: false },
              { href: enlaceWhatsApp, texto: "WhatsApp", Icono: IconoWhatsApp, externo: true },
            ].map(({ href, texto, Icono, externo }) => (
              <a
                key={texto}
                href={href}
                {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[0.7rem] font-extrabold text-azul active:bg-azul-100"
              >
                <Icono className={`h-5 w-5 ${externo ? "text-verde" : ""}`} />
                {texto}
              </a>
            ))}
          </motion.nav>
          <motion.a
            key="flotante"
            href={enlaceWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            className="fixed bottom-6 right-6 z-40 hidden h-16 w-16 place-items-center rounded-full bg-verde-vivo text-white shadow-2xl shadow-verde/40 lg:grid"
          >
            <IconoWhatsApp className="h-8 w-8" />
          </motion.a>
        </>
      )}
    </AnimatePresence>
  );
}
