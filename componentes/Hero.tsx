"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { URL_ECOMMERCE, calcularAniosTrayectoria } from "@/datos/contacto";
import { Sonrisa } from "@/componentes/Revelar";
import { IconoCarrito, IconoChat, IconoUbicacion } from "@/componentes/Iconos";

const PALABRAS_TITULO = ["Sirviendo", "con", "amor"];

// Vista previa animada del asistente: refuerza la función insignia desde el primer pliegue
function TarjetaVistaPrevia() {
  const lineas = [
    { texto: "2 Harina P.A.N.", precio: "$2,40" },
    { texto: "500 g Queso blanco", precio: "$3,75" },
    { texto: "1 Docena de huevos", precio: "$2,90" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm animate-flotar">
      <div className="rounded-[2rem] bg-white p-5 text-tinta shadow-2xl shadow-azul-900/40">
        <div className="flex items-center gap-3 border-b border-azul-100 pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-verde text-white">
            <IconoChat className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-azul">Asistente Sigo</p>
            <p className="text-xs text-gris">Escribe tu lista, yo armo el carrito</p>
          </div>
        </div>
        <motion.p
          className="ml-auto mt-4 w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-azul px-4 py-2.5 text-sm font-semibold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          2 harinas pan, medio kilo de queso y una docena de huevos
        </motion.p>
        <motion.ul
          className="mt-3 space-y-2 rounded-2xl bg-crema p-3"
          initial="oculto"
          animate="visible"
          variants={{ visible: { transition: { delayChildren: 1.8, staggerChildren: 0.25 } } }}
        >
          {lineas.map((linea) => (
            <motion.li
              key={linea.texto}
              className="flex items-center justify-between text-sm"
              variants={{ oculto: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
            >
              <span className="font-semibold">{linea.texto}</span>
              <span className="font-extrabold text-verde">{linea.precio}</span>
            </motion.li>
          ))}
        </motion.ul>
        <motion.div
          className="mt-3 flex items-center justify-between rounded-2xl bg-verde px-4 py-3 text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.8, type: "spring" }}
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <IconoCarrito className="h-4 w-4" /> Carrito listo
          </span>
          <span className="font-black">$9,05</span>
        </motion.div>
      </div>
    </div>
  );
}

export function Hero() {
  const referencia = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: referencia, offset: ["start start", "end start"] });
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacidad = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const ySol = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const escalaTarjeta = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const anios = calcularAniosTrayectoria();

  return (
    <section
      id="inicio"
      ref={referencia}
      className="relative isolate overflow-hidden bg-azul pb-28 pt-28 text-white sm:pb-36 sm:pt-36"
    >
      {/* Sol y brillo de fondo: guiño a la isla */}
      <motion.div
        style={{ y: ySol }}
        className="absolute -right-28 -top-28 -z-10 h-64 w-64 rounded-full bg-sol/90 blur-[2px] sm:-right-24 sm:-top-24 sm:h-[26rem] sm:w-[26rem] lg:-right-10 lg:h-[36rem] lg:w-[36rem]"
        aria-hidden
      />
      <div
        className="absolute -left-40 top-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-verde-vivo/25 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <motion.div style={{ y: yTexto, opacity: opacidad }} className="min-w-0">
          <motion.p
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <IconoUbicacion className="h-4 w-4 text-sol" />
            Isla de Margarita · {anios} años contigo
          </motion.p>
          <h1 className="text-[clamp(2.9rem,10vw,6.2rem)] font-black leading-[0.92] tracking-tight">
            <span className="sr-only">SIGO Supermercados: </span>
            {PALABRAS_TITULO.map((palabra, indice) => (
              <motion.span
                key={palabra}
                className="mr-[0.22em] inline-block"
                initial={{ opacity: 0, y: 40, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.15 + indice * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {palabra}
              </motion.span>
            ))}
            <motion.span
              className="relative block text-sol"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              desde 1972
              <Sonrisa className="absolute -bottom-[0.38em] left-0 w-[min(75%,22rem)] text-verde-vivo" />
            </motion.span>
          </h1>
          <motion.p
            className="mt-10 max-w-xl text-pretty text-lg text-white/85 sm:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            El supermercado de la familia margariteña. Ocho tiendas, delivery a toda la isla y ahora tu mercado a
            un mensaje de distancia.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
          >
            <a
              href={URL_ECOMMERCE}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-verde-vivo px-7 py-4 text-lg font-extrabold shadow-lg shadow-verde/30 transition hover:-translate-y-0.5 hover:bg-verde"
            >
              <IconoCarrito className="h-5 w-5" /> Compra online
            </a>
            <a
              href="#asistente"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-extrabold text-azul transition hover:-translate-y-0.5"
            >
              <IconoChat className="h-5 w-5" /> Escribe tu lista
            </a>
          </motion.div>
        </motion.div>

        <motion.div style={{ scale: escalaTarjeta }} className="relative min-w-0">
          <TarjetaVistaPrevia />
        </motion.div>
      </div>

      {/* Olas animadas en la base del hero */}
      <svg
        className="absolute inset-x-0 bottom-0 -z-0 h-20 w-[200%] text-crema sm:h-28"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          fill="currentColor"
          d="M0 60 C240 120 480 0 720 60 S1200 120 1440 60 S1920 0 2160 60 S2640 120 2880 60 V120 H0Z"
          animate={{ x: [0, -1440] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </section>
  );
}
