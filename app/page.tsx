import { Proveedores } from "@/componentes/Proveedores";
import { Encabezado } from "@/componentes/Encabezado";
import { Hero } from "@/componentes/Hero";
import { Cifras } from "@/componentes/Cifras";
import { AsistenteCarrito } from "@/componentes/AsistenteCarrito";
import { Sucursales } from "@/componentes/Sucursales";
import { Entregas } from "@/componentes/Entregas";
import { SigoCreditos } from "@/componentes/SigoCreditos";
import { Historia } from "@/componentes/Historia";
import { Comunidad } from "@/componentes/Comunidad";
import { Cierre } from "@/componentes/Cierre";
import { BarraMovil } from "@/componentes/BarraMovil";

export default function PaginaInicio() {
  return (
    <Proveedores>
        <Encabezado />
        <main id="contenido">
          <Hero />
          <Cifras />
          <AsistenteCarrito />
          <Sucursales />
          <Entregas />
          <SigoCreditos />
          <Historia />
          <Comunidad />
          <Cierre />
        </main>
        <BarraMovil />
    </Proveedores>
  );
}
