import type { NextConfig } from "next";

// En GitHub Pages el sitio vive bajo /landing-sigo; en local, en la raíz
const rutaBase = process.env.NEXT_PUBLIC_RUTA_BASE ?? "";

// Año fijado al construir: servidor y cliente muestran lo mismo (sin error de hidratación).
// El workflow reconstruye el sitio cada 1 de enero para actualizarlo.
const anioConstruccion = String(new Date().getFullYear());

const configuracionNext: NextConfig = {
  env: { NEXT_PUBLIC_ANIO_CONSTRUCCION: anioConstruccion },
  output: "export",
  basePath: rutaBase,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default configuracionNext;
