"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO } from "@/lib/gsap";
import {
  calcularSubtotal,
  formatearCantidad,
  interpretarPedido,
  type LineaPedido,
} from "@/lib/interpretarPedido";
import { formatearBs, formatearUsd } from "@/lib/useTasaBcv";
import { useTasa } from "@/componentes/ContextoTasa";
import { URL_ECOMMERCE, WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { TituloSeccion, Revelar } from "@/componentes/Revelar";
import {
  IconoCarrito,
  IconoChat,
  IconoEnviar,
  IconoMas,
  IconoMenos,
  IconoCerrar,
  IconoWhatsApp,
} from "@/componentes/Iconos";

interface Mensaje {
  id: number;
  autor: "usuario" | "asistente";
  texto: string;
}

const SUGERENCIAS = [
  "2 harinas pan, medio kilo de queso blanco y una docena de huevos",
  "Para la parrilla: 2 kg de carne, carbón, 12 cervezas y hielo",
  "Arroz, pasta, aceite, café y 1 kg de pollo",
];

const MENSAJE_INICIAL: Mensaje = {
  id: 0,
  autor: "asistente",
  texto: "¡Hola! Escríbeme tu lista como se la dirías a alguien de la familia y yo armo el carrito. 🛒",
};

function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

function unirCarrito(actual: LineaPedido[], nuevas: LineaPedido[]): LineaPedido[] {
  const resultado = actual.map((linea) => ({ ...linea }));
  for (const nueva of nuevas) {
    const existente = resultado.find((l) => l.producto.id === nueva.producto.id);
    if (existente) existente.cantidad += nueva.cantidad;
    else resultado.push(nueva);
  }
  return resultado;
}

function crearMensajeWhatsApp(carrito: LineaPedido[], total: number): string {
  const lineas = carrito.map(
    (l) => `• ${formatearCantidad(l)} ${l.producto.nombre} (${l.producto.presentacion})`,
  );
  return [
    "¡Hola Sigo! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total referencial: ${formatearUsd(total)}`,
  ].join("\n");
}

export function AsistenteCarrito() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL]);
  const [carrito, setCarrito] = useState<LineaPedido[]>([]);
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const contenedorMensajes = useRef<HTMLDivElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siguienteId = useRef(1);
  const idCampo = useId();
  const seccion = useRef<HTMLElement>(null);
  const idsAnimados = useRef<Set<string>>(new Set());
  const { tasa } = useTasa();
  const { contextSafe } = useGSAP({ scope: seccion });

  // Entrada de cada mensaje nuevo
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        const burbujas = gsap.utils.toArray<HTMLElement>("[data-mensaje]");
        const ultima = burbujas[burbujas.length - 1];
        if (ultima) gsap.from(ultima, { autoAlpha: 0, y: 12, scale: 0.97, duration: 0.4 });
      });
    },
    { dependencies: [mensajes.length], scope: seccion },
  );

  // Puntos de "escribiendo..."
  useGSAP(
    () => {
      if (!escribiendo) return;
      gsap.to("[data-punto]", { y: -4, duration: 0.3, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.12 });
    },
    { dependencies: [escribiendo], scope: seccion },
  );

  // Entrada de productos nuevos en el carrito
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const nuevos = gsap.utils
        .toArray<HTMLElement>("[data-linea-carrito]")
        .filter((el) => !idsAnimados.current.has(el.dataset.lineaCarrito ?? ""));
      nuevos.forEach((el) => idsAnimados.current.add(el.dataset.lineaCarrito ?? ""));
      if (nuevos.length === 0) return;
      mm.add(CON_MOVIMIENTO, () => {
        gsap.from(nuevos, { autoAlpha: 0, x: 24, stagger: 0.08, duration: 0.45 });
      });
    },
    { dependencies: [carrito], scope: seccion },
  );

  const total = carrito.reduce((suma, linea) => suma + calcularSubtotal(linea), 0);
  const totalArticulos = carrito.length;

  // Desplaza solo el contenedor del chat, nunca la página
  useEffect(() => {
    const contenedor = contenedorMensajes.current;
    if (contenedor) contenedor.scrollTo({ top: contenedor.scrollHeight, behavior: "smooth" });
  }, [mensajes, escribiendo]);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  function procesar(entrada: string) {
    const limpio = entrada.trim();
    if (!limpio || escribiendo) return;

    setMensajes((previos) => [...previos, { id: siguienteId.current++, autor: "usuario", texto: limpio }]);
    setTexto("");
    setEscribiendo(true);

    temporizador.current = setTimeout(() => {
      let respuesta: string;
      try {
        const { lineas, noEncontrados } = interpretarPedido(limpio);
        if (lineas.length > 0) setCarrito((actual) => unirCarrito(actual, lineas));

        const partes: string[] = [];
        if (lineas.length > 0) {
          partes.push(`Listo, agregué ${pluralizar(lineas.length, "producto", "productos")} a tu carrito.`);
        }
        if (noEncontrados.length > 0) {
          partes.push(
            `No encontré: ${noEncontrados.map((n) => `"${n}"`).join(", ")}. Prueba con otro nombre o escríbelo más simple.`,
          );
        }
        respuesta = partes.length > 0 ? partes.join(" ") : "No entendí la lista. Prueba separando los productos con comas.";
      } catch {
        respuesta = "Ups, algo salió mal interpretando tu lista. Inténtalo de nuevo.";
      }
      setMensajes((previos) => [...previos, { id: siguienteId.current++, autor: "asistente", texto: respuesta }]);
      setEscribiendo(false);
    }, 650);
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    procesar(texto);
  }

  function alPresionarTecla(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      procesar(texto);
    }
  }

  function cambiarCantidad(idProducto: string, direccion: 1 | -1) {
    setCarrito((actual) =>
      actual
        .map((linea) => {
          if (linea.producto.id !== idProducto) return linea;
          const paso = linea.producto.unidad === "kg" ? 0.25 : 1;
          return { ...linea, cantidad: Math.round((linea.cantidad + paso * direccion) * 100) / 100 };
        })
        .filter((linea) => {
          if (linea.cantidad > 0) return true;
          idsAnimados.current.delete(linea.producto.id);
          return false;
        }),
    );
  }

  const quitar = contextSafe((idProducto: string) => {
    const eliminar = () => {
      idsAnimados.current.delete(idProducto);
      setCarrito((actual) => actual.filter((linea) => linea.producto.id !== idProducto));
    };
    const elemento = seccion.current?.querySelector(`[data-linea-carrito="${idProducto}"]`);
    if (!elemento || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      eliminar();
      return;
    }
    gsap.to(elemento, { autoAlpha: 0, x: -24, duration: 0.25, ease: "power2.in", onComplete: eliminar });
  });

  return (
    <section id="asistente" ref={seccion} className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <TituloSeccion
          etiqueta="Nuevo · Arma tu lista"
          titulo={
            <>
              Escríbelo como lo dices.
              <span className="text-verde"> Nosotros armamos el carrito.</span>
            </>
          }
          descripcion="Pega la lista del grupo familiar o escríbela a tu manera. El asistente la convierte en un carrito que puedes enviarnos por WhatsApp o terminar en la tienda online."
        />

        <Revelar className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Chat */}
          <div className="flex h-[34rem] min-w-0 flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-azul/5 ring-1 ring-azul/5">
            <div className="flex items-center gap-3 border-b border-azul-100 px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-verde text-white">
                <IconoChat className="h-5 w-5" />
              </span>
              <div>
                <p className="font-extrabold text-azul">Asistente Sigo</p>
                <p className="text-xs font-semibold text-verde">● En línea · demostración</p>
              </div>
            </div>

            <div
              ref={contenedorMensajes}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5"
              aria-live="polite"
              aria-label="Conversación con el asistente"
            >
              {mensajes.map((mensaje) => (
                  <p
                    key={mensaje.id}
                    data-mensaje
                    className={`w-fit max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-[0.95rem] leading-snug ${
                      mensaje.autor === "usuario"
                        ? "ml-auto rounded-br-sm bg-azul font-semibold text-white"
                        : "rounded-bl-sm bg-crema text-tinta"
                    }`}
                  >
                    {mensaje.texto}
                  </p>
                ))}
                {escribiendo && (
                  <p
                    className="flex w-fit gap-1 rounded-2xl rounded-bl-sm bg-crema px-4 py-4"
                    aria-label="El asistente está escribiendo"
                  >
                    {[0, 1, 2].map((punto) => (
                      <span key={punto} data-punto className="h-2 w-2 rounded-full bg-gris" />
                    ))}
                  </p>
                )}
            </div>

            <div className="sin-barra flex gap-2 overflow-x-auto px-4 pb-3">
              {SUGERENCIAS.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => procesar(sugerencia)}
                  disabled={escribiendo}
                  className="shrink-0 rounded-full border border-azul/15 px-3 py-2 text-xs font-bold text-azul transition hover:bg-azul-100 disabled:opacity-50"
                >
                  {sugerencia.length > 38 ? `${sugerencia.slice(0, 38)}…` : sugerencia}
                </button>
              ))}
            </div>

            <form onSubmit={alEnviar} className="flex items-end gap-2 border-t border-azul-100 p-3">
              <label htmlFor={idCampo} className="sr-only">
                Escribe tu lista de compras
              </label>
              <textarea
                id={idCampo}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={alPresionarTecla}
                rows={1}
                maxLength={500}
                placeholder="Ej.: 2 harinas pan y café"
                className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl bg-crema px-4 py-3 text-base outline-none ring-azul/30 placeholder:text-gris/70 focus:ring-2"
              />
              <button
                type="submit"
                disabled={!texto.trim() || escribiendo}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-verde text-white transition hover:bg-verde-vivo disabled:bg-gris/40"
                aria-label="Enviar lista"
              >
                <IconoEnviar className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Carrito */}
          <div className="flex min-h-[24rem] min-w-0 flex-col rounded-[2rem] bg-azul p-5 text-white shadow-xl shadow-azul/20 sm:p-6 lg:h-[34rem]">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-lg font-black">
                <IconoCarrito className="h-5 w-5 text-sol" /> Tu carrito
              </p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                {pluralizar(totalArticulos, "producto", "productos")}
              </span>
            </div>

            <div className="sin-barra mt-4 flex-1 overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="grid h-full min-h-40 place-items-center rounded-2xl border-2 border-dashed border-white/15 p-6 text-center text-white/60">
                  <p>Tu carrito aparecerá aquí cuando escribas tu lista.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                    {carrito.map((linea) => (
                      <li
                        key={linea.producto.id}
                        data-linea-carrito={linea.producto.id}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 break-words font-bold leading-tight">{linea.producto.nombre}</p>
                          <p className="text-xs text-white/60">
                            {linea.producto.presentacion} · {formatearUsd(linea.producto.precioUsd)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(linea.producto.id, -1)}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
                            aria-label={`Restar ${linea.producto.nombre}`}
                          >
                            <IconoMenos className="h-4 w-4" />
                          </button>
                          <span className="min-w-12 text-center text-sm font-extrabold">{formatearCantidad(linea)}</span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(linea.producto.id, 1)}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
                            aria-label={`Sumar ${linea.producto.nombre}`}
                          >
                            <IconoMas className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="hidden w-16 text-right font-extrabold text-sol sm:block">
                          {formatearUsd(calcularSubtotal(linea))}
                        </p>
                        <button
                          type="button"
                          onClick={() => quitar(linea.producto.id)}
                          className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label={`Quitar ${linea.producto.nombre}`}
                        >
                          <IconoCerrar className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-white/70">Total referencial</span>
                <div className="text-right">
                  <p className="text-3xl font-black">{formatearUsd(total)}</p>
                  {tasa && total > 0 && <p className="text-xs text-white/60">{formatearBs(total, tasa.valor)} · tasa BCV</p>}
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href={
                    carrito.length > 0
                      ? crearEnlaceWhatsApp(WHATSAPP_ATENCION, crearMensajeWhatsApp(carrito, total))
                      : undefined
                  }
                  aria-disabled={carrito.length === 0}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-extrabold transition ${
                    carrito.length > 0 ? "bg-verde-vivo hover:bg-verde" : "pointer-events-none bg-white/10 text-white/40"
                  }`}
                >
                  <IconoWhatsApp className="h-5 w-5" /> Pedir por WhatsApp
                </a>
                <a
                  href={URL_ECOMMERCE}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-extrabold text-azul transition hover:bg-sol"
                >
                  <IconoCarrito className="h-5 w-5" /> Seguir en la tienda
                </a>
              </div>
            </div>
          </div>
        </Revelar>

        <p className="mt-4 text-center text-xs text-gris">
          Demostración con precios referenciales. En producción el asistente se conectará al catálogo e inventario
          reales del e-commerce.
        </p>
      </div>
    </section>
  );
}
