"use client";

import { useRef } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO } from "@/lib/gsap";
import { URL_ECOMMERCE } from "@/datos/contacto";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";
import { IconoGlobo, IconoCorazon, IconoCarrito } from "@/componentes/Iconos";

const PASOS = [
  { Icono: IconoGlobo, titulo: "Recarga desde donde estés", texto: "Compra Sigo Créditos en dólares con PayPal, desde cualquier país." },
  { Icono: IconoCorazon, titulo: "1 dólar = 1 Sigo Crédito", texto: "El saldo llega directo a la cuenta de tu familia en Margarita." },
  { Icono: IconoCarrito, titulo: "Ellos eligen su mercado", texto: "Lo usan en cualquier tienda Sigo o en la tienda online." },
];

const PAGOS = [
  "Pago Móvil",
  "Cashea",
  "Zelle",
  "PayPal",
  "Efectivo en divisas",
  "Transferencia bancaria",
  "E-pagos Mercantil",
  "Tarjeta de débito",
  "Sigo Créditos",
];

export function SigoCreditos() {
  const seccion = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        // Medios de pago: aparecen en cascada con rebote
        gsap.from("[data-pago]", {
          autoAlpha: 0,
          y: 14,
          scale: 0.9,
          stagger: 0.06,
          duration: 0.5,
          ease: "back.out(1.8)",
          scrollTrigger: { trigger: "[data-lista-pagos]", start: "top 90%", once: true },
        });
        // Sello de Cashea que gira levemente con el scroll
        gsap.fromTo(
          "[data-cashea]",
          { rotate: -20, scale: 0.8 },
          {
            rotate: 8,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-cashea]", start: "top bottom", end: "top 40%", scrub: true },
          },
        );
        // Brillo de fondo con parallax
        gsap.to("[data-brillo-creditos]", {
          yPercent: 80,
          ease: "none",
          scrollTrigger: { trigger: seccion.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: seccion },
  );

  return (
    <section id="creditos" ref={seccion} className="relative overflow-hidden bg-verde px-5 py-24 text-white sm:py-32">
      <div data-brillo-creditos className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-verde-vivo/40 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <TituloSeccion
          claro
          etiqueta="Sigo Créditos · Para la familia afuera"
          titulo={<>Haz el mercado de tu familia en Margarita, desde cualquier parte del mundo.</>}
          descripcion="Si tú estás lejos y tu familia está en la isla, con Sigo Créditos el cariño llega en forma de mercado."
        />

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {PASOS.map(({ Icono, titulo, texto }, indice) => (
            <Revelar key={titulo} retraso={indice * 0.12}>
              <li className="relative h-full rounded-[2rem] bg-white/10 p-7 ring-1 ring-white/15 backdrop-blur">
                <span className="absolute right-6 top-5 text-6xl font-black text-white/10">{indice + 1}</span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sol text-azul">
                  <Icono className="h-7 w-7" />
                </span>
                <h3 className="mt-6 text-2xl font-black">{titulo}</h3>
                <p className="mt-2 text-white/80">{texto}</p>
              </li>
            </Revelar>
          ))}
        </ol>

        <Revelar className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href={`${URL_ECOMMERCE}/sigo-creditos`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-extrabold text-verde transition hover:-translate-y-0.5 hover:bg-sol hover:text-azul"
          >
            Recargar Sigo Créditos
          </a>
          <p className="text-sm text-white/70">Se aplican las comisiones de PayPal e IGTF vigentes.</p>
        </Revelar>

        {/* Formas de pago */}
        <div className="mt-20 border-t border-white/15 pt-12">
          <Revelar>
            <h3 className="text-2xl font-black sm:text-3xl">Pagas como te quede más cómodo</h3>
          </Revelar>
          <ul data-lista-pagos className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            {PAGOS.map((pago) => (
              <li
                key={pago}
                data-pago
                className="rounded-full bg-white px-5 py-3 font-extrabold text-azul shadow-lg shadow-verde/30"
              >
                {pago}
              </li>
            ))}
          </ul>

          {/* Cashea: compra ahora y paga en cuotas */}
          <Revelar className="mt-8">
            <div className="flex flex-col gap-5 rounded-[2rem] bg-white p-6 text-azul sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-verde">Línea Cotidiana</p>
                <p className="mt-2 text-2xl font-black sm:text-3xl">Haz tu mercado hoy y págalo en cuotas con Cashea</p>
                <p className="mt-2 text-gris">Disponible en nuestras tiendas con tu línea Cotidiana de Cashea.</p>
              </div>
              <span
                data-cashea
                className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-sol text-center text-sm font-black leading-tight text-azul shadow-lg"
              >
                Paga en
                <br />
                cuotas
              </span>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
