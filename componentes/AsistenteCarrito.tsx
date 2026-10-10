"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { gsap, useGSAP, CON_MOVIMIENTO } from "@/lib/gsap";
import {
  MAXIMO_CARACTERES,
  calcularSubtotal,
  formatearCantidad,
  interpretarPedido,
  maximoPara,
  type LineaPedido,
} from "@/lib/interpretarPedido";
import { formatearBs, formatearFechaTasa, formatearUsd, type TasaBcv } from "@/lib/useTasaBcv";
import { cargarCatalogo } from "@/lib/cargarCatalogo";
import type { IndiceCatalogo } from "@/lib/indiceCatalogo";
import { useTasa } from "@/componentes/ContextoTasa";
import { URL_TIENDA, WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";
import { CLAVE_CARRITO } from "@/lib/tienda/comercio";
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

// Probadas contra el catálogo real de las tiendas Costazul y Sambil (el hielo no se vende en línea)
const SUGERENCIAS = [
  "2 harinas pan, medio kilo de queso blanco y 6 cervezas polar",
  "Para la parrilla: 2 kg de carne, carbón y 12 cervezas",
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

function textoTasa(tasa: TasaBcv): string {
  const fecha = formatearFechaTasa(tasa.fecha);
  return fecha ? `tasa BCV del ${fecha}` : "tasa BCV";
}

/** Id del formulario: "Mi lista" de la barra móvil lleva aquí y enfoca el campo */
export const ID_FORMULARIO_LISTA = "escribe-tu-lista";

interface Union {
  carrito: LineaPedido[];
  /** Productos que realmente cambiaron (nuevos o con más cantidad) */
  agregados: number;
  avisos: string[];
}

function unirCarrito(actual: LineaPedido[], nuevas: LineaPedido[]): Union {
  const carrito = actual.map((linea) => ({ ...linea }));
  const avisos: string[] = [];
  let agregados = 0;
  for (const nueva of nuevas) {
    const existente = carrito.find((l) => l.producto.id === nueva.producto.id);
    if (!existente) {
      carrito.push(nueva);
      agregados++;
      continue;
    }
    // Respeta el tope por producto también al sumar varias listas, y lo avisa
    const maximo = maximoPara(existente.producto);
    const unidad = existente.producto.unidad === "kg" ? " kg" : "";
    if (existente.cantidad >= maximo) {
      avisos.push(`Ya tienes el máximo de ${existente.producto.nombre} (${maximo}${unidad}).`);
      continue;
    }
    const suma = existente.cantidad + nueva.cantidad;
    if (suma > maximo) avisos.push(`Ajusté ${existente.producto.nombre} al máximo de ${maximo}${unidad}.`);
    existente.cantidad = Math.min(suma, maximo);
    agregados++;
  }
  return { carrito, agregados, avisos };
}

function crearMensajeWhatsApp(carrito: LineaPedido[], total: number, tasa: TasaBcv | null): string {
  const lineas = carrito.map(
    (l) => `• ${formatearCantidad(l)} ${l.producto.nombre} (${l.producto.presentacion})`,
  );
  return [
    "¡Hola Sigo! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total referencial: ${formatearUsd(total)}`,
    ...(tasa ? [`≈ ${formatearBs(total, tasa.valor)} (${textoTasa(tasa)})`] : []),
  ].join("\n");
}

export function AsistenteCarrito() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL]);
  const [carrito, setCarrito] = useState<LineaPedido[]>([]);
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [indice, setIndice] = useState<IndiceCatalogo | null>(null);
  const contenedorMensajes = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const carritoActual = useRef<LineaPedido[]>([]);
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
      const mm = gsap.matchMedia();
      mm.add(CON_MOVIMIENTO, () => {
        gsap.to("[data-punto]", { y: -4, duration: 0.3, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.12 });
      });
    },
    // revertOnUpdate: al dejar de escribir se matan los tweens infinitos en vez de acumularlos
    { dependencies: [escribiendo], scope: seccion, revertOnUpdate: true },
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

  useEffect(() => {
    carritoActual.current = carrito;
  }, [carrito]);

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

  // El catálogo real (miles de productos) se descarga solo cuando el asistente se acerca a la pantalla
  useEffect(() => {
    const elemento = seccion.current;
    if (!elemento) return;
    let activo = true;
    const cargar = () => {
      void cargarCatalogo().then((resultado) => {
        if (activo) setIndice(resultado);
      });
    };
    if (!("IntersectionObserver" in window)) {
      cargar();
      return () => {
        activo = false;
      };
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          observador.disconnect();
          cargar();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observador.observe(elemento);
    return () => {
      activo = false;
      observador.disconnect();
    };
  }, []);

  // Los enlaces a "Escribe tu lista" llevan al formulario y dejan el cursor en el campo
  useEffect(() => {
    function alHacerClic(evento: MouseEvent) {
      const enlace = evento.target instanceof Element ? evento.target.closest("a") : null;
      if (!enlace || enlace.getAttribute("href") !== `#${ID_FORMULARIO_LISTA}`) return;
      const formulario = document.getElementById(ID_FORMULARIO_LISTA);
      if (!formulario || !campo.current) return;
      evento.preventDefault();
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      formulario.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "center" });
      campo.current.focus({ preventScroll: true });
    }
    document.addEventListener("click", alHacerClic);
    return () => document.removeEventListener("click", alHacerClic);
  }, []);

  function procesar(entrada: string) {
    // El maxLength del campo se puede saltar (p. ej. pegando por script): se recorta aquí también
    const limpio = entrada.trim().slice(0, MAXIMO_CARACTERES);
    if (!limpio || escribiendo) return;

    setMensajes((previos) => [...previos, { id: siguienteId.current++, autor: "usuario", texto: limpio }]);
    setTexto("");
    setEscribiendo(true);

    temporizador.current = setTimeout(() => {
      void responder(limpio);
    }, 650);
  }

  async function responder(limpio: string) {
    let respuesta: string;
    try {
      // Espera el catálogo si el usuario escribió antes de que terminara de cargar
      const catalogo = await cargarCatalogo();
      setIndice(catalogo);
      const { lineas, noEncontrados, avisos } = interpretarPedido(limpio, catalogo);
      // Se une contra el carrito vigente (ref) para saber qué entró de verdad y avisarlo
      const union = unirCarrito(carritoActual.current, lineas);
      if (union.agregados > 0) setCarrito(union.carrito);

      const partes: string[] = [];
      if (union.agregados > 0) {
        partes.push(`Listo, agregué ${pluralizar(union.agregados, "producto", "productos")} a tu carrito.`);
      }
      // Sin duplicar el aviso de tope que ya dio el intérprete para el mismo producto
      partes.push(...avisos, ...union.avisos.filter((aviso) => !avisos.includes(aviso)));
      if (noEncontrados.length > 0) {
        partes.push(
          `No encontré: ${noEncontrados.map((n) => `"${n}"`).join(", ")}. Prueba con otro nombre o escríbelo más simple.`,
        );
      }
      if (lineas.some((linea) => linea.alternativas?.length)) {
        partes.push("Si prefieres otra marca o presentación, usa «Cambiar» en el carrito.");
      }
      respuesta = partes.length > 0 ? partes.join(" ") : "No entendí la lista. Prueba separando los productos con comas.";
    } catch {
      respuesta = "Ups, algo salió mal interpretando tu lista. Inténtalo de nuevo.";
    }
    setMensajes((previos) => [...previos, { id: siguienteId.current++, autor: "asistente", texto: respuesta }]);
    setEscribiendo(false);
  }

  /** Pasa el carrito armado aquí al prototipo de tienda (se suma a lo que ya hubiera) */
  function llevarCarritoATienda() {
    try {
      const crudo = window.localStorage.getItem(CLAVE_CARRITO);
      const previo: unknown = crudo ? JSON.parse(crudo) : {};
      // Se conserva solo lo válido de la tienda (enteros de 1 a 99)
      const cantidades: Record<string, number> = {};
      if (typeof previo === "object" && previo !== null) {
        for (const [id, cantidad] of Object.entries(previo)) {
          if (Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= 99) cantidades[id] = cantidad;
        }
      }
      for (const linea of carrito) {
        // Solo productos del catálogo real (IDs numéricos); los de la demostración no existen en la tienda
        if (!/^\d+$/.test(linea.producto.id)) continue;
        // Se fija la cantidad del asistente (no se suma): pulsar varias veces no duplica el pedido
        cantidades[linea.producto.id] = Math.min(99, Math.max(1, Math.round(linea.cantidad)));
      }
      window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(cantidades));
    } catch {
      // Sin almacenamiento: se abre la tienda igual, con el carrito vacío
    }
  }

  /** Reemplaza un producto del carrito por una de sus alternativas (otra marca o presentación) */
  function cambiarProducto(idActual: string, idNuevo: string) {
    setCarrito((actual) => {
      const linea = actual.find((l) => l.producto.id === idActual);
      const nuevo = linea?.alternativas?.find((p) => p.id === idNuevo);
      if (!linea || !nuevo) return actual;
      // Si el nuevo ya está en el carrito, se suman las cantidades en esa línea
      const existente = actual.find((l) => l.producto.id === idNuevo);
      const mismaUnidad = nuevo.unidad === linea.producto.unidad;
      const cantidad = mismaUnidad ? linea.cantidad : 1;
      const alternativas = [linea.producto, ...(linea.alternativas ?? []).filter((p) => p.id !== idNuevo)];
      idsAnimados.current.delete(idActual);
      if (existente) {
        return actual
          .filter((l) => l.producto.id !== idActual)
          .map((l) =>
            l.producto.id === idNuevo
              ? { ...l, cantidad: Math.min(l.cantidad + cantidad, maximoPara(nuevo)) }
              : l,
          );
      }
      return actual.map((l) => (l.producto.id === idActual ? { producto: nuevo, cantidad, alternativas } : l));
    });
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
          const cantidad = Math.round((linea.cantidad + paso * direccion) * 100) / 100;
          return { ...linea, cantidad: Math.min(cantidad, maximoPara(linea.producto)) };
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
                <p className="text-xs font-semibold text-verde">
                  ●{" "}
                  {indice?.origen === "real"
                    ? `${indice.total.toLocaleString("es-VE")} productos reales de sigo.com.ve`
                    : "En línea · demostración"}
                </p>
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
                    className={`w-fit max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 [overflow-wrap:anywhere] text-[0.95rem] leading-snug ${
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
                  className="min-h-11 shrink-0 rounded-full border border-azul/15 px-3 py-2 text-xs font-bold text-azul transition hover:bg-azul-100 disabled:opacity-50"
                >
                  {sugerencia.length > 38 ? `${sugerencia.slice(0, 38)}…` : sugerencia}
                </button>
              ))}
            </div>

            <noscript>
              <p className="border-t border-azul-100 p-3 text-sm font-bold text-azul">
                El asistente necesita JavaScript. Puedes hacer tu mercado en la{" "}
                <a href={URL_TIENDA} className="text-verde underline">
                  tienda online
                </a>
                .
              </p>
            </noscript>
            <form id={ID_FORMULARIO_LISTA} onSubmit={alEnviar} className="flex items-end gap-2 border-t border-azul-100 p-3">
              <label htmlFor={idCampo} className="sr-only">
                Escribe tu lista de compras
              </label>
              <textarea
                ref={campo}
                id={idCampo}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={alPresionarTecla}
                rows={1}
                maxLength={MAXIMO_CARACTERES}
                placeholder="Ej.: 2 harinas pan y café"
                className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl bg-crema px-4 py-3 text-base outline-none ring-azul/30 placeholder:text-gris focus:ring-2"
              />
              <button
                type="submit"
                disabled={!texto.trim() || escribiendo}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-verde text-white transition hover:bg-verde-700 disabled:bg-gris/40"
                aria-label="Enviar lista"
              >
                <IconoEnviar className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Carrito */}
          <div className="flex min-h-[24rem] min-w-0 flex-col rounded-[2rem] bg-azul p-5 text-white shadow-xl shadow-azul/20 sm:p-6 lg:h-[34rem]">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                        className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-2xl bg-white/[0.07] p-3 sm:flex-nowrap sm:gap-x-3"
                      >
                        {/* En pantallas pequeñas: nombre y quitar arriba; cantidad y subtotal debajo */}
                        <div className="flex min-w-0 flex-1 items-start gap-3 max-sm:order-1 max-sm:basis-[calc(100%-3.5rem)]">
                          {linea.producto.imagen && (
                            // Imagen externa de sigo.com.ve: <img> simple con carga diferida
                            <img
                              src={linea.producto.imagen}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              width={48}
                              height={48}
                              className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="line-clamp-2 break-words font-bold leading-tight">{linea.producto.nombre}</p>
                            <p className="text-xs text-white/70">
                              {linea.producto.presentacion} · {formatearUsd(linea.producto.precioUsd)}
                              {linea.producto.unidad === "kg" ? " /kg" : ""}
                              {linea.producto.disponible === false ? " · sin existencia en línea" : ""}
                            </p>
                            {linea.alternativas && linea.alternativas.length > 0 && (
                              <label className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sol">
                                <span>Cambiar:</span>
                                <select
                                  value=""
                                  onChange={(e) => e.target.value && cambiarProducto(linea.producto.id, e.target.value)}
                                  className="max-w-[11rem] truncate rounded-lg bg-white/10 px-1.5 py-1 text-xs font-semibold text-white"
                                  aria-label={`Cambiar ${linea.producto.nombre} por otra opción`}
                                >
                                  <option value="">
                                    {linea.alternativas.length === 1 ? "1 opción…" : `${linea.alternativas.length} opciones…`}
                                  </option>
                                  {linea.alternativas.map((alternativa) => (
                                    <option key={alternativa.id} value={alternativa.id} className="text-tinta">
                                      {alternativa.nombre} · {formatearUsd(alternativa.precioUsd)}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 max-sm:order-3">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(linea.producto.id, -1)}
                            className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/15 sm:h-8 sm:w-8"
                            aria-label={`Restar ${linea.producto.nombre}`}
                          >
                            <IconoMenos className="h-4 w-4" />
                          </button>
                          <span className="min-w-12 text-center text-sm font-extrabold">{formatearCantidad(linea)}</span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(linea.producto.id, 1)}
                            disabled={linea.cantidad >= maximoPara(linea.producto)}
                            className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/15 disabled:opacity-40 sm:h-8 sm:w-8"
                            aria-label={`Sumar ${linea.producto.nombre}`}
                          >
                            <IconoMas className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-right font-extrabold text-sol max-sm:order-4 max-sm:ml-auto sm:w-16">
                          {formatearUsd(calcularSubtotal(linea))}
                        </p>
                        <button
                          type="button"
                          onClick={() => quitar(linea.producto.id)}
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white max-sm:order-2 sm:h-8 sm:w-8"
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
                  <p className="text-3xl font-black [overflow-wrap:anywhere]">{formatearUsd(total)}</p>
                  {tasa && total > 0 && <p className="text-xs text-white/60">{formatearBs(total, tasa.valor)} · {textoTasa(tasa)}</p>}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
                <a
                  href={
                    carrito.length > 0
                      ? crearEnlaceWhatsApp(WHATSAPP_ATENCION, crearMensajeWhatsApp(carrito, total, tasa))
                      : undefined
                  }
                  aria-disabled={carrito.length === 0}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-full px-4 py-3 text-center font-extrabold transition [overflow-wrap:anywhere] ${
                    carrito.length > 0 ? "bg-verde hover:bg-verde-700" : "pointer-events-none bg-white/10 text-white/40"
                  }`}
                >
                  <IconoWhatsApp className="h-5 w-5" /> Pedir por WhatsApp
                </a>
                <a
                  href={URL_TIENDA}
                  onClick={llevarCarritoATienda}
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-center font-extrabold text-azul transition [overflow-wrap:anywhere] hover:bg-sol"
                >
                  <IconoCarrito className="h-5 w-5" /> Seguir en la tienda
                </a>
              </div>
            </div>
          </div>
        </Revelar>

        <p className="mt-4 text-center text-xs text-gris">
          {indice?.origen === "real" && indice.extraidoEn
            ? `Prototipo con los productos y precios publicados en sigo.com.ve el ${new Date(indice.extraidoEn).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" })}. En producción se conectará al inventario en vivo del e-commerce.`
            : "Demostración con precios referenciales. En producción el asistente se conectará al catálogo e inventario reales del e-commerce."}
        </p>
      </div>
    </section>
  );
}
