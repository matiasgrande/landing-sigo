"use client";

import { motion } from "motion/react";
import { URL_ECOMMERCE } from "@/datos/contacto";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";
import { IconoGlobo, IconoCorazon, IconoCarrito } from "@/componentes/Iconos";

const PASOS = [
  { Icono: IconoGlobo, titulo: "Recarga desde donde estés", texto: "Compra Sigo Créditos en dólares con PayPal, desde cualquier país." },
  { Icono: IconoCorazon, titulo: "1 dólar = 1 Sigo Crédito", texto: "El saldo llega directo a la cuenta de tu familia en Margarita." },
  { Icono: IconoCarrito, titulo: "Ellos eligen su mercado", texto: "Lo usan en cualquier tienda Sigo o en la tienda online." },
];

const PAGOS = [
  "Zelle",
  "PayPal",
  "Efectivo en divisas",
  "Transferencia bancaria",
  "E-pagos Mercantil",
  "Tarjeta de débito",
  "Sigo Créditos",
];

export function SigoCreditos() {
  return (
    <section id="creditos" className="relative overflow-hidden bg-verde px-5 py-24 text-white sm:py-32">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-verde-vivo/40 blur-3xl" aria-hidden />
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
          <motion.ul
            className="mt-6 flex flex-wrap gap-2 sm:gap-3"
            initial="oculto"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {PAGOS.map((pago) => (
              <motion.li
                key={pago}
                variants={{ oculto: { opacity: 0, y: 14, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                className="rounded-full bg-white px-5 py-3 font-extrabold text-azul shadow-lg shadow-verde/30"
              >
                {pago}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
