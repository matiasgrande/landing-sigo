"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ProductoCatalogo } from "@/datos/catalogo";
import type { IndiceCatalogo } from "@/lib/indiceCatalogo";
import { cargarCatalogo } from "@/lib/cargarCatalogo";
import {
  CLAVE_CARRITO,
  ENTREGA_INICIAL,
  MAXIMO_POR_PRODUCTO,
  aCentimos,
  disponibleEn,
  esMunicipioValido,
  precioEn,
  type ClaveSucursal,
  type Entrega,
} from "@/lib/tienda/comercio";
import {
  CLAVE_PROMOCIONES,
  aplicarPromociones,
  leerPromociones,
  promocionesDeEjemplo,
  promocionesVigentes,
  type Promocion,
} from "@/lib/tienda/promociones";
import { registrarEvento } from "@/lib/tienda/eventos";
import { CLAVE_PEDIDOS, guardarPedido, leerPedidos, type PedidoGuardado } from "@/lib/tienda/pedidos";

const CLAVE_GUARDADOS = "sigo:guardados-tienda";
const CLAVE_ENTREGA = "sigo:entrega-tienda";
const CLAVE_SUSTITUTOS = "sigo:sustitutos";
const CLAVE_AHORRO_DATOS = "sigo:ahorro-datos";

/** Qué hacer si un producto no está al preparar el pedido */
export type PreferenciaSustituto = "similar" | "llamar" | "ninguno";
export const TEXTO_SUSTITUTO: Record<PreferenciaSustituto, string> = {
  similar: "Cámbialo por uno similar",
  llamar: "Llámame antes",
  ninguno: "No lo sustituyas",
};

export type Vista = "inicio" | "listado" | "buscar" | "checkout" | "pedidos" | "recetas";
const VISTAS_DIRECTAS: Vista[] = ["checkout", "pedidos", "recetas"];

export interface Ruta {
  vista: Vista;
  departamento: string | null;
  categoria: string | null;
  consulta: string | null;
  producto: string | null;
  pagina: number;
  orden: OrdenListado;
  soloDisponibles: boolean;
  /** Paso del checkout (1 entrega, 2 pago, 3 confirmar) */
  paso: PasoCheckout;
}

export type PasoCheckout = 1 | 2 | 3;

export type OrdenListado = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export interface LineaTienda {
  producto: ProductoCatalogo;
  cantidad: number;
  precio: number;
  subtotal: number;
  /** Con existencia en la sucursal elegida: solo estas se cobran y van en el pedido */
  disponible: boolean;
}

interface ValorTienda {
  indice: IndiceCatalogo | null;
  porId: Map<string, ProductoCatalogo>;
  cargando: boolean;
  /** Vuelve a pedir el catálogo real (tras un fallo de red) */
  reintentarCatalogo: () => void;
  ruta: Ruta;
  navegar: (cambios: Partial<Ruta>, opciones?: { reemplazar?: boolean }) => void;
  cantidades: Record<string, number>;
  lineas: LineaTienda[];
  /** Líneas con existencia en la sucursal (las que se cobran) */
  lineasCobrables: LineaTienda[];
  guardados: ProductoCatalogo[];
  totalArticulos: number;
  /** Subtotal de las líneas con existencia */
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
  /** Promociones vigentes (las de ejemplo si SIGO aún no creó ninguna) */
  promociones: Promocion[];
  sustitutos: Record<string, PreferenciaSustituto>;
  setSustituto: (id: string, preferencia: PreferenciaSustituto) => void;
  pedidos: PedidoGuardado[];
  registrarPedido: (pedido: PedidoGuardado) => void;
  /** Agrega al carrito lo que siga disponible de un pedido anterior; devuelve cuántos productos entraron */
  repetirPedido: (pedido: PedidoGuardado) => number;
  ahorroDatos: boolean;
  setAhorroDatos: (activo: boolean) => void;
  enLinea: boolean;
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
  paso: 1,
};

const ORDENES: OrdenListado[] = ["relevancia", "precio-asc", "precio-desc", "nombre"];

function leerRuta(): Ruta {
  const parametros = new URLSearchParams(window.location.search);
  const consulta = parametros.get("q");
  const departamento = parametros.get("d");
  const directa = VISTAS_DIRECTAS.find((v) => v === parametros.get("v"));
  const vista: Vista = directa ?? (consulta ? "buscar" : departamento ? "listado" : "inicio");
  const orden = parametros.get("o");
  const pagina = Number(parametros.get("pg"));
  const paso = Number(parametros.get("ps"));
  return {
    vista,
    departamento,
    categoria: parametros.get("c"),
    consulta,
    producto: parametros.get("p"),
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    orden: ORDENES.includes(orden as OrdenListado) ? (orden as OrdenListado) : "relevancia",
    soloDisponibles: parametros.get("todos") !== "1",
    paso: vista === "checkout" && (paso === 2 || paso === 3) ? paso : 1,
  };
}

function escribirRuta(ruta: Ruta): string {
  const parametros = new URLSearchParams();
  if (VISTAS_DIRECTAS.includes(ruta.vista)) parametros.set("v", ruta.vista);
  if (ruta.vista === "checkout" && ruta.paso > 1) parametros.set("ps", String(ruta.paso));
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

/** Carrito guardado: se conservan solo las entradas válidas (enteros de 1 a 99), no se descarta todo */
function leerCantidades(): Record<string, number> {
  const crudo = leerJson<unknown>(CLAVE_CARRITO, {}, (v): v is unknown => true);
  const limpio: Record<string, number> = {};
  if (typeof crudo !== "object" || crudo === null || Array.isArray(crudo)) return limpio;
  for (const [id, cantidad] of Object.entries(crudo)) {
    if (typeof cantidad === "number" && Number.isFinite(cantidad) && cantidad >= 1) {
      limpio[id] = Math.min(MAXIMO_POR_PRODUCTO, Math.round(cantidad));
    }
  }
  return limpio;
}
const esListaIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const esEntrega = (v: unknown): v is Entrega =>
  typeof v === "object" &&
  v !== null &&
  ["delivery", "retiro"].includes((v as Entrega).modo) &&
  ["costazul", "sambil"].includes((v as Entrega).sucursal) &&
  ((v as Entrega).municipio === null || esMunicipioValido((v as Entrega).municipio));

const esSustitutos = (v: unknown): v is Record<string, PreferenciaSustituto> =>
  typeof v === "object" && v !== null && Object.values(v).every((x) => x === "similar" || x === "llamar" || x === "ninguno");

export function ProveedorTienda({ children }: { children: ReactNode }) {
  const [indiceBase, setIndice] = useState<IndiceCatalogo | null>(null);
  const [promocionesGuardadas, setPromocionesGuardadas] = useState<Promocion[] | null>(null);
  const [sustitutos, setSustitutos] = useState<Record<string, PreferenciaSustituto>>({});
  const [pedidos, setPedidos] = useState<PedidoGuardado[]>([]);
  const [ahorroDatos, setAhorroDatosEstado] = useState(false);
  const [enLinea, setEnLinea] = useState(true);
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
    const leerGuardado = () => {
      setPromocionesGuardadas(leerPromociones());
      setSustitutos(leerJson(CLAVE_SUSTITUTOS, {}, esSustitutos));
      setPedidos(leerPedidos());
      setCantidades(leerCantidades());
      setIdsGuardados(leerJson(CLAVE_GUARDADOS, [], esListaIds));
      setEntregaEstado(leerJson(CLAVE_ENTREGA, ENTREGA_INICIAL, esEntrega));
    };
    leerGuardado();
    // Otra pestaña cambió el carrito o la entrega: se adopta su versión en vez de pisarla
    const alCambiarAlmacenamiento = (evento: StorageEvent) => {
      if (evento.key === null || [CLAVE_CARRITO, CLAVE_GUARDADOS, CLAVE_ENTREGA, CLAVE_PROMOCIONES, CLAVE_PEDIDOS, CLAVE_SUSTITUTOS].includes(evento.key)) {
        leerGuardado();
      }
    };
    window.addEventListener("storage", alCambiarAlmacenamiento);
    // Ahorro de datos: lo que eligió la persona o, si no eligió, lo que pide su navegador
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setAhorroDatosEstado(leerJson(CLAVE_AHORRO_DATOS, conexion?.saveData === true, (v): v is boolean => typeof v === "boolean"));
    setEnLinea(navigator.onLine);
    const alConectar = () => setEnLinea(true);
    const alDesconectar = () => setEnLinea(false);
    window.addEventListener("online", alConectar);
    window.addEventListener("offline", alDesconectar);
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
      window.removeEventListener("storage", alCambiarAlmacenamiento);
      window.removeEventListener("online", alConectar);
      window.removeEventListener("offline", alDesconectar);
    };
  }, []);

  useEffect(() => {
    if (listo) guardarJson(CLAVE_CARRITO, cantidades);
  }, [cantidades, listo]);
  useEffect(() => {
    if (listo) guardarJson(CLAVE_GUARDADOS, idsGuardados);
  }, [idsGuardados, listo]);
  useEffect(() => {
    if (listo) guardarJson(CLAVE_SUSTITUTOS, sustitutos);
  }, [sustitutos, listo]);

  // Catálogo con las promociones vigentes aplicadas
  const promociones = useMemo(
    () => (indiceBase ? promocionesVigentes(promocionesGuardadas ?? promocionesDeEjemplo(indiceBase)) : []),
    [indiceBase, promocionesGuardadas],
  );
  const indice = useMemo(() => (indiceBase ? aplicarPromociones(indiceBase, promociones) : null), [indiceBase, promociones]);

  const navegar = useCallback((cambios: Partial<Ruta>, opciones?: { reemplazar?: boolean }) => {
    const siguiente = { ...rutaActual.current, ...cambios };
    if (siguiente.vista !== "checkout") siguiente.paso = 1;
    // Otra pantalla u otra búsqueda: orden, filtro y página vuelven a sus valores por defecto
    if ("vista" in cambios || "consulta" in cambios || "departamento" in cambios) {
      siguiente.orden = cambios.orden ?? "relevancia";
      siguiente.soloDisponibles = cambios.soloDisponibles ?? true;
      siguiente.pagina = cambios.pagina ?? 1;
    }
    const url = escribirRuta(siguiente);
    // Cambio de pantalla (no solo abrir o cerrar la ficha): volver arriba
    const soloFicha = Object.keys(cambios).every((k) => k === "producto");
    // La entrada que abre una ficha se marca para que cerrarla vuelva atrás en vez de duplicar historial
    const estado = soloFicha && siguiente.producto ? { ficha: true } : null;
    // La misma URL otra vez (doble clic en "Inicio") no añade entradas repetidas al historial
    const misma = url === `${window.location.pathname}${window.location.search}`;
    if (opciones?.reemplazar || misma) window.history.replaceState(estado, "", url);
    else window.history.pushState(estado, "", url);
    rutaActual.current = siguiente;
    setRuta(siguiente);
    if (!soloFicha) window.scrollTo({ top: 0, behavior: "instant" });
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
        return [{ producto, cantidad, precio, subtotal: aCentimos(precio * cantidad) / 100, disponible: disponibleEn(producto, sucursal) }];
      }),
    [cantidades, porId, sucursal],
  );
  const lineasCobrables = useMemo(() => lineas.filter((l) => l.disponible), [lineas]);
  const guardados = useMemo(() => idsGuardados.flatMap((id) => porId.get(id) ?? []), [idsGuardados, porId]);
  const subtotal = lineasCobrables.reduce((suma, l) => suma + aCentimos(l.subtotal), 0) / 100;
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
      if (delta > 0) registrarEvento({ tipo: "agregar", id, cantidad: delta });
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

  const setSustituto = useCallback((id: string, preferencia: PreferenciaSustituto) => {
    setSustitutos((actual) => ({ ...actual, [id]: preferencia }));
  }, []);
  const registrarPedido = useCallback((pedido: PedidoGuardado) => setPedidos(guardarPedido(pedido)), []);
  const repetirPedido = useCallback(
    (pedido: PedidoGuardado) => {
      let agregados = 0;
      for (const linea of pedido.lineas) {
        const producto = porId.get(linea.id);
        if (!producto || !disponibleEn(producto, entrega.sucursal)) continue;
        agregar(linea.id, linea.cantidad);
        agregados++;
      }
      return agregados;
    },
    [porId, entrega.sucursal, agregar],
  );
  const setAhorroDatos = useCallback((activo: boolean) => {
    setAhorroDatosEstado(activo);
    guardarJson(CLAVE_AHORRO_DATOS, activo);
  }, []);

  const reintentarCatalogo = useCallback(() => {
    void cargarCatalogo(true).then(setIndice);
  }, []);

  const valor = useMemo<ValorTienda>(
    () => ({
      indice,
      porId,
      cargando: indice === null,
      reintentarCatalogo,
      ruta,
      navegar,
      cantidades,
      lineas,
      lineasCobrables,
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
      promociones,
      sustitutos,
      setSustituto,
      pedidos,
      registrarPedido,
      repetirPedido,
      ahorroDatos,
      setAhorroDatos,
      enLinea,
    }),
    [
      indice, porId, reintentarCatalogo, ruta, navegar, cantidades, lineas, lineasCobrables, guardados, totalArticulos,
      subtotal, agregar, fijarCantidad, quitar, guardarParaDespues, moverAlCarrito, vaciar, entrega, setEntrega, sucursal,
      carritoAbierto, selectorEntregaAbierto, promociones, sustitutos, setSustituto, pedidos, registrarPedido, repetirPedido,
      ahorroDatos, setAhorroDatos, enLinea,
    ],
  );

  return <ContextoTienda.Provider value={valor}>{children}</ContextoTienda.Provider>;
}

export function useTienda(): ValorTienda {
  const valor = useContext(ContextoTienda);
  if (!valor) throw new Error("useTienda debe usarse dentro de <ProveedorTienda>");
  return valor;
}
