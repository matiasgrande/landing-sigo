import type { Metadata } from "next";
import { Proveedores } from "@/componentes/Proveedores";
import { ProveedorTienda } from "@/componentes/tienda/ContextoTienda";
import { PanelInterno } from "@/componentes/panel/PanelInterno";

export const metadata: Metadata = {
  title: "Panel interno · SIGO Supermercados (prototipo)",
  description: "Uso de la tienda, búsquedas sin resultado, catálogo real y promociones.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function PaginaPanel() {
  return (
    <Proveedores>
      <ProveedorTienda>
        <PanelInterno />
      </ProveedorTienda>
    </Proveedores>
  );
}
