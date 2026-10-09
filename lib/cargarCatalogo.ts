import { CATALOGO_DEMO, type ProductoCatalogo } from "@/datos/catalogo";
import { crearIndice, palabrasClave, type IndiceCatalogo } from "@/lib/indiceCatalogo";

const RUTA_BASE = process.env.NEXT_PUBLIC_RUTA_BASE ?? "";
const URL_CATALOGO = `${RUTA_BASE}/catalogo-asistente.json`;
// Tienda activa (www.sigo.com.ve está desactualizada); las imágenes se sirven desde cualquier subdominio
const URL_IMAGENES = "https://costazul.sigo.com.ve/images/thumbs/";
/** Inicial de la tienda en el enlace compacto -> dominio */
const TIENDAS: Record<string, string> = {
  c: "https://costazul.sigo.com.ve",
  s: "https://sambil.sigo.com.ve",
};
const LIMITE_ESPERA_MS = 15000;

/** Formato compacto generado por scripts/preparar-catalogo-asistente.mjs */
type FilaProducto = [id: number, nombre: string, precioUsd: number, categoria: number, imagen: string | null, disponible: 0 | 1, enlace: string | null];

interface CatalogoCompacto {
  extraidoEn: string;
  categorias: string[];
  productos: FilaProducto[];
}

function esCatalogoCompacto(datos: unknown): datos is CatalogoCompacto {
  if (typeof datos !== "object" || datos === null) return false;
  const registro = datos as Record<string, unknown>;
  return (
    typeof registro.extraidoEn === "string" &&
    Array.isArray(registro.categorias) &&
    Array.isArray(registro.productos) &&
    registro.productos.length > 0
  );
}

/** "Queso Blanco Duro Kg" se vende por peso; "Arroz Mary 1 Kg" es un paquete */
export function seVendePorKg(nombre: string): boolean {
  const texto = nombre.toLowerCase();
  if (/\b(por|x)\s*(kg|kilo)\b|\bgranel\b/.test(texto)) return true;
  // "kg" sin un número delante (ej.: "Pechuga De Pollo Kg")
  return [...texto.matchAll(/(\d[\d.,]*\s*)?\bkgs?\b\.?/g)].some((m) => !m[1]);
}

/** Presentación tomada del nombre: "Arroz Integral Mary 800 Gr." -> "800 Gr." */
function presentacionDe(nombre: string, porKg: boolean): string {
  if (porKg) return "por kg";
  const medida = /\d[\d.,]*\s*(?:x\s*\d[\d.,]*\s*)?(?:kgs?|k|grs?|g|ml|lts?|l|cc|oz|und|unds|unid|pzas?|mts?|cm|rollos?|hojas?)\b\.?/i.exec(nombre);
  return medida ? medida[0].trim() : "unidad";
}

function adaptar(datos: CatalogoCompacto): ProductoCatalogo[] {
  return datos.productos.map(([id, nombre, precioUsd, categoria, imagen, disponible, enlace]) => {
    const tienda = enlace ? TIENDAS[enlace.charAt(0)] : undefined;
    const porKg = seVendePorKg(nombre);
    return {
      id: String(id),
      nombre,
      presentacion: presentacionDe(nombre, porKg),
      precioUsd,
      unidad: porKg ? "kg" : "unidad",
      categoria: datos.categorias[categoria] ?? "",
      claves: palabrasClave(nombre),
      imagen: imagen ? URL_IMAGENES + imagen : undefined,
      ruta: tienda && enlace ? tienda + enlace.slice(1) : undefined,
      disponible: disponible === 1,
    };
  });
}

let promesa: Promise<IndiceCatalogo> | null = null;

/**
 * Carga (una sola vez) el catálogo real extraído de sigo.com.ve y lo indexa.
 * Si la red falla o el archivo no es válido, usa el catálogo de demostración.
 */
export function cargarCatalogo(): Promise<IndiceCatalogo> {
  if (promesa) return promesa;
  promesa = (async () => {
    const controlador = new AbortController();
    const limite = window.setTimeout(() => controlador.abort(), LIMITE_ESPERA_MS);
    try {
      const respuesta = await fetch(URL_CATALOGO, { signal: controlador.signal });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos: unknown = await respuesta.json();
      if (!esCatalogoCompacto(datos)) throw new Error("Catálogo con formato inválido");
      return crearIndice(adaptar(datos), "real", datos.extraidoEn);
    } catch {
      // Sin red o archivo dañado: la demo sigue con el catálogo de ejemplo y se reintenta la próxima vez
      promesa = null;
      return crearIndice(CATALOGO_DEMO, "demo");
    } finally {
      window.clearTimeout(limite);
    }
  })();
  return promesa;
}
