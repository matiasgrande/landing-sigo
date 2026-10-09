"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { ImagenProducto } from "@/componentes/tienda/Basicos";
import { IconoBuscar, IconoCerrar } from "@/componentes/Iconos";
import { sugerir, type Sugerencias } from "@/lib/tienda/buscar";
import { aSlug, nombreLegible, precioEn } from "@/lib/tienda/comercio";
import { formatearUsd } from "@/lib/useTasaBcv";

type Opcion =
  | { tipo: "termino"; texto: string }
  | { tipo: "categoria"; departamento: string; categoria: string; cantidad: number }
  | { tipo: "producto"; id: string }
  | { tipo: "todos"; texto: string };

export const ID_BUSCADOR = "buscador-tienda";

export function Buscador() {
  const { indice, navegar, ruta, porId, sucursal } = useTienda();
  const [texto, setTexto] = useState(ruta.consulta ?? "");
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(-1);
  const [sugerencias, setSugerencias] = useState<Sugerencias | null>(null);
  const idLista = useId();
  const contenedor = useRef<HTMLDivElement>(null);

  // Mantiene el texto al navegar con atrás/adelante
  useEffect(() => setTexto(ruta.consulta ?? ""), [ruta.consulta]);

  // Sugerencias con una pequeña espera para no recalcular en cada tecla
  useEffect(() => {
    if (!indice || texto.trim().length < 2) {
      setSugerencias(null);
      return;
    }
    const espera = window.setTimeout(() => setSugerencias(sugerir(indice, texto)), 120);
    return () => window.clearTimeout(espera);
  }, [texto, indice]);

  // Cierra al hacer clic fuera
  useEffect(() => {
    const alClic = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", alClic);
    return () => document.removeEventListener("pointerdown", alClic);
  }, []);

  const opciones = useMemo<Opcion[]>(() => {
    if (!sugerencias) return [];
    return [
      ...sugerencias.terminos.map((t): Opcion => ({ tipo: "termino", texto: t })),
      ...sugerencias.categorias.map((c): Opcion => ({ tipo: "categoria", ...c })),
      ...sugerencias.productos.map((p): Opcion => ({ tipo: "producto", id: p.id })),
      ...(sugerencias.total > 0 ? [{ tipo: "todos", texto: texto.trim() } as Opcion] : []),
    ];
  }, [sugerencias, texto]);

  function buscar(consulta: string) {
    const limpia = consulta.trim();
    if (!limpia) return;
    setAbierto(false);
    setTexto(limpia);
    navegar({ vista: "buscar", consulta: limpia, departamento: null, categoria: null, pagina: 1, producto: null });
  }

  function elegir(opcion: Opcion) {
    setAbierto(false);
    if (opcion.tipo === "termino" || opcion.tipo === "todos") buscar(opcion.texto);
    else if (opcion.tipo === "categoria")
      navegar({
        vista: "listado",
        consulta: null,
        departamento: aSlug(opcion.departamento),
        categoria: aSlug(opcion.categoria),
        pagina: 1,
        producto: null,
      });
    else navegar({ producto: opcion.id });
  }

  function alTeclear(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      setAbierto(true);
      if (opciones.length === 0) return;
      const paso = evento.key === "ArrowDown" ? 1 : -1;
      setActiva((actual) => (actual + paso + opciones.length) % opciones.length);
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      const opcion = activa >= 0 ? opciones[activa] : undefined;
      if (opcion && abierto) elegir(opcion);
      else buscar(texto);
    } else if (evento.key === "Escape") {
      setAbierto(false);
    }
  }

  const mostrar = abierto && sugerencias !== null && texto.trim().length >= 2;
  const idOpcion = (i: number) => `${idLista}-${i}`;

  return (
    <div ref={contenedor} className="relative w-full" role="search">
      <label htmlFor={ID_BUSCADOR} className="sr-only">
        Buscar productos
      </label>
      <div className="flex items-center gap-2 rounded-full bg-crema px-4 ring-1 ring-azul/10 focus-within:ring-2 focus-within:ring-azul/40">
        <IconoBuscar className="h-5 w-5 shrink-0 text-gris" />
        <input
          id={ID_BUSCADOR}
          type="search"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActiva(-1);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={alTeclear}
          placeholder="Busca entre 5.000+ productos"
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={activa >= 0 ? idOpcion(activa) : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-tinta outline-none placeholder:text-gris [&::-webkit-search-cancel-button]:hidden"
        />
        {texto && (
          <button
            type="button"
            onClick={() => {
              setTexto("");
              setAbierto(false);
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-gris hover:bg-azul-100"
            aria-label="Borrar búsqueda"
          >
            <IconoCerrar className="h-4 w-4" />
          </button>
        )}
      </div>

      {mostrar && (
        <div
          id={idLista}
          role="listbox"
          aria-label="Sugerencias"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70dvh] overflow-y-auto rounded-3xl bg-white p-2 text-tinta shadow-2xl ring-1 ring-azul/10"
        >
          {sugerencias.correccion && (
            <p className="px-3 py-2 text-sm text-gris">
              Mostrando resultados de <strong className="text-azul">{sugerencias.correccion}</strong>
            </p>
          )}
          {opciones.length === 0 && <p className="px-3 py-3 text-sm text-gris">No encontramos productos con ese nombre.</p>}
          {opciones.map((opcion, i) => {
            const activaClase = i === activa ? "bg-azul-100" : "hover:bg-crema";
            const comun = {
              id: idOpcion(i),
              role: "option" as const,
              "aria-selected": i === activa,
              onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
              onClick: () => elegir(opcion),
            };
            if (opcion.tipo === "termino")
              return (
                <div key={`t-${opcion.texto}`} {...comun} className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 ${activaClase}`}>
                  <IconoBuscar className="h-4 w-4 text-gris" />
                  <span className="font-semibold">{opcion.texto}</span>
                </div>
              );
            if (opcion.tipo === "categoria")
              return (
                <div key={`c-${opcion.departamento}-${opcion.categoria}`} {...comun} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2.5 ${activaClase}`}>
                  <span>
                    <span className="font-bold text-azul">{nombreLegible(opcion.categoria)}</span>
                    <span className="text-sm text-gris"> en {nombreLegible(opcion.departamento)}</span>
                  </span>
                  <span className="text-xs font-bold text-gris">{opcion.cantidad}</span>
                </div>
              );
            if (opcion.tipo === "producto") {
              const producto = porId.get(opcion.id);
              if (!producto) return null;
              return (
                <div key={`p-${opcion.id}`} {...comun} className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 ${activaClase}`}>
                  <ImagenProducto producto={producto} className="h-11 w-11 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{producto.nombre}</span>
                  <span className="shrink-0 text-sm font-black text-azul">{formatearUsd(precioEn(producto, sucursal))}</span>
                </div>
              );
            }
            return (
              <div key="todos" {...comun} className={`mt-1 cursor-pointer rounded-2xl px-3 py-3 text-center text-sm font-extrabold text-verde ${activaClase}`}>
                Ver los {sugerencias.total} resultados
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
