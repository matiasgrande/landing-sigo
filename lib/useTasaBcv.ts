"use client";

import { useEffect, useState } from "react";

export interface TasaBcv {
  valor: number;
  fecha: string;
}

interface RespuestaDolarApi {
  promedio: number | null;
  fechaActualizacion: string;
}

const URL_TASA = "https://ve.dolarapi.com/v1/dolares/oficial";
const CLAVE_CACHE = "sigo:tasa-bcv";

function esRespuestaValida(datos: unknown): datos is RespuestaDolarApi {
  if (typeof datos !== "object" || datos === null) return false;
  const registro = datos as Record<string, unknown>;
  return typeof registro.promedio === "number" && typeof registro.fechaActualizacion === "string";
}

function leerCache(): TasaBcv | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE_CACHE);
    if (!crudo) return null;
    const datos: unknown = JSON.parse(crudo);
    if (typeof datos === "object" && datos !== null && "valor" in datos && "fecha" in datos) {
      const { valor, fecha } = datos as { valor: unknown; fecha: unknown };
      if (typeof valor === "number" && typeof fecha === "string") return { valor, fecha };
    }
  } catch {
    // Almacenamiento bloqueado o dato corrupto: se ignora
  }
  return null;
}

/** Tasa oficial BCV en vivo; usa la última conocida si la red falla */
export function useTasaBcv(): { tasa: TasaBcv | null; error: boolean } {
  const [tasa, setTasa] = useState<TasaBcv | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();
    const enCache = leerCache();
    if (enCache) setTasa(enCache);

    async function cargar(): Promise<void> {
      try {
        const respuesta = await fetch(URL_TASA, { signal: controlador.signal });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos: unknown = await respuesta.json();
        if (!esRespuestaValida(datos) || datos.promedio === null) throw new Error("Respuesta inválida");
        const nueva: TasaBcv = { valor: datos.promedio, fecha: datos.fechaActualizacion };
        setTasa(nueva);
        try {
          window.localStorage.setItem(CLAVE_CACHE, JSON.stringify(nueva));
        } catch {
          // Sin almacenamiento disponible
        }
      } catch (causa) {
        if (causa instanceof DOMException && causa.name === "AbortError") return;
        setError(true);
      }
    }

    void cargar();
    return () => controlador.abort();
  }, []);

  return { tasa, error };
}

export function formatearBs(montoUsd: number, tasa: number): string {
  return `Bs. ${(montoUsd * tasa).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatearUsd(monto: number): string {
  return `$${monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
