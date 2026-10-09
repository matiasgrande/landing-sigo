"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ProductoCatalogo } from "@/datos/catalogo";
import { useTasa } from "@/componentes/ContextoTasa";
import { formatearBs, formatearUsd } from "@/lib/useTasaBcv";
import { IconoCerrar, IconoMas, IconoMenos, IconoCarrito } from "@/componentes/Iconos";
import { useTienda } from "@/componentes/tienda/ContextoTienda";

/** Modales abiertos a la vez (carrito + selector de entrega): el scroll se libera al cerrar el último */
let modalesAbiertos = 0;
function bloquearScroll(): void {
  modalesAbiertos++;
  document.body.style.overflow = "hidden";
}
function liberarScroll(): void {
  modalesAbiertos = Math.max(0, modalesAbiertos - 1);
  if (modalesAbiertos === 0) document.body.style.overflow = "";
}

/**
 * Diálogo modal con <dialog> nativo: foco atrapado, Escape y fondo inerte sin código extra.
 * `lado` lo convierte en panel lateral (carrito) en vez de ventana centrada.
 */
export function Dialogo({
  abierto,
  alCerrar,
  titulo,
  children,
  lado = false,
  ancho = "max-w-lg",
  claveContenido,
}: {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
  lado?: boolean;
  ancho?: string;
  /** Al cambiar, el contenido se monta de nuevo y su scroll vuelve arriba (otra ficha) */
  claveContenido?: string;
}) {
  const referencia = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo || !abierto) return;
    if (!dialogo.open) dialogo.showModal();
    bloquearScroll();
    return () => {
      if (dialogo.open) dialogo.close();
      liberarScroll();
    };
  }, [abierto]);

  return (
    <dialog
      ref={referencia}
      aria-label={titulo}
      // "close" llega asíncrono: si el diálogo ya se volvió a abrir, no se cierra el estado
      onClose={() => {
        if (!referencia.current?.open) alCerrar();
      }}
      // Clic en el fondo (fuera del contenido) cierra
      onClick={(evento) => {
        if (evento.target === referencia.current) referencia.current?.close();
      }}
      className={`backdrop:bg-azul-900/60 open:flex flex-col overflow-hidden bg-white p-0 text-tinta shadow-2xl ${
        lado
          ? "m-0 ml-auto h-dvh max-h-dvh w-full max-w-md rounded-l-[2rem]"
          : `mx-auto my-auto max-h-[90dvh] w-[calc(100%-1.5rem)] rounded-[2rem] ${ancho}`
      }`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-azul-100 px-5 py-4">
        <h2 className="text-lg font-black text-azul">{titulo}</h2>
        <button
          type="button"
          onClick={() => referencia.current?.close()}
          className="grid h-11 w-11 place-items-center rounded-full text-azul hover:bg-azul-100"
          aria-label="Cerrar"
        >
          <IconoCerrar className="h-5 w-5" />
        </button>
      </div>
      <div key={claveContenido} className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </dialog>
  );
}

/** Precio en USD con su equivalente en Bs según la tasa BCV */
export function Precio({ usd, grande = false, anterior }: { usd: number; grande?: boolean; anterior?: number }) {
  const { tasa } = useTasa();
  return (
    <div>
      <p className={`font-black text-azul ${grande ? "text-3xl" : "text-lg leading-tight"}`}>
        {formatearUsd(usd)}
        {anterior && anterior > usd && (
          <span className="ml-1.5 text-sm font-bold text-gris line-through">{formatearUsd(anterior)}</span>
        )}
      </p>
      {tasa && <p className={`${grande ? "text-sm" : "text-xs"} text-gris`}>{formatearBs(usd, tasa.valor)}</p>}
    </div>
  );
}

/** Imagen del producto (externa, de sigo.com.ve) con respaldo si no carga */
export function ImagenProducto({ producto, className = "" }: { producto: ProductoCatalogo; className?: string }) {
  // El fallo se recuerda por imagen: otra imagen en el mismo lugar vuelve a intentarse
  const [falloEn, setFalloEn] = useState<string | null>(null);
  const fallo = falloEn !== null && falloEn === producto.imagen;
  if (!producto.imagen || fallo) {
    return (
      <div className={`grid place-items-center bg-crema text-3xl font-black text-azul/20 ${className}`} aria-hidden>
        {producto.nombre.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={producto.imagen}
      alt=""
      loading="lazy"
      decoding="async"
      width={260}
      height={260}
      onError={() => setFalloEn(producto.imagen ?? null)}
      className={`object-contain ${className}`}
    />
  );
}

const CLAVE_AVISOS = "sigo:avisos-existencia";

function leerAvisos(): string[] {
  try {
    const valor: unknown = JSON.parse(window.localStorage.getItem(CLAVE_AVISOS) ?? "[]");
    return Array.isArray(valor) ? valor.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** "Agregar" que se convierte en stepper dentro de la misma tarjeta */
export function ControlCantidad({
  producto,
  disponible,
  compacto = false,
}: {
  producto: ProductoCatalogo;
  disponible: boolean;
  compacto?: boolean;
}) {
  const { cantidades, agregar } = useTienda();
  const cantidad = cantidades[producto.id] ?? 0;
  const [avisado, setAvisado] = useState(false);

  useEffect(() => {
    setAvisado(leerAvisos().includes(producto.id));
  }, [producto.id]);

  function pedirAviso() {
    // Prototipo: se guarda en este dispositivo; en producción se registraría en el e-commerce
    try {
      const avisos = leerAvisos();
      if (!avisos.includes(producto.id)) window.localStorage.setItem(CLAVE_AVISOS, JSON.stringify([...avisos, producto.id]));
    } catch {
      // Sin almacenamiento: el aviso vale solo para esta visita
    }
    setAvisado(true);
  }

  if (!disponible) {
    return (
      <button
        type="button"
        onClick={pedirAviso}
        disabled={avisado}
        title={avisado ? "Guardado en este dispositivo (prototipo)" : undefined}
        className="min-h-11 w-full rounded-full border border-azul/15 px-3 text-sm font-extrabold text-azul transition hover:bg-azul-100 disabled:border-verde/30 disabled:text-verde"
      >
        {avisado ? "Te avisaremos ✓" : "Avísame si llega"}
      </button>
    );
  }
  if (cantidad === 0) {
    return (
      <button
        type="button"
        onClick={() => agregar(producto.id, 1)}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-verde px-3 font-extrabold text-white transition hover:bg-verde-700 ${
          compacto ? "text-sm" : ""
        }`}
        aria-label={`Agregar ${producto.nombre} al carrito`}
      >
        <IconoCarrito className="h-4 w-4" /> Agregar
      </button>
    );
  }
  return (
    <div className="flex min-h-11 w-full items-center justify-between rounded-full bg-azul text-white">
      <button
        type="button"
        onClick={() => agregar(producto.id, -1)}
        className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/15"
        aria-label={`Quitar uno de ${producto.nombre}`}
      >
        <IconoMenos className="h-4 w-4" />
      </button>
      <span className="text-sm font-black" aria-live="polite">
        {cantidad}
      </span>
      <button
        type="button"
        onClick={() => agregar(producto.id, 1)}
        disabled={cantidad >= 99}
        className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/15 disabled:opacity-40"
        aria-label={`Agregar otro de ${producto.nombre}`}
      >
        <IconoMas className="h-4 w-4" />
      </button>
    </div>
  );
}
