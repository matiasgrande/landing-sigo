// Sucursales de la unidad de supermercados (confirmadas por SIGO, oct 2026).
// Direcciones, horarios y fotos de Supermarket: fichas públicas de Google Maps (oct 2026).
import type { StaticImageData } from "next/image";
import fotoCostazul from "@/recursos/fotos/tienda-costazul.webp";
import fotoSambil from "@/recursos/fotos/tienda-sambil.webp";

export type FormatoSucursal = "supermarket" | "bodegon" | "sigo-mas";

export interface FotoSucursal {
  imagen: StaticImageData;
  alt: string;
  credito: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  formato: FormatoSucursal;
  ubicacion: string;
  zona: string;
  /** CID de la ficha de Google Maps; si no existe se usa una búsqueda */
  cidGoogle?: string;
  consultaMapa: string;
  coordenadas?: { lat: number; lng: number };
  telefono?: string;
  /** Horario de referencia tomado de Google Maps (pendiente de confirmación semanal) */
  horario?: { abre: string; cierra: string; texto: string };
  servicios: string[];
  destacado?: string;
  foto?: FotoSucursal;
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
    ubicacion: "C.C. Parque Costazul, Zona Este, Av. Jóvito Villalba",
    zona: "Pampatar · Maneiro",
    cidGoogle: "8028796809866838960",
    consultaMapa: "Sigo Supermarket Parque Costazul Margarita",
    coordenadas: { lat: 10.9908169, lng: -63.8237359 },
    horario: { abre: "08:00", cierra: "22:00", texto: "8:00 a.m. – 10:00 p.m." },
    servicios: ["Retiro en tu vehículo", "Delivery", "Compra online"],
    foto: {
      imagen: fotoCostazul,
      alt: "Fachada de Sigo Supermarket en el C.C. Parque Costazul con el mural «Servimos con amor»",
      credito: "Foto: Rossmar Maicán · Google Maps",
    },
  },
  {
    id: "supermarket-sambil",
    nombre: "Sigo Supermarket Sambil",
    formato: "supermarket",
    ubicacion: "C.C. Sambil Margarita, Av. Luisa Cáceres de Arismendi",
    zona: "Pampatar · Maneiro",
    cidGoogle: "6576602805666696469",
    consultaMapa: "Sigo Supermarket Sambil Margarita",
    coordenadas: { lat: 10.9987841, lng: -63.8140631 },
    telefono: "+58 412-529-6412",
    horario: { abre: "08:00", cierra: "22:00", texto: "8:00 a.m. – 10:00 p.m." },
    servicios: ["Retiro en tu vehículo", "Delivery", "Compra online"],
    foto: {
      imagen: fotoSambil,
      alt: "Fachada de Sigo Supermarket en Sambil Margarita con el cartel «Creando posibilidades»",
      credito: "Foto: Daniel Martínez · Google Maps",
    },
  },
  {
    id: "supermarket-porlamar",
    nombre: "Sigo Supermarket Porlamar",
    formato: "supermarket",
    ubicacion: "C.C. Sigo, Av. Juan Bautista Arismendi con Calle Prica",
    zona: "Porlamar · Mariño",
    cidGoogle: "11668115631646825898",
    consultaMapa: "Sigo S.A Porlamar Margarita",
    coordenadas: { lat: 10.9523162, lng: -63.8683891 },
    telefono: "+58 295-265-2000",
    horario: { abre: "08:00", cierra: "18:00", texto: "8:00 a.m. – 6:00 p.m." },
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
  if (sucursal.cidGoogle) return `https://maps.google.com/?cid=${sucursal.cidGoogle}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sucursal.consultaMapa)}`;
}

/** Hora actual en Margarita (UTC-4, sin horario de verano) en minutos desde medianoche */
function minutosEnMargarita(fecha: Date): number {
  const utc = fecha.getUTCHours() * 60 + fecha.getUTCMinutes();
  return (utc - 4 * 60 + 24 * 60) % (24 * 60);
}

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** null si no conocemos el horario de la tienda */
export function estaAbierta(sucursal: Sucursal, fecha: Date = new Date()): boolean | null {
  if (!sucursal.horario) return null;
  const ahora = minutosEnMargarita(fecha);
  return ahora >= aMinutos(sucursal.horario.abre) && ahora < aMinutos(sucursal.horario.cierra);
}
