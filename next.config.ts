import type { NextConfig } from "next";

// En GitHub Pages el sitio vive bajo /landing-sigo; en local, en la raíz
const rutaBase = process.env.NEXT_PUBLIC_RUTA_BASE ?? "";

const configuracionNext: NextConfig = {
  output: "export",
  basePath: rutaBase,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default configuracionNext;
