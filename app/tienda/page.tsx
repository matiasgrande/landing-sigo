import type { Metadata } from "next";
import { Proveedores } from "@/componentes/Proveedores";
import { ProveedorTienda } from "@/componentes/tienda/ContextoTienda";
import { Tienda } from "@/componentes/tienda/Tienda";

export const metadata: Metadata = {
  title: "Tienda online · SIGO Supermercados (prototipo)",
  description:
    "Prototipo del nuevo e-commerce de SIGO: más de 5.000 productos reales, búsqueda tolerante a errores y arma tu carrito escribiendo tu lista.",
  // Es un prototipo: no debe competir en buscadores con la tienda real
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function PaginaTienda() {
  return (
    <Proveedores>
      <ProveedorTienda>
        <Tienda />
      </ProveedorTienda>
    </Proveedores>
  );
}
