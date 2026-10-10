import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const RUTA_BASE = process.env.NEXT_PUBLIC_RUTA_BASE ?? "";

/** La tienda se instala como app (Android y escritorio; en iOS, "Agregar a pantalla de inicio") */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIGO Supermercados · Tienda",
    short_name: "SIGO",
    description: "Tu mercado en Margarita: más de 5.000 productos, delivery a toda la isla y retiro en tu vehículo.",
    lang: "es-VE",
    start_url: `${RUTA_BASE}/tienda/`,
    scope: `${RUTA_BASE}/`,
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#001e63",
    icons: [
      { src: `${RUTA_BASE}/iconos/icono-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${RUTA_BASE}/iconos/icono-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${RUTA_BASE}/iconos/icono-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ofertas", url: `${RUTA_BASE}/tienda/?d=ofertas` },
      { name: "Mis pedidos", url: `${RUTA_BASE}/tienda/?v=pedidos` },
      { name: "Recetas", url: `${RUTA_BASE}/tienda/?v=recetas` },
    ],
  };
}
