import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logoSigo from "@/recursos/logo-sigo.png";
import { URL_TIENDA } from "@/datos/contacto";

export const metadata: Metadata = {
  title: "Página no encontrada · SIGO Supermercados",
  description: "Esta página no existe. Vuelve al inicio de SIGO Supermercados o haz tu mercado online.",
  robots: { index: false },
  // No hereda la tarjeta para compartir de la página principal
  openGraph: { title: "Página no encontrada · SIGO Supermercados", url: undefined },
  // La 404 no debe declararse como la página principal
  alternates: { canonical: null },
};

/** 404 en español, con salida a la landing y a la tienda online */
export default function NoEncontrada() {
  return (
    <main id="contenido" className="grid min-h-dvh place-items-center bg-crema px-5 py-16 text-center">
      <div className="max-w-md">
        <Image src={logoSigo} alt="SIGO" width={72} height={72} className="mx-auto h-18 w-18" priority />
        <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-verde">Error 404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-azul">Esta página no está en el anaquel</h1>
        <p className="mt-4 text-lg text-gris">Puede que el enlace haya cambiado. Vuelve al inicio o haz tu mercado online.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-azul px-6 py-3.5 font-extrabold text-white transition hover:bg-azul-700">
            Ir al inicio
          </Link>
          <a href={URL_TIENDA} className="rounded-full bg-verde px-6 py-3.5 font-extrabold text-white transition hover:bg-verde-700">
            Compra online
          </a>
        </div>
      </div>
    </main>
  );
}
