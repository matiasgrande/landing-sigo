// Catálogo de DEMOSTRACIÓN para el asistente de carrito.
// Precios referenciales en USD; no provienen del ERP.
export type UnidadVenta = "unidad" | "kg";

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  presentacion: string;
  precioUsd: number;
  unidad: UnidadVenta;
  categoria: string;
  /** Palabras clave normalizadas (sin acentos, singular) */
  claves: string[];
}

export const CATALOGO_DEMO: readonly ProductoCatalogo[] = [
  { id: "harina-pan", nombre: "Harina de maíz P.A.N.", presentacion: "1 kg", precioUsd: 1.2, unidad: "unidad", categoria: "Víveres", claves: ["harina", "pan", "maiz", "arepa"] },
  { id: "arroz", nombre: "Arroz Mary", presentacion: "1 kg", precioUsd: 1.4, unidad: "unidad", categoria: "Víveres", claves: ["arroz", "mary"] },
  { id: "pasta", nombre: "Pasta Ronco", presentacion: "1 kg", precioUsd: 1.6, unidad: "unidad", categoria: "Víveres", claves: ["pasta", "espagueti", "spaghetti", "fideo", "ronco"] },
  { id: "aceite", nombre: "Aceite vegetal", presentacion: "1 L", precioUsd: 3.2, unidad: "unidad", categoria: "Víveres", claves: ["aceite"] },
  { id: "azucar", nombre: "Azúcar refinada", presentacion: "1 kg", precioUsd: 1.3, unidad: "unidad", categoria: "Víveres", claves: ["azucar"] },
  { id: "sal", nombre: "Sal marina de Margarita", presentacion: "1 kg", precioUsd: 0.6, unidad: "unidad", categoria: "Víveres", claves: ["sal"] },
  { id: "cafe", nombre: "Café molido", presentacion: "500 g", precioUsd: 4.5, unidad: "unidad", categoria: "Víveres", claves: ["cafe"] },
  { id: "caraotas", nombre: "Caraotas negras", presentacion: "500 g", precioUsd: 1.5, unidad: "unidad", categoria: "Víveres", claves: ["caraota", "frijol", "negra"] },
  { id: "atun", nombre: "Atún en lata", presentacion: "140 g", precioUsd: 1.8, unidad: "unidad", categoria: "Víveres", claves: ["atun", "lata"] },
  { id: "sardina", nombre: "Sardinas en lata", presentacion: "170 g", precioUsd: 1.0, unidad: "unidad", categoria: "Víveres", claves: ["sardina"] },
  { id: "mayonesa", nombre: "Mayonesa", presentacion: "445 g", precioUsd: 3.1, unidad: "unidad", categoria: "Víveres", claves: ["mayonesa"] },
  { id: "salsa-tomate", nombre: "Salsa de tomate", presentacion: "397 g", precioUsd: 2.2, unidad: "unidad", categoria: "Víveres", claves: ["salsa", "ketchup"] },
  { id: "galletas", nombre: "Galletas de soda", presentacion: "paquete", precioUsd: 0.9, unidad: "unidad", categoria: "Chucherías", claves: ["galleta", "soda"] },
  { id: "leche-liquida", nombre: "Leche completa", presentacion: "1 L", precioUsd: 1.9, unidad: "unidad", categoria: "Lácteos", claves: ["leche", "liquida", "litro"] },
  { id: "leche-polvo", nombre: "Leche en polvo", presentacion: "400 g", precioUsd: 5.8, unidad: "unidad", categoria: "Lácteos", claves: ["leche", "polvo"] },
  { id: "yogurt", nombre: "Yogurt", presentacion: "1 L", precioUsd: 2.4, unidad: "unidad", categoria: "Lácteos", claves: ["yogurt", "yogur"] },
  { id: "mantequilla", nombre: "Margarina", presentacion: "500 g", precioUsd: 2.8, unidad: "unidad", categoria: "Lácteos", claves: ["mantequilla", "margarina"] },
  { id: "queso-blanco", nombre: "Queso blanco duro", presentacion: "por kg", precioUsd: 7.5, unidad: "kg", categoria: "Charcutería", claves: ["queso", "blanco", "duro", "llanero"] },
  { id: "queso-amarillo", nombre: "Queso amarillo", presentacion: "por kg", precioUsd: 9.8, unidad: "kg", categoria: "Charcutería", claves: ["queso", "amarillo", "gouda"] },
  { id: "jamon", nombre: "Jamón de pierna", presentacion: "por kg", precioUsd: 8.9, unidad: "kg", categoria: "Charcutería", claves: ["jamon"] },
  { id: "huevos-30", nombre: "Huevos", presentacion: "cartón de 30", precioUsd: 6.5, unidad: "unidad", categoria: "Víveres", claves: ["huevo", "carton"] },
  { id: "huevos-12", nombre: "Huevos", presentacion: "docena", precioUsd: 2.9, unidad: "unidad", categoria: "Víveres", claves: ["huevo", "docena"] },
  { id: "pollo", nombre: "Pollo entero", presentacion: "por kg", precioUsd: 3.8, unidad: "kg", categoria: "Carnicería", claves: ["pollo", "entero"] },
  { id: "pechuga", nombre: "Pechuga de pollo", presentacion: "por kg", precioUsd: 5.9, unidad: "kg", categoria: "Carnicería", claves: ["pechuga", "pollo", "filete"] },
  { id: "carne-molida", nombre: "Carne molida", presentacion: "por kg", precioUsd: 7.2, unidad: "kg", categoria: "Carnicería", claves: ["carne", "molida"] },
  { id: "carne-parrilla", nombre: "Punta trasera para parrilla", presentacion: "por kg", precioUsd: 11.5, unidad: "kg", categoria: "Carnicería", claves: ["carne", "parrilla", "punta", "trasera", "asado"] },
  { id: "pescado", nombre: "Pargo fresco", presentacion: "por kg", precioUsd: 9.0, unidad: "kg", categoria: "Pescadería", claves: ["pescado", "pargo", "chucho", "mero"] },
  { id: "tomate", nombre: "Tomate", presentacion: "por kg", precioUsd: 1.8, unidad: "kg", categoria: "Frutas y vegetales", claves: ["tomate"] },
  { id: "cebolla", nombre: "Cebolla", presentacion: "por kg", precioUsd: 1.5, unidad: "kg", categoria: "Frutas y vegetales", claves: ["cebolla"] },
  { id: "papa", nombre: "Papa", presentacion: "por kg", precioUsd: 1.6, unidad: "kg", categoria: "Frutas y vegetales", claves: ["papa", "patata"] },
  { id: "platano", nombre: "Plátano", presentacion: "por kg", precioUsd: 1.1, unidad: "kg", categoria: "Frutas y vegetales", claves: ["platano"] },
  { id: "cambur", nombre: "Cambur", presentacion: "por kg", precioUsd: 1.0, unidad: "kg", categoria: "Frutas y vegetales", claves: ["cambur", "banana", "guineo"] },
  { id: "aguacate", nombre: "Aguacate", presentacion: "unidad", precioUsd: 1.2, unidad: "unidad", categoria: "Frutas y vegetales", claves: ["aguacate"] },
  { id: "limon", nombre: "Limón", presentacion: "por kg", precioUsd: 2.0, unidad: "kg", categoria: "Frutas y vegetales", claves: ["limon"] },
  { id: "pan-sandwich", nombre: "Pan de sándwich", presentacion: "paquete", precioUsd: 2.6, unidad: "unidad", categoria: "Panadería", claves: ["pan", "sandwich", "molde", "cuadrado"] },
  { id: "agua", nombre: "Agua mineral", presentacion: "5 L", precioUsd: 2.2, unidad: "unidad", categoria: "Bebidas", claves: ["agua", "botellon"] },
  { id: "refresco", nombre: "Refresco Coca-Cola", presentacion: "2 L", precioUsd: 2.3, unidad: "unidad", categoria: "Bebidas", claves: ["refresco", "coca", "cola", "soda"] },
  { id: "cerveza", nombre: "Cerveza", presentacion: "lata 355 ml", precioUsd: 1.0, unidad: "unidad", categoria: "Licores", claves: ["cerveza", "birra", "polar"] },
  { id: "ron", nombre: "Ron añejo", presentacion: "0,75 L", precioUsd: 14.0, unidad: "unidad", categoria: "Licores", claves: ["ron"] },
  { id: "hielo", nombre: "Hielo", presentacion: "bolsa 3 kg", precioUsd: 1.5, unidad: "unidad", categoria: "Bebidas", claves: ["hielo"] },
  { id: "carbon", nombre: "Carbón vegetal", presentacion: "3 kg", precioUsd: 4.0, unidad: "unidad", categoria: "Hogar", claves: ["carbon"] },
  { id: "papel", nombre: "Papel higiénico", presentacion: "4 rollos", precioUsd: 2.4, unidad: "unidad", categoria: "Limpieza", claves: ["papel", "higienico", "rollo", "toilet"] },
  { id: "detergente", nombre: "Detergente en polvo", presentacion: "1 kg", precioUsd: 3.6, unidad: "unidad", categoria: "Limpieza", claves: ["detergente", "jabon", "polvo", "ropa"] },
  { id: "jabon-bano", nombre: "Jabón de baño", presentacion: "unidad", precioUsd: 0.9, unidad: "unidad", categoria: "Cuidado personal", claves: ["jabon", "bano", "tocador"] },
  { id: "cloro", nombre: "Cloro", presentacion: "1 L", precioUsd: 1.1, unidad: "unidad", categoria: "Limpieza", claves: ["cloro", "lejia"] },
  { id: "panales", nombre: "Pañales", presentacion: "paquete", precioUsd: 12.0, unidad: "unidad", categoria: "Bebés", claves: ["panal", "bebe"] },
];
