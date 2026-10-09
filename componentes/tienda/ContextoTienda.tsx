"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ProductoCatalogo } from "@/datos/catalogo";
import type { IndiceCatalogo } from "@/lib/indiceCatalogo";
import { cargarCatalogo } from "@/lib/cargarCatalogo";
import { CLAVE_CARRITO, ENTREGA_INICIAL, precioEn, type ClaveSucursal, type Entrega } from "@/lib/tienda/comercio";

const CLAVE_GUARDADOS = "sigo:guardados-tienda";
const CLAVE_ENTREGA = "sigo:entrega-tienda";
const MAXIMO_POR_PRODUCTO = 99;

export type Vista = "inicio" | "listado" | "buscar" | "checkout";

export interface Ruta {
  vista: Vista;
  departamento: string | null;
  categoria: string | null;
  consulta: string | null;
  producto: string | null;
  pagina: number;
  orden: OrdenListado;
  soloDisponibles: boolean;
}

export type OrdenListado = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export interface LineaTienda {
  producto: ProductoCatalogo;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface ValorTienda {
  indice: IndiceCatalogo | null;
  porId: Map<string, ProductoCatalogo>;
  cargando: boolean;
  ruta: Ruta;
  navegar: (cambios: Partial<Ruta>, opciones?: { reemplazar?: boolean }) => void;
  cantidades: Record<string, number>;
  lineas: LineaTienda[];
  guardados: ProductoCatalogo[];
  totalArticulos: number;
  subtotal: number;
  agregar: (id: string, delta?: number) => void;
  fijarCantidad: (id: string, cantidad: number) => void;
  quitar: (id: string) => void;
  guardarParaDespues: (id: string) => void;
  moverAlCarrito: (id: string) => void;
  vaciar: () => void;
  entrega: Entrega;
  setEntrega: (entrega: Entrega) => void;
  sucursal: ClaveSucursal;
  carritoAbierto: boolean;
  setCarritoAbierto: (abierto: boolean) => void;
  selectorEntregaAbierto: boolean;
  setSelectorEntregaAbierto: (abierto: boolean) => void;
}

const ContextoTienda = createContext<ValorTienda | null>(null);

const RUTA_INICIAL: Ruta = {
  vista: "inicio",
  departamento: null,
  categoria: null,
  consulta: null,
  producto: null,
  pagina: 1,
  orden: "relevancia",
  soloDisponibles: true,
};

const ORDENES: OrdenListado[] = ["relevancia", "precio-asc", "precio-desc", "nombre"];

function leerRuta(): Ruta {
  const parametros = new URLSearchParams(window.location.search);
  const consulta = parametros.get("q");
  const departamento = parametros.get("d");
  const vista: Vista = parametros.get("v") === "checkout" ? "checkout" : consulta ? "buscar" : departamento ? "listado" : "inicio";
  const orden = parametros.get("o");
  const pagina = Number(parametros.get("pg"));
  return {
    vista,
    departamento,
    categoria: parametros.get("c"),
    consulta,
    producto: parametros.get("p"),
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    orden: ORDENES.includes(orden as OrdenListado) ? (orden as OrdenListado) : "relevancia",
    soloDisponibles: parametros.get("todos") !== "1",
  };
}

function escribirRuta(ruta: Ruta): string {
  const parametros = new URLSearchParams();
  if (ruta.vista === "checkout") parametros.set("v", "checkout");
  if (ruta.consulta) parametros.set("q", ruta.consulta);
  if (ruta.departamento) parametros.set("d", ruta.departamento);
  if (ruta.categoria) parametros.set("c", ruta.categoria);
  if (ruta.pagina > 1) parametros.set("pg", String(ruta.pagina));
  if (ruta.orden !== "relevancia") parametros.set("o", ruta.orden);
  if (!ruta.soloDisponibles) parametros.set("todos", "1");
  if (ruta.producto) parametros.set("p", ruta.producto);
  const texto = parametros.toString();
  return `${window.location.pathname}${texto ? `?${texto}` : ""}`;
}

function leerJson<T>(clave: string, respaldo: T, validar: (valor: unknown) => valor is T): T {
  try {
    const crudo = window.localStorage.getItem(clave);
    if (!crudo) return respaldo;
    const valor: unknown = JSON.parse(crudo);
    return validar(valor) ? valor : respaldo;
  } catch {
    return respaldo;
  }
}

function guardarJson(clave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento: el carrito vive solo en esta visita
  }
}

const esCantidades = (v: unknown): v is Record<string, number> =>
  typeof v === "object" && v !== null && Object.values(v).every((n) => typeof n === "number" && n > 0);
const esListaIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const esEntrega = (v: unknown): v is Entrega =>
  typeof v === "object" &&
  v !== null &&
  ["delivery", "retiro"].includes((v as Entrega).modo) &&
  ["costazul", "sambil"].includes((v as Entrega).sucursal);

export function ProveedorTienda({ children }: { children: ReactNode }) {
  const [indice, setIndice] = useState<IndiceCatalogo | null>(null);
  const [ruta, setRuta] = useState<Ruta>(RUTA_INICIAL);
  const rutaActual = useRef<Ruta>(RUTA_INICIAL);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [idsGuardados, setIdsGuardados] = useState<string[]>([]);
  const [entrega, setEntregaEstado] = useState<Entrega>(ENTREGA_INICIAL);
  const [listo, setListo] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [selectorEntregaAbierto, setSelectorEntregaAbierto] = useState(false);

  // Estado guardado y ruta actual (solo en el cliente)
  useEffect(() => {
    setCantidades(leerJson(CLAVE_CARRITO, {}, esCantidades));
    setIdsGuardados(leerJson(CLAVE_GUARDADOS, [], esListaIds));
    setEntregaEstado(leerJson(CLAVE_ENTREGA, ENTREGA_INICIAL, esEntrega));
    rutaActual.current = leerRuta();
    setRuta(rutaActual.current);
    setListo(true);
    const alNavegar = () => {
      rutaActual.current = leerRuta();
      setRuta(rutaActual.current);
    };
    window.addEventListener("popstate", alNavegar);
    let activo = true;
    void cargarCatalogo().then((resultado) => {
      if (activo) setIndice(resultado);
    });
    return () => {
      activo = false;
      window.removeEventListener("popstate", alNavegar);
    };
  }, []);

  useEffect(() => {
    if (listo) guardarJson(CLAVE_CARRITO, cantidades);
  }, [cantidades, listo]);
  useEffect(() => {
    if (listo) guardarJson(CLAVE_GUARDADOS, idsGuardados);
  }, [idsGuardados, listo]);

  const navegar = useCallback((cambios: Partial<Ruta>, opciones?: { reemplazar?: boolean }) => {
    const siguiente = { ...rutaActual.current, ...cambios };
    const url = escribirRuta(siguiente);
    if (opciones?.reemplazar) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
    rutaActual.current = siguiente;
    setRuta(siguiente);
    // Cambio de pantalla (no solo abrir o cerrar la ficha): volver arriba
    const soloFicha = Object.keys(cambios).every((k) => k === "producto");
    if (!soloFicha) window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const porId = useMemo(() => {
    const mapa = new Map<string, ProductoCatalogo>();
    indice?.entradas.forEach((e) => mapa.set(e.producto.id, e.producto));
    return mapa;
  }, [indice]);

  const sucursal = entrega.sucursal;
  const lineas = useMemo<LineaTienda[]>(
    () =>
      Object.entries(cantidades).flatMap(([id, cantidad]) => {
        const producto = porId.get(id);
        if (!producto) return [];
        const precio = precioEn(producto, sucursal);
        return [{ producto, cantidad, precio, subtotal: Math.round(precio * cantidad * 100) / 100 }];
      }),
    [cantidades, porId, sucursal],
  );
  const guardados = useMemo(() => idsGuardados.flatMap((id) => porId.get(id) ?? []), [idsGuardados, porId]);
  const subtotal = Math.round(lineas.reduce((suma, l) => suma + l.subtotal, 0) * 100) / 100;
  const totalArticulos = lineas.reduce((suma, l) => suma + l.cantidad, 0);

  const fijarCantidad = useCallback((id: string, cantidad: number) => {
    setCantidades((actual) => {
      const siguiente = { ...actual };
      const limpia = Math.min(MAXIMO_POR_PRODUCTO, Math.max(0, Math.round(cantidad)));
      if (limpia === 0) delete siguiente[id];
      else siguiente[id] = limpia;
      return siguiente;
    });
  }, []);
  const agregar = useCallback(
    (id: string, delta = 1) => {
      setCantidades((actual) => {
        const siguiente = { ...actual };
        const nueva = Math.min(MAXIMO_POR_PRODUCTO, Math.max(0, (actual[id] ?? 0) + delta));
        if (nueva === 0) delete siguiente[id];
        else siguiente[id] = nueva;
        return siguiente;
      });
    },
    [],
  );
  const quitar = useCallback((id: string) => fijarCantidad(id, 0), [fijarCantidad]);
  const guardarParaDespues = useCallback(
    (id: string) => {
      fijarCantidad(id, 0);
      setIdsGuardados((actual) => (actual.includes(id) ? actual : [id, ...actual]));
    },
    [fijarCantidad],
  );
  const moverAlCarrito = useCallback(
    (id: string) => {
      setIdsGuardados((actual) => actual.filter((x) => x !== id));
      agregar(id, 1);
    },
    [agregar],
  );
  const vaciar = useCallback(() => setCantidades({}), []);
  const setEntrega = useCallback((nueva: Entrega) => {
    setEntregaEstado(nueva);
    guardarJson(CLAVE_ENTREGA, nueva);
  }, []);

  const valor: ValorTienda = {
    indice,
    porId,
    cargando: indice === null,
    ruta,
    navegar,
    cantidades,
    lineas,
    guardados,
    totalArticulos,
    subtotal,
    agregar,
    fijarCantidad,
    quitar,
    guardarParaDespues,
    moverAlCarrito,
    vaciar,
    entrega,
    setEntrega,
    sucursal,
    carritoAbierto,
    setCarritoAbierto,
    selectorEntregaAbierto,
    setSelectorEntregaAbierto,
  };

  return <ContextoTienda.Provider value={valor}>{children}</ContextoTienda.Provider>;
}

export function useTienda(): ValorTienda {
  const valor = useContext(ContextoTienda);
  if (!valor) throw new Error("useTienda debe usarse dentro de <ProveedorTienda>");
  return valor;
}
