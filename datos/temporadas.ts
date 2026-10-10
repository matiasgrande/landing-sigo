// Calendario venezolano (y margariteño) para la tienda: temporadas con sus recetas y kits.
// Las recetas se convierten en carrito con productos reales; lo que no se vende en línea se avisa.

export type UnidadIngrediente = "kg" | "g" | "und" | "l";

export interface Ingrediente {
  /** Cómo se muestra: "Harina de maíz" */
  nombre: string;
  cantidad: number;
  unidad: UnidadIngrediente;
  /** Cómo se busca en el catálogo (lenguaje del intérprete de listas) */
  consulta: string;
  /** false: no se vende en la tienda en línea (fresco de carnicería o pescadería) */
  enLinea?: false;
}

export interface Receta {
  id: string;
  titulo: string;
  descripcion: string;
  /** Porciones (personas, unidades o invitados) de la receta base */
  porciones: number;
  /** "personas", "hallacas", "invitados" */
  unidadPorciones: string;
  ingredientes: Ingrediente[];
}

export interface Temporada {
  id: string;
  nombre: string;
  mensaje: string;
  recetas: string[];
  /** Ventana de la temporada en un año dado (inicio y fin incluidos, AAAA-MM-DD) */
  ventana: (anio: number) => { inicio: string; fin: string };
}

export const RECETAS: Receta[] = [
  {
    id: "arepas",
    titulo: "Arepas rellenas",
    descripcion: "El desayuno de siempre: reina pepiada, jamón y queso.",
    porciones: 6,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Harina de maíz P.A.N.", cantidad: 2, unidad: "und", consulta: "harina pan" },
      { nombre: "Queso blanco", cantidad: 500, unidad: "g", consulta: "queso blanco" },
      { nombre: "Jamón", cantidad: 500, unidad: "g", consulta: "jamon" },
      { nombre: "Mantequilla", cantidad: 1, unidad: "und", consulta: "mantequilla" },
      { nombre: "Aguacate", cantidad: 1, unidad: "und", consulta: "aguacate" },
    ],
  },
  {
    id: "pabellon",
    titulo: "Pabellón criollo",
    descripcion: "Caraotas, arroz, tajadas y queso rallado.",
    porciones: 4,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Carne para mechar", cantidad: 1, unidad: "kg", consulta: "carne para mechar", enLinea: false },
      { nombre: "Caraotas negras", cantidad: 2, unidad: "und", consulta: "caraotas negras" },
      { nombre: "Arroz", cantidad: 1, unidad: "kg", consulta: "arroz" },
      { nombre: "Plátano", cantidad: 2, unidad: "kg", consulta: "platano" },
      { nombre: "Queso blanco", cantidad: 500, unidad: "g", consulta: "queso blanco" },
      { nombre: "Cebolla", cantidad: 500, unidad: "g", consulta: "cebolla blanca" },
      { nombre: "Pimentón", cantidad: 500, unidad: "g", consulta: "pimenton" },
    ],
  },
  {
    id: "desayuno",
    titulo: "Desayuno criollo",
    descripcion: "Arepas, perico, caraotas, queso y natilla.",
    porciones: 4,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Harina de maíz P.A.N.", cantidad: 1, unidad: "und", consulta: "harina pan" },
      { nombre: "Huevos", cantidad: 12, unidad: "und", consulta: "huevos" },
      { nombre: "Caraotas negras", cantidad: 1, unidad: "und", consulta: "caraotas negras" },
      { nombre: "Queso blanco", cantidad: 500, unidad: "g", consulta: "queso blanco" },
      { nombre: "Natilla", cantidad: 1, unidad: "und", consulta: "natilla" },
      { nombre: "Café", cantidad: 1, unidad: "und", consulta: "cafe" },
    ],
  },
  {
    id: "sancocho",
    titulo: "Sancocho de pollo",
    descripcion: "Para compartir en familia el domingo o en las fiestas del Valle.",
    porciones: 8,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Muslos de pollo", cantidad: 2, unidad: "kg", consulta: "muslo de pollo" },
      { nombre: "Auyama", cantidad: 1, unidad: "kg", consulta: "auyama" },
      { nombre: "Ocumo", cantidad: 1, unidad: "kg", consulta: "ocumo" },
      { nombre: "Jojotos", cantidad: 4, unidad: "und", consulta: "jojoto" },
      { nombre: "Papa", cantidad: 1, unidad: "kg", consulta: "papa amarilla" },
      { nombre: "Zanahoria", cantidad: 500, unidad: "g", consulta: "zanahoria" },
      { nombre: "Cilantro", cantidad: 1, unidad: "und", consulta: "cilantro" },
      { nombre: "Yuca fresca", cantidad: 1, unidad: "kg", consulta: "yuca", enLinea: false },
    ],
  },
  {
    id: "pasticho",
    titulo: "Pasticho",
    descripcion: "El almuerzo del domingo, con bechamel y bastante queso.",
    porciones: 8,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Pasta para lasaña", cantidad: 2, unidad: "und", consulta: "lasana" },
      { nombre: "Carne molida", cantidad: 1.2, unidad: "kg", consulta: "carne molida" },
      { nombre: "Salsa de tomate", cantidad: 2, unidad: "und", consulta: "passata de tomate" },
      { nombre: "Bechamel", cantidad: 1, unidad: "und", consulta: "bechamel" },
      { nombre: "Queso amarillo", cantidad: 500, unidad: "g", consulta: "queso amarillo" },
      { nombre: "Cebolla", cantidad: 500, unidad: "g", consulta: "cebolla blanca" },
    ],
  },
  {
    id: "parrillada",
    titulo: "Parrillada",
    descripcion: "Chorizos, pollo, guasacaca y bien fría la bebida.",
    porciones: 10,
    unidadPorciones: "invitados",
    ingredientes: [
      { nombre: "Carne para asar", cantidad: 3, unidad: "kg", consulta: "carne para asar", enLinea: false },
      { nombre: "Chorizos", cantidad: 4, unidad: "und", consulta: "chorizo" },
      { nombre: "Muslos de pollo", cantidad: 3, unidad: "kg", consulta: "muslo de pollo" },
      { nombre: "Carbón", cantidad: 2, unidad: "und", consulta: "carbon" },
      { nombre: "Cervezas", cantidad: 24, unidad: "und", consulta: "cervezas" },
      { nombre: "Refrescos de 2 L", cantidad: 3, unidad: "und", consulta: "refresco 2 l" },
      { nombre: "Aguacate (guasacaca)", cantidad: 2, unidad: "und", consulta: "aguacate" },
      { nombre: "Cilantro", cantidad: 1, unidad: "und", consulta: "cilantro" },
    ],
  },
  {
    id: "hallacas",
    titulo: "Hallacas",
    descripcion: "La receta de diciembre para hacer en familia.",
    porciones: 25,
    unidadPorciones: "hallacas",
    ingredientes: [
      { nombre: "Harina de maíz P.A.N.", cantidad: 3, unidad: "und", consulta: "harina pan" },
      { nombre: "Hojas de hallaca", cantidad: 1, unidad: "und", consulta: "hoja de hallaca" },
      { nombre: "Onoto", cantidad: 1, unidad: "und", consulta: "onoto" },
      { nombre: "Pollo", cantidad: 1, unidad: "kg", consulta: "antemuslo de pollo" },
      { nombre: "Tocino de cerdo", cantidad: 600, unidad: "g", consulta: "tocino de cerdo" },
      { nombre: "Carne de res", cantidad: 1, unidad: "kg", consulta: "carne de res", enLinea: false },
      { nombre: "Aceitunas", cantidad: 1, unidad: "und", consulta: "aceitunas" },
      { nombre: "Papelón", cantidad: 1, unidad: "und", consulta: "papelon" },
      { nombre: "Cebolla", cantidad: 1, unidad: "kg", consulta: "cebolla blanca" },
      { nombre: "Pimentón", cantidad: 1, unidad: "kg", consulta: "pimenton" },
      { nombre: "Ajo porro", cantidad: 500, unidad: "g", consulta: "ajo porro" },
    ],
  },
  {
    id: "ensalada-gallina",
    titulo: "Ensalada de gallina",
    descripcion: "La compañera de la hallaca y el pan de jamón.",
    porciones: 10,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Papa", cantidad: 2, unidad: "kg", consulta: "papa amarilla" },
      { nombre: "Zanahoria", cantidad: 1, unidad: "kg", consulta: "zanahoria" },
      { nombre: "Pollo", cantidad: 1, unidad: "kg", consulta: "antemuslo de pollo" },
      { nombre: "Mayonesa", cantidad: 1, unidad: "und", consulta: "mayonesa" },
      { nombre: "Pan de jamón Sigo", cantidad: 1, unidad: "und", consulta: "pan de jamon" },
    ],
  },
  {
    id: "empanadas",
    titulo: "Empanadas margariteñas",
    descripcion: "Las de la playa: de cazón, queso o carne molida.",
    porciones: 20,
    unidadPorciones: "empanadas",
    ingredientes: [
      { nombre: "Harina de maíz P.A.N.", cantidad: 2, unidad: "und", consulta: "harina pan" },
      { nombre: "Cazón", cantidad: 1, unidad: "kg", consulta: "cazon", enLinea: false },
      { nombre: "Queso blanco", cantidad: 500, unidad: "g", consulta: "queso blanco" },
      { nombre: "Carne molida", cantidad: 400, unidad: "g", consulta: "carne molida" },
      { nombre: "Aceite", cantidad: 1, unidad: "und", consulta: "aceite de soya" },
      { nombre: "Ají dulce y cebollín", cantidad: 1, unidad: "und", consulta: "aji dulce", enLinea: false },
    ],
  },
  {
    id: "torta",
    titulo: "Torta casera",
    descripcion: "Para celebrar a mamá (o a quien sea).",
    porciones: 12,
    unidadPorciones: "porciones",
    ingredientes: [
      { nombre: "Harina de trigo leudante", cantidad: 1, unidad: "und", consulta: "harina de trigo leudante" },
      { nombre: "Azúcar", cantidad: 1, unidad: "und", consulta: "azucar" },
      { nombre: "Huevos", cantidad: 6, unidad: "und", consulta: "huevos" },
      { nombre: "Mantequilla", cantidad: 1, unidad: "und", consulta: "mantequilla" },
      { nombre: "Leche", cantidad: 1, unidad: "l", consulta: "leche" },
    ],
  },
  {
    id: "lonchera",
    titulo: "Lonchera de la semana",
    descripcion: "Sándwich, jugo y merienda para cinco días de clases.",
    porciones: 1,
    unidadPorciones: "niños",
    ingredientes: [
      { nombre: "Pan de sándwich", cantidad: 1, unidad: "und", consulta: "pan de sandwich" },
      { nombre: "Jamón", cantidad: 250, unidad: "g", consulta: "jamon" },
      { nombre: "Queso amarillo", cantidad: 250, unidad: "g", consulta: "queso amarillo" },
      { nombre: "Jugos pequeños", cantidad: 5, unidad: "und", consulta: "jugo 250 ml" },
      { nombre: "Galletas", cantidad: 1, unidad: "und", consulta: "galleta" },
    ],
  },
  {
    id: "playa",
    titulo: "Kit de playa",
    descripcion: "Para El Agua, Playa Parguito o Juan Griego: todo frío y a la cava.",
    porciones: 6,
    unidadPorciones: "personas",
    ingredientes: [
      { nombre: "Agua de 5 L", cantidad: 2, unidad: "und", consulta: "agua 5 l" },
      { nombre: "Cervezas", cantidad: 24, unidad: "und", consulta: "cervezas" },
      { nombre: "Refrescos de 2 L", cantidad: 2, unidad: "und", consulta: "refresco 2 l" },
      { nombre: "Tequeños", cantidad: 1, unidad: "und", consulta: "tequenos" },
      { nombre: "Papitas", cantidad: 3, unidad: "und", consulta: "papas fritas" },
      { nombre: "Protector solar", cantidad: 1, unidad: "und", consulta: "protector solar" },
      { nombre: "Hielo", cantidad: 2, unidad: "und", consulta: "hielo", enLinea: false },
    ],
  },
];

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher, calendario gregoriano) */
export function domingoDePascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(anio, mes - 1, dia));
}

const iso = (fecha: Date) => fecha.toISOString().slice(0, 10);
const sumarDias = (fecha: Date, dias: number) => new Date(fecha.getTime() + dias * 86_400_000);

/** N-ésimo domingo de un mes (mes 1-12) */
function enesimoDomingo(anio: number, mes: number, n: number): Date {
  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  const desplazamiento = (7 - primero.getUTCDay()) % 7;
  return new Date(Date.UTC(anio, mes - 1, 1 + desplazamiento + (n - 1) * 7));
}

export const TEMPORADAS: Temporada[] = [
  {
    id: "navidad",
    nombre: "Navidad y fin de año",
    mensaje: "Hallacas, ensalada de gallina y pan de jamón: todo para la mesa de diciembre.",
    recetas: ["hallacas", "ensalada-gallina", "pasticho"],
    ventana: (anio) => ({ inicio: `${anio}-11-15`, fin: `${anio}-12-31` }),
  },
  {
    id: "reyes",
    nombre: "Año nuevo y Reyes",
    mensaje: "Lo que quedó de diciembre y la parrilla del primero de año.",
    recetas: ["parrillada", "ensalada-gallina"],
    ventana: (anio) => ({ inicio: `${anio}-01-01`, fin: `${anio}-01-06` }),
  },
  {
    id: "carnaval",
    nombre: "Carnaval",
    mensaje: "Cuatro días de playa en la isla: arma tu cava sin bajarte del carro.",
    recetas: ["playa", "parrillada", "empanadas"],
    ventana: (anio) => {
      const pascua = domingoDePascua(anio);
      return { inicio: iso(sumarDias(pascua, -60)), fin: iso(sumarDias(pascua, -46)) };
    },
  },
  {
    id: "semana-santa",
    nombre: "Semana Santa",
    mensaje: "Margarita se llena: empanadas, playa y la mesa del Jueves y Viernes Santo.",
    recetas: ["empanadas", "playa", "arepas"],
    ventana: (anio) => {
      const pascua = domingoDePascua(anio);
      return { inicio: iso(sumarDias(pascua, -12)), fin: iso(sumarDias(pascua, 1)) };
    },
  },
  {
    id: "madres",
    nombre: "Día de las Madres",
    mensaje: "Desayuno en la cama y torta casera para mamá.",
    recetas: ["desayuno", "torta", "pasticho"],
    ventana: (anio) => {
      const dia = enesimoDomingo(anio, 5, 2);
      return { inicio: iso(sumarDias(dia, -10)), fin: iso(dia) };
    },
  },
  {
    id: "padres",
    nombre: "Día del Padre",
    mensaje: "Parrilla para papá, con la cerveza bien fría.",
    recetas: ["parrillada", "pabellon"],
    ventana: (anio) => {
      const dia = enesimoDomingo(anio, 6, 3);
      return { inicio: iso(sumarDias(dia, -10)), fin: iso(dia) };
    },
  },
  {
    id: "vacaciones",
    nombre: "Vacaciones en la isla",
    mensaje: "¿Llegas a Margarita? Programa tu mercado y que te espere en la posada.",
    recetas: ["playa", "desayuno", "arepas"],
    ventana: (anio) => ({ inicio: `${anio}-07-15`, fin: `${anio}-08-31` }),
  },
  {
    id: "virgen-del-valle",
    nombre: "Fiestas de la Virgen del Valle",
    mensaje: "La patrona de Oriente se celebra el 8 de septiembre: sancocho para compartir.",
    recetas: ["sancocho", "empanadas"],
    ventana: (anio) => ({ inicio: `${anio}-09-01`, fin: `${anio}-09-08` }),
  },
  {
    id: "clases",
    nombre: "Regreso a clases",
    mensaje: "Loncheras listas para toda la semana.",
    recetas: ["lonchera", "desayuno"],
    ventana: (anio) => ({ inicio: `${anio}-09-01`, fin: `${anio}-09-30` }),
  },
];

/** Recetas de todo el año (además de las de temporada) */
export const RECETAS_SIEMPRE = ["arepas", "pabellon", "desayuno", "sancocho", "pasticho", "parrillada"];

export function recetaPorId(id: string): Receta | undefined {
  return RECETAS.find((r) => r.id === id);
}

export interface TemporadaEnFecha {
  temporada: Temporada;
  inicio: string;
  fin: string;
  /** Días que faltan para que empiece (0 si ya está activa) */
  faltan: number;
}

/** Temporadas activas en una fecha (AAAA-MM-DD) y la próxima que viene */
export function temporadasEn(hoy: string): { activas: TemporadaEnFecha[]; proxima: TemporadaEnFecha | null } {
  const anio = Number(hoy.slice(0, 4));
  const hoyFecha = new Date(`${hoy}T00:00:00Z`);
  const candidatas = TEMPORADAS.flatMap((temporada) =>
    [anio, anio + 1].map((a) => {
      const { inicio, fin } = temporada.ventana(a);
      const faltan = Math.max(0, Math.round((new Date(`${inicio}T00:00:00Z`).getTime() - hoyFecha.getTime()) / 86_400_000));
      return { temporada, inicio, fin, faltan };
    }),
  );
  const activas = candidatas.filter((c) => c.inicio <= hoy && hoy <= c.fin);
  const proxima = candidatas.filter((c) => c.inicio > hoy).sort((a, b) => a.inicio.localeCompare(b.inicio))[0] ?? null;
  return { activas, proxima };
}
