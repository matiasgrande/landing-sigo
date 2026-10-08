import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { SUCURSALES } from "@/datos/sucursales";
import { REDES, WHATSAPP_ATENCION, URL_ECOMMERCE, ANIO_FUNDACION } from "@/datos/contacto";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--fuente-nunito",
  display: "swap",
});

const URL_SITIO = "https://matiasgrande.github.io/landing-sigo";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: "SIGO Supermercados · Isla de Margarita desde 1972",
  description:
    "Supermercados SIGO en la Isla de Margarita: 8 tiendas, delivery a toda la isla, retiro en tu vehículo y compra online. Sirviendo con amor desde 1972.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: URL_SITIO,
    siteName: "SIGO Supermercados",
    title: "SIGO · El supermercado de Margarita desde 1972",
    description: "8 tiendas, delivery a toda la isla y tu mercado a un mensaje de distancia.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#001e63",
  width: "device-width",
  initialScale: 1,
};

// Datos estructurados para SEO local: organización + cada tienda
const datosEstructurados = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${URL_SITIO}#organizacion`,
      name: "SIGO Supermercados",
      url: URL_SITIO,
      foundingDate: String(ANIO_FUNDACION),
      founder: { "@type": "Person", name: "José Martínez Valenzuela" },
      sameAs: [REDES.instagram, REDES.facebook, URL_ECOMMERCE],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: `+${WHATSAPP_ATENCION.numeroInternacional}`,
        contactType: "customer service",
        areaServed: "VE",
        availableLanguage: "es",
      },
    },
    ...SUCURSALES.map((sucursal) => ({
      "@type": "GroceryStore",
      name: sucursal.nombre,
      parentOrganization: { "@id": `${URL_SITIO}#organizacion` },
      address: {
        "@type": "PostalAddress",
        streetAddress: sucursal.ubicacion,
        addressRegion: "Nueva Esparta",
        addressCountry: "VE",
      },
      currenciesAccepted: "USD, VES",
    })),
  ],
};

export default function DisenoRaiz({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-VE" className={nunito.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Marca la página como "con JS"; si GSAP no arranca en 4 s, se muestra todo igual */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__animacionesListas)document.documentElement.classList.remove('js')},4000);",
          }}
        />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-sol focus:px-5 focus:py-3 focus:font-bold focus:text-azul"
        >
          Saltar al contenido
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      </body>
    </html>
  );
}
