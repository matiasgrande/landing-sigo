// Sucursales de la unidad de supermercados (confirmadas por SIGO, oct 2026)
export type FormatoSucursal = "supermarket" | "bodegon" | "sigo-mas";

export interface Sucursal {
  id: string;
  nombre: string;
  formato: FormatoSucursal;
  ubicacion: string;
  zona: string;
  /** Consulta para Google Maps mientras no tengamos coordenadas exactas */
  consultaMapa: string;
  servicios: string[];
  destacado?: string;
}

export const ETIQUETAS_FORMATO: Record<FormatoSucursal, string> = {
  supermarket: "Supermarket",
  bodegon: "Bodegón",
  "sigo-mas": "Sigo +",
};

export const SUCURSALES: readonly Sucursal[] = [
  {
    id: "supermarket-costazul",
    nombre: "Sigo Supermarket Costazul",
    formato: "supermarket",
    ubicacion: "C.C. Parque Costazul, entrada Bambú",
    zona: "Pampatar · Maneiro",
    consultaMapa: "Sigo Supermarket Parque Costazul Margarita",
    servicios: ["Retiro en tu vehículo", "Delivery", "Compra online"],
  },
  {
    id: "supermarket-sambil",
    nombre: "Sigo Supermarket Sambil",
    formato: "supermarket",
    ubicacion: "C.C. Sambil Margarita, local T-128, entrada Playa Caribe",
    zona: "Pampatar · Maneiro",
    consultaMapa: "Sigo Supermarket Sambil Margarita",
    servicios: ["Retiro en tu vehículo", "Delivery", "Compra online"],
  },
  {
    id: "supermarket-porlamar",
    nombre: "Sigo Supermarket Porlamar",
    formato: "supermarket",
    ubicacion: "C.C. Parque Porlamar, entrada Oeste",
    zona: "Porlamar · Mariño",
    consultaMapa: "Sigo Supermarket Parque Porlamar Margarita",
    servicios: ["Delivery"],
    destacado: "Donde empezó todo",
  },
  {
    id: "bodegon-la-vela",
    nombre: "Sigo Bodegón La Vela",
    formato: "bodegon",
    ubicacion: "C.C. La Vela",
    zona: "Isla de Margarita",
    consultaMapa: "Sigo Bodegón La Vela Margarita",
    servicios: ["Licores", "Importados"],
  },
  {
    id: "sigo-mas-2",
    nombre: "Sigo +2 Bodegón Costazul",
    formato: "sigo-mas",
    ubicacion: "C.C. Parque Costazul",
    zona: "Pampatar · Maneiro",
    consultaMapa: "Sigo Bodegón Costazul Margarita",
    servicios: ["Licores", "Importados"],
  },
  {
    id: "sigo-mas-4",
    nombre: "Sigo +4 Boca del Río",
    formato: "sigo-mas",
    ubicacion: "Boca del Río, Península de Macanao",
    zona: "Macanao",
    consultaMapa: "Sigo Boca del Río Macanao Margarita",
    servicios: ["Compras del día"],
  },
  {
    id: "sigo-mas-7",
    nombre: "Sigo +7 Ecoland",
    formato: "sigo-mas",
    ubicacion: "Hotel Sunsol Ecoland",
    zona: "Isla de Margarita",
    consultaMapa: "Hotel Sunsol Ecoland Margarita",
    servicios: ["Para huéspedes y visitantes"],
    destacado: "Dentro del hotel",
  },
  {
    id: "sigo-mas-8",
    nombre: "Sigo +8 Isla Caribe",
    formato: "sigo-mas",
    ubicacion: "Hotel Sunsol Isla Caribe",
    zona: "Isla de Margarita",
    consultaMapa: "Hotel Sunsol Isla Caribe Margarita",
    servicios: ["Para huéspedes y visitantes"],
    destacado: "Dentro del hotel",
  },
];

export function crearEnlaceMapa(sucursal: Sucursal): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sucursal.consultaMapa)}`;
}
