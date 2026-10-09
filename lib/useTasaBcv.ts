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
/** Una tasa guardada hace más de 72 h ya no se muestra como vigente */
const VIGENCIA_CACHE_MS = 72 * 60 * 60 * 1000;
/** Si la API no responde en 8 s se usa la última tasa conocida */
const LIMITE_ESPERA_MS = 8000;

/** Descarta valores absurdos (0, negativos, infinitos o fuera de escala) */
export function esTasaValida(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 1 && valor < 1_000_000;
}

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
      const { guardadoEn } = datos as { guardadoEn?: unknown };
      const vigente = typeof guardadoEn === "number" && Date.now() - guardadoEn < VIGENCIA_CACHE_MS;
      if (esTasaValida(valor) && typeof fecha === "string" && vigente) return { valor, fecha };
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

    let desmontado = false;
    const limite = window.setTimeout(() => controlador.abort(), LIMITE_ESPERA_MS);

    async function cargar(): Promise<void> {
      try {
        const respuesta = await fetch(URL_TASA, { signal: controlador.signal });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos: unknown = await respuesta.json();
        if (!esRespuestaValida(datos) || !esTasaValida(datos.promedio)) throw new Error("Respuesta inválida");
        const nueva: TasaBcv = { valor: datos.promedio, fecha: datos.fechaActualizacion };
        setTasa(nueva);
        try {
          window.localStorage.setItem(CLAVE_CACHE, JSON.stringify({ ...nueva, guardadoEn: Date.now() }));
        } catch {
          // Sin almacenamiento disponible
        }
      } catch {
        // Red caída, respuesta inválida o tiempo agotado: se mantiene la última tasa conocida
        if (!desmontado) setError(true);
      } finally {
        window.clearTimeout(limite);
      }
    }

    void cargar();
    return () => {
      desmontado = true;
      window.clearTimeout(limite);
      controlador.abort();
    };
  }, []);

  return { tasa, error };
}

export function formatearBs(montoUsd: number, tasa: number): string {
  return `Bs. ${(montoUsd * tasa).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "2026-10-08T…" -> "08/10"; vacío si la fecha no es válida */
export function formatearFechaTasa(fecha: string): string {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "";
  return valor.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", timeZone: "America/Caracas" });
}

export function formatearUsd(monto: number): string {
  return `$${monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
