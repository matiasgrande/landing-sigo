"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, pausarFueraDeVista, ESCRITORIO_CON_MOVIMIENTO } from "@/lib/gsap";
import logoSigo from "@/recursos/logo-sigo.png";
import {
  URL_ECOMMERCE,
  WHATSAPP_ATENCION,
  WHATSAPP_PAGOS,
  CORREOS,
  REDES,
  ANIO_FUNDACION,
  ANIO_ACTUAL,
  crearEnlaceWhatsApp,
} from "@/datos/contacto";
import { Revelar } from "@/componentes/Revelar";
import {
  IconoCarrito,
  IconoWhatsApp,
  IconoInstagram,
  IconoFacebook,
  IconoCorreo,
  IconoFlecha,
} from "@/componentes/Iconos";

export function Cierre() {
  const llamado = useRef<HTMLElement>(null);

  // Brillo que "respira" detrás del llamado final
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(ESCRITORIO_CON_MOVIMIENTO, () => {
        const respirar = gsap.to("[data-brillo-cierre]", {
          scale: 1.15,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        pausarFueraDeVista(respirar, llamado.current);
      });
    },
    { scope: llamado },
  );

  return (
    <>
      {/* Trabaja con nosotros / proveedores */}
      <section id="unete" className="bg-white px-5 pb-24 pt-4 sm:pb-32">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Revelar>
            <a
              href={`${URL_ECOMMERCE}/unete`}
              className="group flex h-full min-w-0 flex-col rounded-[2rem] bg-crema p-8 [overflow-wrap:anywhere] ring-1 ring-azul/5 transition hover:bg-azul-100"
            >
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-verde">¡Únete!</p>
              <h3 className="mt-3 text-3xl font-black text-azul">Trabaja con nosotros</h3>
              <p className="mt-2 text-gris">Forma parte de la familia Sigo y crece con una empresa margariteña.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-extrabold text-azul">
                Postúlate <IconoFlecha className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </Revelar>
          <Revelar retraso={0.1}>
            <a
              href={`mailto:${CORREOS.atencion}?subject=${encodeURIComponent("Quiero ser proveedor de Sigo")}`}
              className="group flex h-full min-w-0 flex-col rounded-[2rem] bg-crema p-8 [overflow-wrap:anywhere] ring-1 ring-azul/5 transition hover:bg-verde-100"
            >
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-verde">Proveedores</p>
              <h3 className="mt-3 text-3xl font-black text-azul">Lleva tu marca a Sigo</h3>
              <p className="mt-2 text-gris">¿Produces en Margarita o distribuyes en la isla? Conversemos.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-extrabold text-azul">
                Escríbenos <IconoFlecha className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </Revelar>
        </div>
      </section>

      {/* Llamado final */}
      <section ref={llamado} className="relative overflow-hidden bg-azul px-5 py-24 text-center text-white sm:py-32">
        <div
          data-brillo-cierre
          className="absolute left-1/2 top-1/2 -z-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_194_26/0.22),transparent)]"
          aria-hidden
        />
        <Revelar className="relative mx-auto max-w-3xl">
          <h2 className="text-balance text-[clamp(2.4rem,7vw,4.5rem)] font-black leading-[0.98] tracking-tight">
            Tu mercado, a un mensaje <span className="text-sol">de distancia.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Compra online, escríbenos por WhatsApp o visítanos en cualquiera de nuestras ocho tiendas.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={URL_ECOMMERCE}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-verde-vivo px-8 py-4 text-lg font-extrabold transition hover:-translate-y-0.5"
            >
              <IconoCarrito className="h-5 w-5" /> Ir a la tienda online
            </a>
            <a
              href={crearEnlaceWhatsApp(WHATSAPP_ATENCION, "¡Hola Sigo! Quiero hacer un pedido.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-extrabold text-azul transition hover:-translate-y-0.5"
            >
              <IconoWhatsApp className="h-5 w-5 text-verde" /> Escríbenos
            </a>
          </div>
        </Revelar>
      </section>

      <footer className="bg-azul-900 px-5 pb-32 pt-16 text-white/80 lg:pb-12">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="inline-block rounded-2xl bg-white p-2">
              <Image src={logoSigo} alt="SIGO" width={64} height={64} className="h-16 w-16" />
            </span>
            <p className="mt-4 max-w-xs text-sm">Sirviendo con amor a la Isla de Margarita desde {ANIO_FUNDACION}.</p>
          </div>
          <div>
            <h3 className="font-extrabold text-white">WhatsApp</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[WHATSAPP_ATENCION, WHATSAPP_PAGOS].map((canal) => (
                <li key={canal.numeroInternacional}>
                  <a
                    href={crearEnlaceWhatsApp(canal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 hover:text-white"
                  >
                    <IconoWhatsApp className="mt-0.5 h-4 w-4 shrink-0 text-verde-vivo" />
                    <span>
                      <span className="block font-bold text-white">{canal.numeroVisible}</span>
                      {canal.etiqueta}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold text-white">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {Object.values(CORREOS).map((correo) => (
                <li key={correo}>
                  <a href={`mailto:${correo}`} className="flex items-center gap-2 break-all hover:text-white">
                    <IconoCorreo className="h-4 w-4 shrink-0" /> {correo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold text-white">Síguenos</h3>
            <div className="mt-4 flex gap-3">
              <a
                href={REDES.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Sigo"
                className="grid h-12 w-12 place-items-center rounded-full bg-white/10 transition hover:bg-white hover:text-azul"
              >
                <IconoInstagram className="h-5 w-5" />
              </a>
              <a
                href={REDES.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Sigo"
                className="grid h-12 w-12 place-items-center rounded-full bg-white/10 transition hover:bg-white hover:text-azul"
              >
                <IconoFacebook className="h-5 w-5" />
              </a>
            </div>
            <a href={URL_ECOMMERCE} className="mt-6 inline-block text-sm font-bold text-sol hover:underline">
              sigo.com.ve →
            </a>
          </div>
        </div>
        <p className="mx-auto mt-14 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/50">
          © {ANIO_ACTUAL} SIGO Supermercados · Isla de Margarita, Venezuela. Propuesta de landing page.
        </p>
      </footer>
    </>
  );
}
