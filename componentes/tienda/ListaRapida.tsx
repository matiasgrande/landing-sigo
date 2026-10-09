"use client";

import { useId, useState, type FormEvent } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { interpretarPedido, MAXIMO_CARACTERES, type ResultadoInterpretacion } from "@/lib/interpretarPedido";
import { IconoEnviar } from "@/componentes/Iconos";

export const ID_LISTA_RAPIDA = "lista-rapida";

const EJEMPLOS = ["2 harinas pan, 1 kg de arroz, aceite y café", "Para la parrilla: 2 kg de carne, carbón y 12 cervezas"];

/** "Escribe tu lista" dentro de la tienda: lo interpretado va directo al carrito */
export function ListaRapida({ claro = false }: { claro?: boolean }) {
  const { indice, agregar, setCarritoAbierto } = useTienda();
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<ResultadoInterpretacion | null>(null);
  const idCampo = useId();

  function procesar(entrada: string) {
    const limpio = entrada.trim().slice(0, MAXIMO_CARACTERES);
    if (!limpio || !indice) return;
    try {
      const interpretado = interpretarPedido(limpio, indice);
      interpretado.lineas.forEach((linea) => agregar(linea.producto.id, linea.cantidad));
      setResultado(interpretado);
      setTexto("");
    } catch {
      setResultado({ lineas: [], noEncontrados: [], avisos: ["No pudimos leer tu lista. Inténtalo de nuevo."] });
    }
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    procesar(texto);
  }

  return (
    <div id={ID_LISTA_RAPIDA} className="scroll-mt-40">
      <form onSubmit={alEnviar} className="flex items-end gap-2 rounded-3xl bg-white p-2 shadow-lg shadow-azul/10 ring-1 ring-azul/10">
        <label htmlFor={idCampo} className="sr-only">
          Escribe tu lista de compras
        </label>
        <textarea
          id={idCampo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              procesar(texto);
            }
          }}
          rows={2}
          maxLength={MAXIMO_CARACTERES}
          placeholder="Escribe tu lista: 2 harinas pan, medio kilo de queso, 6 cervezas…"
          className="min-h-14 flex-1 resize-none rounded-2xl bg-crema px-4 py-3 text-base text-tinta outline-none placeholder:text-gris focus:ring-2 focus:ring-azul/30"
        />
        <button
          type="submit"
          disabled={!texto.trim() || !indice}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-verde text-white transition hover:bg-verde-700 disabled:bg-gris/40"
          aria-label="Agregar mi lista al carrito"
        >
          <IconoEnviar className="h-5 w-5" />
        </button>
      </form>

      {!resultado && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EJEMPLOS.map((ejemplo) => (
            <button
              key={ejemplo}
              type="button"
              disabled={!indice}
              onClick={() => procesar(ejemplo)}
              className={`min-h-11 rounded-full px-3 text-left text-xs font-bold transition disabled:opacity-50 ${
                claro ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-azul ring-1 ring-azul/10 hover:bg-azul-100"
              }`}
            >
              {ejemplo}
            </button>
          ))}
        </div>
      )}

      {resultado && (
        <div className="mt-3 rounded-3xl bg-white p-4 text-sm text-tinta ring-1 ring-azul/10" aria-live="polite">
          {resultado.lineas.length > 0 ? (
            <>
              <p className="font-extrabold text-verde">Agregamos {resultado.lineas.length} productos a tu carrito:</p>
              <ul className="mt-1 list-disc pl-5">
                {resultado.lineas.map((l) => (
                  <li key={l.producto.id}>
                    {l.cantidad} × {l.producto.nombre}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="font-bold">No agregamos productos.</p>
          )}
          {resultado.avisos.map((aviso) => (
            <p key={aviso} className="mt-1 text-gris">
              {aviso}
            </p>
          ))}
          {resultado.noEncontrados.length > 0 && (
            <p className="mt-1 text-gris">No encontramos: {resultado.noEncontrados.join(", ")}.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {resultado.lineas.length > 0 && (
              <button type="button" onClick={() => setCarritoAbierto(true)} className="min-h-11 rounded-full bg-azul px-4 font-extrabold text-white">
                Revisar carrito
              </button>
            )}
            <button type="button" onClick={() => setResultado(null)} className="min-h-11 rounded-full px-4 font-extrabold text-azul ring-1 ring-azul/10">
              Escribir otra lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
