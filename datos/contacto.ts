// Datos de contacto y enlaces oficiales de SIGO
export const URL_ECOMMERCE = "https://www.sigo.com.ve";

export interface CanalWhatsApp {
  etiqueta: string;
  numeroVisible: string;
  numeroInternacional: string;
}

export const WHATSAPP_ATENCION: CanalWhatsApp = {
  etiqueta: "Atención y pedidos",
  numeroVisible: "+58 412-529-6412",
  numeroInternacional: "584125296412",
};

export const WHATSAPP_PAGOS: CanalWhatsApp = {
  etiqueta: "Validación de pagos",
  numeroVisible: "+58 412-820-8843",
  numeroInternacional: "584128208843",
};

export const CORREOS = {
  atencion: "compraonline@sigosa.com",
  ventas: "ventasonline@sigosa.com",
} as const;

export const REDES = {
  instagram: "https://www.instagram.com/sigosa/",
  facebook: "https://www.facebook.com/SigoVenezuela/",
} as const;

/** Construye un enlace wa.me con mensaje prellenado */
export function crearEnlaceWhatsApp(canal: CanalWhatsApp, mensaje?: string): string {
  const base = `https://wa.me/${canal.numeroInternacional}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export const ANIO_FUNDACION = 1972;

/** Años de trayectoria calculados en tiempo de build/render */
export function calcularAniosTrayectoria(fecha: Date = new Date()): number {
  return fecha.getFullYear() - ANIO_FUNDACION;
}
