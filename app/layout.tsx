import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { SUCURSALES, crearEnlaceMapa } from "@/datos/sucursales";
import { REDES, WHATSAPP_ATENCION, URL_ECOMMERCE, ANIO_FUNDACION } from "@/datos/contacto";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--fuente-nunito",
  display: "swap",
});

const URL_SITIO = "https://matiasgrande.github.io/landing-sigo/";
const ID_ORGANIZACION = `${URL_SITIO}#organizacion`;

export const metadata: Metadata = {
  // Solo el dominio: Next ya antepone el basePath a las imágenes de metadatos
  metadataBase: new URL("https://matiasgrande.github.io"),
  title: "SIGO Supermercados · Isla de Margarita desde 1972",
  description:
    "Supermercados SIGO en la Isla de Margarita: 8 tiendas, delivery a toda la isla, retiro en tu vehículo y compra online. Sirviendo con amor desde 1972.",
  alternates: { canonical: URL_SITIO },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: URL_SITIO,
    siteName: "SIGO Supermercados",
    title: "SIGO · El supermercado de Margarita desde 1972",
    description: "8 tiendas, delivery a toda la isla y tu mercado a un mensaje de distancia.",
  },
  twitter: { card: "summary_large_image" },
  // Instalable en iPhone desde "Agregar a pantalla de inicio"
  appleWebApp: { capable: true, title: "SIGO", statusBarStyle: "default" },
  icons: { apple: `${process.env.NEXT_PUBLIC_RUTA_BASE ?? ""}/iconos/apple-touch-icon.png` },
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
      "@id": ID_ORGANIZACION,
      name: "SIGO Supermercados",
      url: URL_SITIO,
      logo: `${URL_SITIO}icon.png`,
      image: `${URL_SITIO}opengraph-image.jpg`,
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
      parentOrganization: { "@id": ID_ORGANIZACION },
      image: `${URL_SITIO}opengraph-image.jpg`,
      address: {
        "@type": "PostalAddress",
        streetAddress: sucursal.ubicacion,
        // "Pampatar · Maneiro" -> "Pampatar"; las genéricas ("Isla de Margarita") no aportan localidad
        ...(sucursal.zona.includes("·") && { addressLocality: sucursal.zona.split("·")[0]?.trim() }),
        addressRegion: "Nueva Esparta",
        addressCountry: "VE",
      },
      hasMap: crearEnlaceMapa(sucursal),
      ...(sucursal.coordenadas && {
        geo: { "@type": "GeoCoordinates", latitude: sucursal.coordenadas.lat, longitude: sucursal.coordenadas.lng },
      }),
      ...(sucursal.telefono && { telephone: sucursal.telefono }),
      currenciesAccepted: "USD, VES",
      paymentAccepted: "Pago Móvil, Cashea, Zelle, PayPal, efectivo, transferencia, tarjeta de débito",
    })),
  ],
};

export default function DisenoRaiz({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-VE" className={nunito.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Marca la página como "con JS"; si GSAP no arranca en 1,5 s (red lenta), se muestra todo sin animar */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__animacionesListas)document.documentElement.classList.remove('js')},1500);",
          }}
        />
        {/* Sin JS: la barra inferior y el botón de WhatsApp quedan visibles para navegar,
            y se ocultan el botón de menú y el formulario del asistente porque no pueden funcionar */}
        <noscript>
          <style>{"[data-barra],[data-flotante]{visibility:visible}[data-boton-menu],form#escribe-tu-lista{display:none}"}</style>
        </noscript>
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
