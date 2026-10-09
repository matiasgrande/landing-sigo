# Análisis para el rediseño del e-commerce de SIGO

Fecha: 9 de octubre de 2026. Este documento consolida tres fuentes:

- `docs/investigacion/04-ecommerce-nacional.md`: tiendas en línea de supermercados en Venezuela, verificadas en vivo en móvil y escritorio.
- `docs/investigacion/05-ecommerce-internacional.md`: referentes de América Latina, Europa y EE. UU., con evidencia pública de Baymard.
- La extracción del catálogo real de SIGO, hecha con `scripts/extraer-catalogo.mjs`. Se tomó de las tiendas activas Costazul y Sambil el 9 de octubre de 2026 y dio 5.273 productos con precio, de los cuales 4.430 están disponibles.

Las capturas están en `docs/investigacion/capturas-ecommerce/`. Los datos marcados [NV] en los informes no se pudieron verificar en vivo.

---

## 1. Cómo está armado hoy el e-commerce de SIGO

| Aspecto | Situación actual |
|---|---|
| Plataforma | nopCommerce multitienda. Todas las tiendas comparten IDs de producto, pero cada una tiene su propio precio y disponibilidad. |
| Tiendas | `costazul.sigo.com.ve` y `sambil.sigo.com.ve` venden, cada una con su propio carrito. `www.sigo.com.ve` es una vitrina **desactualizada**: tiene menos productos, otros precios y muchos "PRÓXIMAMENTE". |
| Entrada | El cliente elige la sucursal tocando dos banners de imagen, sin saber cuál le conviene por zona. |
| Catálogo | 139 rutas en el menú y 351 nodos de categoría con productos repetidos en varias. Hay enlaces cruzados: "Varias" bajo Harinas lleva a `/brochas-y-pinceles` y "Frutas y Vegetales" aparece duplicada. |
| Búsqueda | No tolera errores: "hrina" devuelve 0 resultados. No muestra sugerencias. |
| Listado | Grilla de 2 columnas con stepper. El botón dice "AÑADIR AL CARRI…" (truncado). No muestra precio por unidad ni ofertas visibles, y las estrellas aparecen vacías. |
| Carrito y checkout | 5 pasos. El envío se calcula recién en el checkout y no se informa el mínimo de compra. |
| Moneda | Precios en USD sin tasa BCV visible. |
| Calidad de datos | Hay precios en $0, precios anómalos (una harina a $23.69 en `www`) y textos sin traducir ("Custom List"). |
| Tamaño real | 5.273 productos con precio, de los cuales 4.430 están disponibles. 5.259 están en ambas tiendas y 179 tienen precio distinto entre Costazul y Sambil. `www` solo muestra 3.149 y con precios viejos. Los departamentos más grandes son Víveres (1.144), Cuidado personal (696), Chucherías (640) y Farmacia (632). |

## 2. Qué hace la competencia

### Venezuela (estándar del mercado)
- **Precios y moneda:**
  - Precio de referencia en USD con la tasa BCV visible. Gama separa Ref + IVA + Total y avisa el IGTF en el carrito.
  - Río muestra "Ahorro REF x" con precio tachado y precio por kg o unidad.
- **Ubicación antes de comprar:**
  - Gama pide municipio y urbanización y asigna la sucursal.
  - Río pregunta "A domicilio / En tienda" al primer "Agregar".
- **Búsqueda:** Río tolera errores ("hrina" encuentra lo mismo que "harina").
- **Carrito:** Gama muestra el monto que falta para el mínimo ("debe agregar al menos Ref. 13,00 más").
- **Ficha y móvil:**
  - Farmatodo muestra la entrega estimada por producto, "Avísame cuando esté disponible" y productos similares.
  - Kromi tiene barra inferior en móvil.
- **Pagos:** el patrón es "paga y reporta" (Zelle, Pago Móvil y otros), con tiempos de confirmación distintos según el medio.
- **Huecos que nadie cubre:** listas de compra, "comprar de nuevo", sustitutos elegidos por el cliente y seguimiento del pedido. Tampoco vi compra como invitado.

### Internacional
- **Agregar desde la grilla:** el botón "Agregar" se convierte en stepper dentro del listado, en todos los referentes.
- **Autocompletado en bloques:** términos, categorías y 2-3 productos con precio, más "Ver todos" (Jumbo, Éxito, PriceSmart).
- **Búsqueda por lista:** Jumbo Argentina tiene "Buscar por Lista" e Instacart tiene "Shop your list". Ninguno interpreta cantidades ni arma un carrito editable.
- **Comprar de nuevo:** es el primer atajo en Albert Heijn y Ocado.
- **Asistentes con IA:** Walmart Sparky, Ask Instacart, Amazon Rufus y Woolworths Olive. Ninguno opera en la región.
- **Carrito de invitado:** se pide la dirección solo al cerrar la compra; Mercadona lo hace en escritorio.
- **Peso de las páginas:** los referentes regionales pesan de 3 a 13 MB en móvil, así que no sirven como modelo para conexiones lentas.

## 3. Oportunidades para SIGO

1. **Una sola tienda y un solo carrito.** El cliente elige "Delivery o retiro" y el municipio o sector, y el sistema asigna Costazul o Sambil y la tarifa.
2. **Llevar el asistente "Escribe tu lista" a la tienda.** Nadie en Venezuela lo tiene y ningún referente internacional interpreta cantidades. El prototipo ya funciona con los 5.273 productos reales, calcula paquetes por peso ("2 kg de carne" da 5 paquetes de 400 g) y ofrece alternativas por línea.
3. **Transparencia antes del checkout:** tasa BCV, monto en Bs., mínimo de compra, costo de envío por municipio e IGTF según el medio de pago.
4. **Búsqueda tolerante a errores y con sinónimos venezolanos:** "harina pan", "cambur", "pasta dental".
5. **Diferenciales de retención:** comprar de nuevo, listas guardadas, sustitutos elegidos por el cliente, envío del pedido por WhatsApp y Sigo Créditos visible en el checkout.

## 4. Propuesta de estructura por pantalla

| Pantalla | Contenido propuesto |
|---|---|
| Barra superior | Tasa BCV con fecha, "Entregar en: [municipio] · Modificar", buscador y carrito con total. |
| Home de tienda | Buscador y "Escribe tu lista" como protagonistas, comprar de nuevo, ofertas con vigencia, 9–12 departamentos e información de entregas. |
| Búsqueda | Autocompletado en 3 bloques (términos, categorías, productos con foto y precio), tolerancia a errores y sinónimos. |
| Listado (PLP) | Grilla de 2 columnas en móvil. Tarjeta con foto, precio USD y Bs., precio por kg o litro, badge de oferta y "Agregar" que pasa a stepper. Paginación numerada. |
| Ficha (PDP) | Fotos, precio, presentaciones como variantes, similares, "Avísame si vuelve" y botón de compra fijo en móvil. |
| Carrito | Lateral en escritorio y página en móvil. Muestra mínimo y monto faltante, envío por municipio, sustitutos por línea, "guardar para después" y "enviar por WhatsApp". |
| Checkout | 3 pasos (entrega, pago, confirmar), compra como invitado, pagos locales con tiempos de confirmación, Cashea y Sigo Créditos. |
| Móvil | Barra inferior con Inicio, Buscar, Mi lista y Carrito. Peso objetivo de menos de 1 MB en la home. |

## 5. Ruta sugerida

- **P0, base:**
  - Unificar Costazul y Sambil bajo una sola experiencia.
  - Limpiar el catálogo: precios en $0, "PRÓXIMAMENTE", enlaces cruzados y textos sin traducir.
  - Agregar tasa BCV, búsqueda tolerante y tarjetas con stepper.
- **P1, conversión:**
  - Carrito transparente (mínimo, envío, IGTF).
  - Checkout de 3 pasos con compra como invitado y barra inferior en móvil.
  - "Escribe tu lista" integrado a la tienda.
- **P2, retención:** comprar de nuevo, listas, sustitutos, seguimiento del pedido, recetas a carrito y lealtad.

**Arquitectura recomendada:** un frontend nuevo en Next.js sobre el nopCommerce actual (*headless*, mediante su plugin Web API), sin migrar la operación. Antes de decidir hay que confirmar con TI:

- La versión de nopCommerce y si se pueden instalar plugins.
- El acceso al catálogo por exportación o API.
- La relación con el ERP como fuente de precios e inventario.
