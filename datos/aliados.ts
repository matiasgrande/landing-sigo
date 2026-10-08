// Marcas aliadas: logos tomados del catálogo de fabricantes de sigo.com.ve
import type { StaticImageData } from "next/image";
import alimentosPolar from "@/recursos/marcas/alimentos-polar.webp";
import cocaColaFemsa from "@/recursos/marcas/coca-cola-femsa.webp";
import alimentosMary from "@/recursos/marcas/alimentos-mary.webp";
import natulac from "@/recursos/marcas/natulac.webp";
import ronco from "@/recursos/marcas/ronco.webp";
import alfonzoRivas from "@/recursos/marcas/alfonzo-rivas.webp";
import laLucha from "@/recursos/marcas/la-lucha.webp";
import pepsico from "@/recursos/marcas/pepsico.webp";
import heinz from "@/recursos/marcas/heinz.webp";
import procterGamble from "@/recursos/marcas/procter-gamble.webp";
import vimaFoods from "@/recursos/marcas/vima-foods.webp";

export interface MarcaAliada {
  nombre: string;
  logo: StaticImageData;
}

export const MARCAS_ALIADAS: readonly MarcaAliada[] = [
  { nombre: "Alimentos Polar", logo: alimentosPolar },
  { nombre: "Coca-Cola FEMSA", logo: cocaColaFemsa },
  { nombre: "Alimentos Mary", logo: alimentosMary },
  { nombre: "Natulac", logo: natulac },
  { nombre: "Pastas Ronco", logo: ronco },
  { nombre: "Alfonzo Rivas & Cía.", logo: alfonzoRivas },
  { nombre: "La Lucha", logo: laLucha },
  { nombre: "PepsiCo", logo: pepsico },
  { nombre: "Heinz", logo: heinz },
  { nombre: "Procter & Gamble", logo: procterGamble },
  { nombre: "Vima Foods", logo: vimaFoods },
];
