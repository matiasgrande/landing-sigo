"use client";

import Link from "next/link";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { CabeceraTienda } from "@/componentes/tienda/CabeceraTienda";
import { InicioTienda } from "@/componentes/tienda/InicioTienda";
import { Listado } from "@/componentes/tienda/Listado";
import { FichaProducto } from "@/componentes/tienda/FichaProducto";
import { CarritoLateral } from "@/componentes/tienda/CarritoLateral";
import { SelectorEntrega } from "@/componentes/tienda/SelectorEntrega";
import { Checkout } from "@/componentes/tienda/Checkout";
import { ID_BUSCADOR } from "@/componentes/tienda/Buscador";
import { ID_LISTA_RAPIDA } from "@/componentes/tienda/ListaRapida";
import { IconoBuscar, IconoCarrito, IconoCasa, IconoChat } from "@/componentes/Iconos";
import { WHATSAPP_ATENCION, crearEnlaceWhatsApp } from "@/datos/contacto";

/** El catálogo real no cargó: se avisa en vez de mostrar en silencio el de demostración */
function AvisoCatalogo() {
  const { indice, reintentarCatalogo } = useTienda();
  if (indice?.origen !== "demo") return null;
  return (
    <div role="alert" className="bg-sol px-4 py-3 text-sm font-bold text-azul">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <p>No pudimos cargar el catálogo completo. Estás viendo productos de ejemplo; tu carrito sigue guardado.</p>
        <button type="button" onClick={reintentarCatalogo} className="min-h-11 rounded-full bg-azul px-4 font-extrabold text-white">
          Reintentar
        </button>
      </div>
    </div>
  );
}

function BarraInferior() {
  const { navegar, totalArticulos, setCarritoAbierto, ruta } = useTienda();

  function irALista() {
    const ir = () => {
      const campo = document.querySelector<HTMLTextAreaElement>(`#${ID_LISTA_RAPIDA} textarea`);
      campo?.scrollIntoView({ block: "center" });
      campo?.focus({ preventScroll: true });
    };
    if (ruta.vista !== "inicio") {
      navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, producto: null });
      window.setTimeout(ir, 60);
    } else ir();
  }

  const boton = "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.7rem] font-extrabold text-azul active:bg-azul-100";
  return (
    <nav aria-label="Accesos rápidos de la tienda" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 [@media(max-height:480px)_and_(orientation:landscape)]:hidden rounded-3xl bg-white p-1.5 shadow-xl shadow-azul/20 ring-1 ring-azul/10 md:hidden">
      <button type="button" className={boton} onClick={() => navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, producto: null })}>
        <IconoCasa className="h-5 w-5" /> Inicio
      </button>
      <button
        type="button"
        className={boton}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          document.getElementById(ID_BUSCADOR)?.focus();
        }}
      >
        <IconoBuscar className="h-5 w-5" /> Buscar
      </button>
      <button type="button" className={boton} onClick={irALista}>
        <IconoChat className="h-5 w-5" /> Mi lista
      </button>
      <button type="button" className={`${boton} relative`} onClick={() => setCarritoAbierto(true)}>
        <IconoCarrito className="h-5 w-5" /> Carrito
        {totalArticulos > 0 && (
          <span className="absolute right-4 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-verde px-1 text-[0.65rem] font-black text-white">
            {totalArticulos}
          </span>
        )}
      </button>
    </nav>
  );
}

export function Tienda() {
  const { ruta } = useTienda();
  return (
    <>
      <CabeceraTienda />
      <AvisoCatalogo />
      <main id="contenido" className="min-h-[60vh] pb-28 md:pb-10">
        {ruta.vista === "inicio" && <InicioTienda />}
        {(ruta.vista === "listado" || ruta.vista === "buscar") && <Listado />}
        {ruta.vista === "checkout" && <Checkout />}
      </main>
      <footer className="bg-azul-900 px-4 pb-28 pt-8 text-sm text-white/80 md:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:justify-between">
          <p>
            Prototipo de la nueva tienda SIGO con el catálogo público de Costazul y Sambil. Precios referenciales; los pedidos no se registran.
          </p>
          <p className="flex gap-4">
            <Link href="/" className="font-bold text-white underline">
              Volver a la landing
            </Link>
            <a href={crearEnlaceWhatsApp(WHATSAPP_ATENCION, "¡Hola Sigo!")} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">
              WhatsApp
            </a>
          </p>
        </div>
      </footer>
      <BarraInferior />
      <FichaProducto />
      <CarritoLateral />
      <SelectorEntrega />
    </>
  );
}
