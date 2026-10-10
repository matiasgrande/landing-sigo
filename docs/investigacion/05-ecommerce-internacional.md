# Benchmark internacional de TIENDAS ONLINE de supermercado (para el rediseño del e-commerce de SIGO)

Fecha de captura: 9-oct-2026. Alcance: la **tienda** (home de tienda, buscador, listados, ficha, carrito, checkout), no la landing institucional (eso está en `01-competencia-internacional.md`).

Método: Playwright/Chromium (`/opt/pw-browsers/chromium-1194`) a 390 px (móvil, UA iPhone) y 1366 px (escritorio), con interacción real (escribir en el buscador, agregar al carro, abrir ficha) cuando el sitio lo permitió. Complemento con WebSearch/WebFetch para IA, lealtad y estudios de Baymard. Capturas en `capturas-ecommerce/` (prefijo `int-`, 21 JPG, todas menores de 70 KB).

## 0. Leyenda de verificación y limitaciones

| Marca | Significado |
|---|---|
| **[V]** | Verificado en vivo (DOM/captura) el 9-oct-2026 |
| **[P]** | Verificación parcial: se vio la pantalla pero no se completó el flujo, o solo en un dispositivo |
| **[NV]** | No verificado en vivo (sitio bloqueado o flujo tras login). Se declara la fuente |

Bloqueados o con anti-bot (todo su detalle es **[NV]**, salvo lo que cuenta la fuente citada):

| Sitio | Qué pasó |
|---|---|
| Walmart US y Walmart MX (Grocery) | "Robot or human?" / "Verifica tu identidad" (PerimeterX) |
| Líder (CL) | "Robot or human?" |
| Carrefour España | 403 + desafío Cloudflare |
| Woolworths AU | Akamai "Access Denied" |
| Tesco | Móvil 403; escritorio carga la home con aviso de privacidad pero la búsqueda da "Access Denied" |
| Albert Heijn | Home carga; `/zoeken` da "Access Denied" (la búsqueda no se pudo ejecutar) |
| Getir | "Human Verification" |
| Glovo | Home carga (solo selector de dirección); catálogo exige dirección **[P]** |

Limitaciones generales:
- Los pesos de página (KB) se midieron sumando la cabecera `content-length` de las respuestas, así que son una **cota inferior** (se excluyen respuestas con transferencia fragmentada). No son Core Web Vitals ni se hizo Lighthouse. Sirven para ordenar sitios entre sí, no como cifras absolutas.
- Ningún flujo de pago se completó. Todo lo que está tras login o dirección de entrega (franjas, mínimos de compra, propinas, sustituciones) es **[NV]** o viene de fuentes citadas.
- Las funciones de IA se documentan con fuentes secundarias (prensa, notas de empresa); no se probaron.
- Precios y campañas son de la fecha de captura.

---

## 1. Resumen ejecutivo

1. **La tienda de supermercado ganadora es aburrida y rápida.** Mercadona (la referencia de "menos es más") entrega una tienda de rejilla limpia: buscador arriba, carrito como "píldora" con contador y total, ficha como modal sobre el listado y árbol de categorías a la izquierda. No hay folleto, ni mega-menú, ni carruseles de marketing. En móvil ni siquiera tiene tienda web: obliga a descargar la app **[V, UA iPhone]**. Picnic hace lo mismo (la web solo es marketing + "Download app") **[V]**.
2. **Agregar sin salir de la grilla es universal** (Mercadona, Jumbo CL/AR, Éxito, Carulla, Ocado, Instacart, Amazon Fresh). El botón "Agregar" se convierte en un **stepper** (− / cantidad / +; en Jumbo CL aparece además un papelera y un selector "1 un ▾") **[V]**.
3. **El invitado entra sin fricción.** Mercadona deja agregar al carro sin cuenta y solo pregunta "¿Ya tienes cuenta?" después de la primera adición **[V]**. Jumbo CL agrega sin elegir dirección ni método de entrega **[V]**. Rappi y Amazon Fresh piden dirección/código postal primero (necesario para disponibilidad); Mercadona pide código postal por la misma razón **[V]**.
4. **Búsqueda: tres niveles de calidad.**
   - Mercadona: resultados en vivo mientras se escribe, sin menú desplegable, con facetas Categoría/Marca; escribir "lec" o "lece" devuelve leches **[V]**.
   - Jumbo CL, Jumbo AR, Éxito, Carulla, PriceSmart: **autocompletado con términos + marcas + categorías + 3 productos con precio** y "Ver todos los N productos" **[V]**.
   - **Búsqueda por lista**: Jumbo Argentina tiene un botón "Buscar por Lista" (icono junto a la lupa) que abre un modal "Escribí acá tu lista de compra. Presioná enter después de cada producto, o separalos por comas (Ejemplo: Arroz, azúcar, leche..)" con botón "Buscar productos" **[V la interfaz; no se pudo verificar el resultado]**. Éxito y Carulla muestran en el desplegable "Para buscar varios productos, escribelo separados por comas" **[V el texto]**. Esto es exactamente la mecánica de la landing de SIGO, pero llevada a la tienda y sin IA.
5. **Precio por unidad de medida es obligatorio en la región**: "$1.200 x lt" (Jumbo CL), "Precio regular x lt." (Jumbo AR), "(Ml a $ 4,35)" (Éxito), "0,81 €/L" (Mercadona, en la ficha), "£11.67 per kilo" (Ocado) **[V]**.
6. **Pesos de página**: las tiendas LATAM grandes son pesadas (Éxito ~7.8 MB, Carulla ~5.3 MB, Chedraui ~13 MB de cota inferior en la home; Jumbo CL ~3 MB, Jumbo AR ~1.7-3.5 MB). Mercadona cargó una búsqueda completa (100 productos con imagen) con ~8 MB de cota inferior, pero con rejilla simple. Ninguno es amigable para conexión lenta. Para SIGO ese es un diferenciador alcanzable.
7. **IA conversacional ya es estándar en los gigantes**, pero con foco en planificar comidas y llenar carrito: Walmart Sparky (jun-2025), Ask Instacart (may-2023, ChatGPT), Amazon Rufus renombrado "Alexa for Shopping" (13-may-2026) y Alexa+, Woolworths Olive con Gemini (jun-2026: planes de comidas, foto de receta a carrito, "Snap & Shop" de lista manuscrita, "Smart Baskets") (fuentes en sección 6). Nadie de la región (Jumbo, Éxito, Carulla) tiene IA visible en la tienda; lo más cercano es la caja de lista. SIGO puede ser el primero en LATAM con "lista de texto → carrito" integrado.
8. **Baymard (2026)**: los problemas que persisten en grocery son sustituciones invisibles hasta el checkout, "Guardar para después" ausente en el carro, "Comprar de nuevo" enterrado, y franjas agotadas descubiertas tarde. Los cinco ejemplos son de móvil (fuente en sección 7).

---

## 2. Tabla comparativa por función

Convenciones: **S** = sí, **N** = no visto, **—** = no verificable. Entre corchetes el nivel de evidencia.

| Función | Mercadona ES | Jumbo CL | Jumbo AR | Éxito / Carulla CO | PriceSmart CR | Ocado UK | Albert Heijn NL | Instacart US | Amazon Fresh US | Rappi CO | Picnic NL |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tienda web móvil usable | **No** (app) [V iPhone] | S [V] | S [V] | S [V] | S [V] | S [V] | S [V home] | Empuja app, permite "Continue in browser" [V] | S [V] | S, pide dirección [V] | **No** (app) [V] |
| Puerta de entrada | Código postal (modal) [V] | Barra "¿Cómo recibirás tu compra?" no bloqueante [V] | "Seleccioná el método de entrega" [V] | "¿Cómo quieres recibir tu pedido?" [V] | "Seleccionar entrega" [V] | "Check if we deliver to you" [V] | Cookies + home [V] | Elegir tienda [V] | Zip (Dallas 75201 por defecto) [V] | Dirección primero [V] | — |
| Compra como invitado / agregar sin cuenta | S, con aviso "¿Ya tienes cuenta?" [V] | S sin dirección [V] | — | — | — | — | — | Requiere signup para $0 envío [V texto] | — | — | — |
| Autocompletado con productos | N (resultados en vivo) [V] | Términos+Marcas+Categorías [V] | Términos+Categorías+3 productos+"Ver todos los 174" [V] | Productos+marcas+"Buscar en Mercado" [V] | Términos+3 productos [V] | — [NV] | — [NV] | "Search products and stores" [V] | — | — | — |
| Tolerancia a errores | "lece"→leches [V] | — | — | — | — | — | — | — | — | — | — |
| Búsqueda por lista / multi-ítem | Pestaña **"Listas"** en el menú [V presencia] | N | **"Buscar por Lista"** modal [V UI] | Hint: separar por comas [V texto] | N | — | — | — | — | — | — |
| Filtros | Facetas Categoría + Marca [V] | Chips de categoría + botón filtro [V] | "Filtrar" + Depto/Categoría/Subcategoría [V] | "Filtrar" + "Ordenar por" [V] | — | "Filter by Categories" [V] | — | — | — | — | — |
| Orden | — | — | RELEVANCIA [V] | Relevancia [V] | — | "Favourites first" [V] | — | — | — | — | — |
| Paginación vs scroll | Cap 100 resultados, sin páginas [V] | Scroll [P] | **Paginada** "Página 1 de 9" [V] | Paginación por URL `page=0` [V] | **Paginada** "12 de 178 ítems 1 2 3…15" [V] | — | — | — | — | — | — |
| Precio por unidad | €/L en ficha; "/pack", "/ud." en tarjeta [V] | "$1.200 x lt" en tarjeta [V] | "Precio regular x lt." [V] | "(Ml a $ 4,35)" [V] | No visto (packs) [V] | "£11.67 per kilo" [V] | — | — | — | — | — |
| Agregar rápido con stepper | S, "Añadir al carro"→"En carro 1 pack" [V] | S, papelera / "1 un ▾" / + [V] | Botón "Agregar" [V] | "Agregar" [V] | — | "Add" [V] | — | "Add" [V] | — | — | — |
| Badges | Precio anterior tachado en rojo [V] | "Patrocinado", "Lleva 2 por $…", rating [V] | -33%, "2do al 70%", Prime [V] | -25%, "Favoritos del pasillo", "Vendido por" [V] | "Disponible" (stock) [V] | "Life 2d+", Vegetarian, rating, nombre de oferta [V] | Bonus (1+1 gratis, 2+3) [V] | "Many in stock", "Spend $35, save $5", "limit 5" [V] | — | — | — |
| Ficha: nutrición | 2ª foto = etiqueta nutricional [V visual] | — | — | — | — | — | — | Hay artículo de Instacart sobre datos nutricionales [P] | — | — | — |
| Ficha: relacionados | **"Productos relacionados"** carrusel [V] | — | — | — | — | — | — | — | — | — | — |
| Carrito persistente | Píldora en cabecera con N° y total [V] | Badge en cabecera [V] | "MI CARRITO" en cabecera [V] | Icono en cabecera [V] | Barra inferior con carrito [V] | Chip "£0.00 / £40.00" en cabecera [V] | Cesta con total "0.00" en cabecera [V] | — | "0" en cabecera [V] | Carrito en cabecera [V] | App |
| Mínimo de compra | €50 (prueba 2019 Valencia, Xataka) [NV] | — | — | Envío gratis desde $250.000 (Carulla) [V] | — | Chip de £40 junto al total [P] | — | "$0 delivery fee on $10" [V] | — | — | — |
| Franjas horarias | Franjas de 1 h, entrega día siguiente (Xataka) [NV] | — | "programá tu entrega" [V] | — | — | — | — | "Delivery by 3:38-4:37pm" [V] | — | — | 1 h reducida a 20 min el mismo día (blog) [NV] |
| Sustituciones | — | — | — | — | — | "next-to-no substitutions" (promesa de marca) [V] | — | Best match / Specific / Don't replace (fuentes) [NV] | — | — | — |
| Lealtad / recompra | "Mis habituales" (Xataka) [NV] | Puntos Cencosud, Tarjeta Cencosud [V desktop] | Descuentos bancarios, reintegros, Prime [V] | Puntos Colombia, cashback, referidos [V] | Membresía (club) [V] | Smart Pass, Rewards [V] | **"Eerder gekocht"**, Mijn Bonus Box, Premium [V] | Costco/Instacart+ [V parcial] | "Tú" [V] | Rappi Prime [NV] | — |
| IA visible en tienda | N | N | N (solo caja de lista) | N | N | — | — | Ask Instacart [NV, fuente] | Rufus / Alexa for Shopping [NV, fuente] | — | — |
| Barra inferior móvil | N (app) | N | N | N | **S** (4 iconos: inicio, carrito, tarjeta, menú) [V] | N | N | — | N | — | App |

---

## 3. Fichas por referente

### 3.1 Mercadona (ES) — tienda.mercadona.es [V escritorio; móvil web = app]
- **Móvil**: con UA iPhone la web **no ofrece tienda**: muestra "Descarga la app para comprar desde tu móvil o tablet" con botón App Store y un mockup (captura `int-mercadona-movil-web-solo-app-390px.jpg`). Solo se probó UA iPhone **[P]**.
- **Home (escritorio)**: cabecera con logo, buscador pastilla, **Categorías**, **Listas**, "Identifícate" y el carro. Franja "Identifícate y añade tu dirección para conocer la próxima entrega disponible". Carruseles: "Productos del momento" (banner de campaña), "Novedades", "Bajadas de precio" (precio anterior tachado), cada tarjeta con "Añadir al carro". Modal inicial: "Introduce tu código postal para poder acceder al surtido disponible en tu zona" (input de 5 dígitos, botón CONTINUAR).
- **Navegación**: "Categorías" abre una página con **árbol lateral de 3 niveles con iconos** y el contenido de la subcategoría en secciones (ej.: Aceite, vinagre y sal → "Aceite de oliva"…) (`int-mercadona-arbol-categorias-1366px.jpg`).
- **Búsqueda**: sin autocompletado desplegable; la página de resultados se actualiza mientras se escribe ("Mostrando 100 resultados para 'lec'"), con facetas **Categoría** y **Marca** y botón "Filtrar resultados". Escribir "lec" o "lece" (errata) devolvió leches (`int-mercadona-plp-busqueda-1366px.jpg`).
- **PLP**: rejilla de 4 columnas en escritorio. Tarjeta: foto cuadrada con insignia de formato ("6x1L"), nombre, formato ("6 briks x 1 L"), precio en negrita con unidad ("5,76 € /pack", "0,96 € /ud."), precio anterior tachado y actual en rojo en ofertas, botón "Añadir al carro". Al pulsar se convierte en control de cantidad ("En carro 1 pack") y la cabecera muestra la píldora amarilla "1 · 4,98 €".
- **PDP**: **modal sobre el listado** (no cambia de página): migas "Huevos, leche y mantequilla > Leche y bebidas vegetales", "Compartir", galería con 3 fotos (frontal, **etiqueta/valores nutricionales**, formato unitario), precio con **precio por litro** ("6 briks x 1 L | 0,81 €/L"), "Añadir al carro", **"Productos relacionados"** (variantes del mismo producto: sin lactosa, formato unidad, 1,5 L, otras marcas) y aviso "El envase o el producto mostrado puede no estar actualizado" (`int-mercadona-pdp-modal-1366px.jpg`).
- **Carrito/invitado**: se puede agregar sin sesión; tras la primera adición aparece el modal "¿Ya tienes cuenta? Si ya añadiste productos desde tu cuenta, recuerda identificarte para no perderlos" con "Identifícate" / "Ahora no" (`int-mercadona-carrito-invitado-1366px.jpg`). Checkout no recorrido **[NV]**.
- **Listas**: pestaña "Listas" visible en el menú **[V presencia]**; contenido tras login **[NV]**. Xataka documenta "Mis habituales" junto a buscador y categorías, mínimo de €50, envío €7,21 y franjas de 1 h en la versión de prueba de Valencia (2019/2020) **[NV, fuente antigua]**.
- **Rendimiento**: la página de búsqueda con 100 productos y fotos transfirió ≥ 8 MB (cota inferior).
- **Lección**: puerta de código postal + rejilla + carro invitado + ficha en modal + categorías en árbol. Cero marketing en la tienda.

### 3.2 Jumbo Chile (Cencosud) — jumbo.cl [V móvil y escritorio]
- **Home móvil**: barra superior "Centro de ayuda / Estado del pedido", cabecera (hamburguesa, logo, "Iniciar sesión", carrito), **buscador de ancho completo con lupa verde** debajo, barra **"¿Cómo recibirás tu compra?"** (no bloqueante), carrusel de banners, **círculos de historias** ("Circo Jumbo", "Ideas para cocinar", "Pastelería", "Experiencias Jumbo"), banner de lealtad (Prime). Luego "Lo más vendidos" con tarjetas: precio, **precio por unidad ("$795 x 500 g / $1.590 x kg")**, rating (3.4), "Agregar", insignia "Oferta Lleva 2 por $3.090" (`int-jumbo-cl-home-390px.jpg`). Escritorio añade "Puntos Cencosud", "Tarjeta Cencosud", Categorías, Ofertas, **Recetas**, "Tesoros Jumbo", "Suscríbete a…" **[P]**.
- **Búsqueda**: autocompletado de pantalla completa con **sugerencias de términos** ("leche sin lactosa, leche semidescremada, leche descremada, leche condensada"), **Marcas** ("Leche Sur") y **Categorías** ("Leches Cultivadas", "Manjar y Dulce de Leche"…) (`int-jumbo-cl-autocompletado-390px.jpg`). Resultados: "Búsqueda: leche · 366 productos", **chips de categoría** horizontales + botón de filtros.
- **PLP móvil**: **2 columnas**, tarjeta con foto, precio, precio por unidad, marca, nombre, rating, "Agregar". Hay productos "Patrocinado" mezclados. Al agregar, el botón se convierte en **stepper**: papelera / "1 un ▾" / "+" y el badge del carrito sube a 1; **se agregó sin elegir dirección ni método de entrega** (`int-jumbo-cl-plp-stepper-390px.jpg`).
- **Fricciones**: banner de cookies que ocupa media pantalla y un widget "¿Qué tan fácil es encontrar productos en Jumbo?" que se superpone a los botones inferiores.
- **Peso**: ≥ 3.0-3.4 MB y ~250 peticiones en la home móvil.

### 3.3 Jumbo Argentina (Cencosud, VTEX) — jumbo.com.ar [V]
- **Búsqueda por lista**: junto a la barra de búsqueda hay un **icono de lista**; el texto "Buscar por Lista" abre un modal: *"Escribí acá tu lista de compra. Presioná 'enter' después de cada producto, o separalos por comas. (Ejemplo: Arroz, azúcar, leche..)"* con papel rayado, "Borrar todo" y "Buscar productos" (`int-jumbo-ar-buscar-por-lista-1366px.jpg`). La interfaz se verificó; mi intento automatizado de escribir en el modal no devolvió resultados, así que el comportamiento del resultado (¿un listado por ítem? ¿primer match?) es **[NV]**.
- **Autocompletado**: "Sugerencias" (Leche, Lácteos, Leches Larga Vida, Leche Polvo, Leche Serenisima…) + **3 productos con precio y foto** + "Ver todos los 174 productos" (`int-jumbo-ar-autocompletado-390px.jpg`).
- **PLP**: rejilla de 2 columnas en móvil, barra "RELEVANCIA / FILTRAR", tarjeta con marca, nombre, precio, **"Precio regular x lt."**, **"PRECIO SIN IMPUESTOS NACIONALES: $…"** (requisito legal argentino), descuentos (-33%, "2do al 70%", "Llevando 2 $2.962,5 c/u"), botón "Agregar" verde. **Paginación numerada** ("1 2 3 4 · Página 1 de 9") en vez de scroll infinito (`int-jumbo-ar-plp-390px.jpg`).
- **Entrega**: "Seleccioná el método de entrega" (cabecera), "¡Envío en el día!… menos de 24 hs", "Realizá tu compra los días Miércoles y programá tu entrega para el día que prefieras". Modal de invitación a la app "Lo que te gusta de Jumbo ¡en una App!".

### 3.4 Éxito y Carulla (Colombia, Grupo Éxito) — exito.com / carulla.com [V móvil]
- **Éxito**: cabecera amarilla con **pestañas Mercado / Tecnología / Moda** (es un marketplace), hamburguesa, buscador "¿Qué buscas?", cuenta, carrito; atajos en texto (Super Combos, Ahorra todos los días…). Barra "¿Cómo quieres recibir tu pedido?". Promo del día en barra: "20% con cualquier medio de pago en frutas y verduras de 6:00 a.m. a 11:59 a.m.". Modal promocional al cargar y banner de cookies que tapa botones (`int-exito-plp-390px.jpg`).
- **Autocompletado**: "Para buscar varios productos, escribelo separados por comas" + productos sugeridos + "**Buscar en Mercado**" + "**Marcas para leche**" (Colanta, Alquería) + "Ver todos los resultados".
- **PLP**: "1129 resultados", "Ordenar por: Relevancia", "Filtrar", **conmutador rejilla/lista**, favoritos (corazón), etiqueta "Favoritos del pasillo". Tarjeta: precio tachado, % descuento, **"(Ml a $ 4,35)"**, "Vendido por: Exito" (modelo marketplace).
- **Carulla** (premium): mismas mecánicas; "Envío sin costo por compras de $250.000", "Compra y recoge", "Gana cashback", Puntos Colombia, **WhatsApp de ventas y de servicio** en el pie. Con "arroz,leche,huevos" en la URL `/s?q=` no devolvió productos; la función multi-producto es de la UI del buscador, no de la URL **[P]**.
- **Peso**: Éxito ≥ 7.8 MB / 281 peticiones; Carulla ≥ 5.3 MB / 275 (home móvil).

### 3.5 PriceSmart (club; Costa Rica) — pricesmart.com [V]
- **Barra inferior móvil de 4 iconos** (inicio, carrito, tarjeta/membresía, menú) (`int-pricesmart-barra-inferior-390px.jpg`).
- Franja azul "Seleccionar entrega" siempre visible; aviso "NUEVO servicio de entrega a domicilio en La Fortuna, Jacó…" (cobertura por zonas, similar a SIGO por municipio).
- Autocompletado: 5 términos + 3 productos. PLP: **estado de stock "Disponible"**, nombres con formato "12 Unidades / 1 L / 33.81 oz", **paginación numerada** ("12 de 178 ítems 1 2 3 … 15"). Sin precio por unidad (venta por pack, lógica club).
- Membresía como puerta de entrada ("Afiliarme"). Home ≥ 2.4 MB.

### 3.6 Chedraui (México) — chedraui.com.mx [P]
- Home con banner "Abrir la app de Chedraui", líneas **Chedraui Selecto / Chedraui veloz / Catálogo Extendido / MartiMiércoles**, "Agregar una dirección", "¿Dónde te entregaremos?". 
- **Peso: ≥ 13 MB y 390 peticiones** en la home móvil: el más pesado de la muestra. La búsqueda automatizada no navegó **[NV]**.

### 3.7 Ocado (UK) — ocado.com [V home y listado; búsqueda **[NV]**]
- **Cabecera móvil**: hamburguesa, logo, **chip de ubicación**, y un **chip de carrito con dos cifras: total (£0.00) y umbral (£40.00)**, es decir, muestra cuánto falta para el mínimo **[P: interpretación del segundo valor]**. Barra amarilla de oferta ("Save 25% on first order + 3 months unlimited free deliveries", código `25OCADO`, mínimo £60, tope £20).
- **Home**: "Your favourite groceries delivered", "Check if we deliver to you", promesas ("Unbeatable choice", **Ocado Price Promise** contra Tesco en 10.000+ productos, "**next-to-no substitutions**"), Smart Pass, Rewards.
- **Listado "All Products"**: orden **"Favourites first"** (tus compras habituales primero), "Filter by Categories". Tarjeta muy informativa: **"Life 2d+"** (vida útil garantizada del producto fresco), **etiquetas dietéticas** (Vegetarian), **rating con N° de reseñas**, nombre de la oferta, **precio por kilo** y precio anterior, botón amarillo "Add" (`int-ocado-plp-390px.jpg`).
- Peso: ≥ 2.1-2.4 MB.

### 3.8 Albert Heijn (NL) — ah.nl [P]
- **Móvil**: cabecera con menú, logo, "Inloggen", corazón (favoritos) y **cesta con total en la cabecera**. Buscador "Waar ben je naar op zoek?". Carruseles de campañas, "Shop per categorie" (lista de ~30 categorías con **"Eerder gekocht" (comprado antes) como primer atajo**), **"Uit de Bonusfolder"** (1+1 gratis, 2+3 gratis), **"Wat eten we vandaag?"** (recetas con tiempo de preparación, "budgetrecepten") (`int-ah-home-390px.jpg`).
- **Escritorio**: Producten / Bonus / Recepten / Meer, "Mijn Bonus Box" (ofertas personalizadas), "Premium voor €17.99 per jaar" (suscripción), "Win- en spaaracties", conmutador "Weergave" (modo oscuro).
- Búsqueda, PLP y PDP bloqueados por anti-bot **[NV]**. Home móvil ≥ 3-6 MB.

### 3.9 Instacart (US) — instacart.com [V home y storefront]
- **Home móvil**: "Order groceries for delivery or pickup today", "Sign up to get $0 delivery fee", buscador "Search products and stores", **fila de tiendas con ETA** ("ALDI By 2:45pm", "Sam's Club 1 hr", "Costco By 3:30pm"), interstitial de app con "Continue in browser" (`int-instacart-home-movil-390px.jpg`).
- **Storefront (Costco, escritorio)**: conmutador **Delivery / Pickup**, "Delivery by 3:38-4:37pm" (ventana ETA), "$0 delivery fee on $10", "Service fees apply", pestañas Shop / **Flyers** / **Browse aisles**; carruseles "Flyer deals", cada tarjeta con precio actual/original, "$3.50 off; limit 5", **"Many in stock"** (indicador de stock), "Spend $35, save $5", "Add" (`int-instacart-tienda-1366px.jpg`).
- **Sustituciones** (fuentes de ayuda de Instacart y guías, **[NV]**): tres modos: **Best match** (por defecto), **Specific replacement** (el cliente elige), **Don't replace** (reembolso). Se pueden dar instrucciones por ítem desde el carro, el checkout o incluso tras ordenar mientras el comprador no haya empezado; el cliente aprueba sustituciones en vivo vía chat.

### 3.10 Amazon Fresh (US) — amazon.com/fresh [V móvil parcial]
- Móvil: buscador "Buscar en Amazon Fresh", "**Entrega en Dallas 75201 - Actualizar ubicación**" (ubicación por defecto editable, no bloqueante), pestañas "Tú / Ahorros / Pasillos de compra", **chips circulares de departamento** (Productos agrícolas, Carnes y mariscos, Leche, quesos y huevos, Pan y repostería, Deli…), banner "Precios más bajos", carrusel "Frutas frescas" con precios por pieza (`int-amazonfresh-home-390px.jpg`).
- IA: Rufus (renombrado "Alexa for Shopping" el 13-may-2026) y Alexa+ (sección 6).

### 3.11 Rappi Turbo / Mercados (CO) — rappi.com.co [V móvil home; catálogo **[NV]**]
- Web móvil con **dirección primero**: "Ingresa tu dirección en Bogotá" + "Usar mi ubicación actual" + "Iniciar sesión para ver tus direcciones" (`int-rappi-direccion-primero-390px.jpg`). Superapp: Restaurantes, **Mercados**, Farmacia, Tiendas, **Turbo**, Licores, Travel; chips "Lo más buscado" (Cerveza, Papas, Coca cola, Agua…).
- Turbo opera dark stores de ~4.000 productos con promesa de 10 min (Forbes 2022; La Nación 2024, vía búsqueda) **[NV]**. Sustituciones, propina y mínimo: no se encontró fuente fiable **[NV]**.

### 3.12 Picnic (NL) — picnic.app [V]
- La web es una **página de marketing con "Download app"**; la compra es exclusivamente en la app. Peso de la página de marketing ≥ 15 MB (vídeo/imágenes) (`int-picnic-web-solo-app-390px.jpg`). Propuestas: "Altijd lage prijzen, altijd gratis bezorgd, altijd supervers". Fuentes secundarias: franja de 1 h que se reduce a 20 min el mismo día; se pueden agregar productos tras ordenar **[NV]**.

### 3.13 Otros
- **Tesco, Walmart, Líder, Carrefour ES, Woolworths, Getir, Glovo Market**: bloqueados o sin catálogo sin dirección; ver limitaciones. De Woolworths hay información de IA (sección 6).

---

## 4. Patrones dominantes por pantalla

### 4.1 Home de tienda
- **Principio**: la home de una tienda no es una landing; es un **atajo a la acción**: buscador visible, un selector de entrega ligero, y estantes de productos con "Agregar" ya en la home (Mercadona, Jumbo CL, Instacart, Amazon Fresh).
- **Estantes habituales** (en orden): campaña/oferta → novedades → "lo más vendido" → bajadas de precio → recetas. Los que personalizan ponen **"comprado antes" primero** (AH "Eerder gekocht" como primer atajo; Ocado "Favourites first"; Mercadona "Mis habituales" según fuente).
- **Entrada de zona**: tres modelos: (a) modal obligatorio de código postal (Mercadona), (b) barra no bloqueante "¿Cómo recibirás tu compra?" (Jumbo CL, Éxito, PriceSmart), (c) dirección primero (Rappi). Los que tienen invitado fuerte usan (b): se puede navegar y agregar sin fijar zona.
- **Anti-patrones vistos**: modales promocionales al cargar (Éxito, Jumbo AR), banners de cookies de media pantalla en móvil, y widgets de encuesta que tapan botones (Jumbo CL).

### 4.2 Navegación y búsqueda
- **Móvil**: hamburguesa + buscador de ancho completo siempre visible (Jumbo CL, Éxito, AH). **Escritorio**: menú "Categorías" que abre árbol (Mercadona lateral de 3 niveles con iconos) o mega-menú (Jumbo, Éxito) **[P]**.
- **Autocompletado ideal** (Jumbo CL/AR, Éxito, PriceSmart): términos populares + marcas + categorías + 2-3 productos con precio + "Ver todos los N".
- **Filtros**: marca y categoría como facetas principales; chips horizontales de categoría en móvil (Jumbo CL); "Ordenar por" con Relevancia por defecto.
- **Lista**: Jumbo AR (modal "Buscar por Lista"), Éxito/Carulla (comas), Mercadona (pestaña "Listas"). Ninguno convierte la lista en carrito de un toque ni usa IA para interpretar texto libre.

### 4.3 PLP (listado)
- **Tarjeta**: foto, marca, nombre+formato, precio, **precio por unidad de medida**, precio anterior tachado/% descuento, rating (Jumbo, Ocado), badge de oferta ("Lleva 2 por…"), estado de stock (PriceSmart "Disponible", Instacart "Many in stock", Ocado "Life 2d+"), botón "Agregar".
- **Agregar**: botón → stepper in situ (Mercadona, Jumbo CL). Jumbo CL añade papelera y selector de cantidad.
- **Grilla móvil**: 2 columnas (Jumbo CL/AR); Éxito ofrece conmutador rejilla/lista.
- **Paginación vs scroll**: **paginación numerada** en Jumbo AR y PriceSmart; "carga hasta 100 y se acaba" en Mercadona; no se confirmó scroll infinito en ninguno (Jumbo CL **[P]**). La paginación numerada cuesta menos datos por vista y evita perder la posición.

### 4.4 PDP (ficha)
- Mercadona: **modal** con migas, compartir, galería (la etiqueta nutricional como foto), **€/L**, relacionados. No se vio sección de sustitutos explícita, sino "relacionados" que cumplen ese papel (misma familia: otro formato, sin lactosa, otras marcas).
- Ocado: tarjeta con vida útil y etiquetas dietéticas; ficha completa **[NV]**.
- Jumbo AR: "Ver Producto" en cada tarjeta **[P]**.

### 4.5 Carrito
- **Carrito en cabecera con total visible** (píldora de Mercadona con N° y total; Ocado con total + umbral; AH con total en la cesta móvil). Mercadona aplica **invitado sin fricción** + aviso de "¿Ya tienes cuenta?" una vez.
- Umbral de mínimo visible junto al total (Ocado £40) y envío gratis desde X (Carulla $250.000; Instacart "$0 delivery fee on $10").
- Baymard (2026): mostrar en el carrito los detalles de entrega/franja, ofrecer "guardar para después" y "comprar de nuevo" accesible, y sustituciones **en el carro**, no solo en el checkout.

### 4.6 Checkout
- **No se recorrió ningún checkout** **[NV]**. Lo que se sabe por fuentes: Instacart permite configurar reemplazos por ítem desde el carro o el checkout; Mercadona de prueba: pago con tarjeta, entrega día siguiente en franjas de 1 h, mínimo €50 (Xataka, antiguo); Picnic: franja de 1 h que se estrecha a 20 min; Baymard detecta que ALDI revela "sin franjas, vuelve mañana" tarde y que CVS esconde sustituciones en el checkout.
- Propinas: Instacart las ofrece (mercado US); no verificado en Rappi Turbo ni en las demás **[NV]**.

---

## 5. Rendimiento y patrones móviles

Cota inferior de bytes de la home móvil (suma de `content-length`; ver limitaciones). Tabla de orden de magnitud, no de Core Web Vitals:

| Sitio | KB (cota inf.) | Peticiones | Observación |
|---|---:|---:|---|
| Chedraui | ~13.300 | 390 | El más pesado de la muestra |
| Picnic (web marketing) | ~15.200 | 160 | Solo marketing, tienda en app |
| Éxito | ~7.800 | 281 | |
| Carulla | ~5.300 | 275 | |
| Jumbo CL | ~3.000-3.400 | 240-260 | |
| Jumbo AR | ~1.700-3.500 | 143-296 | Varía por carga de carruseles |
| PriceSmart | ~2.400 | 187 | |
| Ocado | ~2.100-2.400 | ~108-126 | |
| AH | ~2.400-6.000 | 134-331 | |
| Mercadona (búsqueda, 100 productos con foto) | ~8.100 | — | Rejilla simple, sin carruseles de marketing |

Patrones móviles:
- **Mercadona y Picnic derivan lo móvil a la app**; Instacart la empuja pero deja "Continue in browser"; Jumbo AR muestra modal de app. Para SIGO (conexión lenta, usuarios que raramente instalan apps pesadas) es preferible una **PWA** ligera.
- **Barra inferior fija**: solo PriceSmart (4 iconos). El carrito flotante o píldora de total aparece en cabecera en todos los demás.
- **Rejilla de 2 columnas** con botón ancho de "Agregar" (Jumbo AR/CL) es el patrón móvil dominante.
- **Interferencias**: banners de cookies de media pantalla y modales promocionales cuestan 1-2 toques antes de poder buscar.

---

## 6. Funciones de IA y conversacionales relevantes

Las fuentes son secundarias (búsqueda 9-oct-2026) y deben contrastarse antes de citarse. **[NV]** salvo indicación.

| Función | Qué hace | Relevancia para SIGO |
|---|---|---|
| **Walmart Sparky** (jun-2025, app, botón "Ask Sparky") | Asistente generativo: listas personalizadas, comparar productos, "What's for dinner?" → plan semanal con ingredientes al carro; planificado: reordenar básicos, recetas desde foto del refri | Alta: patrón "pregunta → ingredientes al carro" |
| **Ask Instacart** (31-may-2023, ChatGPT + modelos propios) | Búsqueda conversacional: "¿qué puedo usar en un salteado?" → lista de ingredientes y entrega | Media: la idea de buscar por intención |
| **Amazon Rufus → "Alexa for Shopping"** (renombrado 13-may-2026) y **Alexa+** | Reordenar compras pasadas, sugerir alternativas si falta stock, agregar al carro; Alexa+ arma listas ("todo para banana bread, menos X"), ordena en Amazon Fresh/Whole Foods; **"Scan"**: foto de lista manuscrita → lista | Alta: "foto de lista" y excluir ítems por texto |
| **Woolworths Olive con Gemini** (jun-2026) | Planes semanales de comidas, **foto de receta manuscrita → ingredientes**, ítems al carro con consentimiento (no completa la compra), "smart swaps"; en la app: **Snap & Shop** (foto de lista/receta → lista) y **Smart Baskets** (predice ítems recurrentes) | Muy alta: confirma el modelo de SIGO (lista → carrito editable) y el límite de que la IA **no paga sola** |
| **Listas escritas sin IA** (Jumbo AR "Buscar por Lista"; Éxito/Carulla "separado por comas"; Mercadona "Listas") **[V UI]** | Búsqueda múltiple por texto | Competencia directa de la mecánica de la landing: sin IA ni cantidades |

Conclusión: **ningún supermercado de la región combina lista escrita + interpretación (cantidades, marcas, sinónimos) + carrito editable**. Los gigantes lo hacen con foto o conversación en app y con cuentas obligatorias. El asistente de SIGO es defendible si funciona sin login, en texto, y con ítems editables antes de pagar.

---

## 7. Evidencia de estudios (Baymard, 2026)

Fuente: Baymard, "Online Grocery UX" 2026 (https://baymard.com/research-articles/online-grocery-ecommerce-ux-2026): 70 sesiones moderadas en 8 sitios (Safeway, ALDI, Kroger, Stop & Shop, Target, Dollar Tree, Walgreens, CVS); 670+ nuevos problemas de usabilidad medios/graves (más de 1.200 acumulados); 400+ guías. El artículo público solo detalla carrito, sustituciones, compras pasadas, franjas y checkout (no búsqueda, PLP ni PDP, que están tras paywall).

- **Guardar para después** no existe en el carro de Stop & Shop móvil (guía #622).
- **"Cambiar" en un pedido de recogida** solo cambia hora/tienda, no el método (guía #3300).
- **Detalles de entrega no visibles en el carro móvil** de ALDI: el usuario se entera de problemas de franja ya en el checkout.
- **"Comprar de nuevo"** debe estar donde el usuario lo busca; en Target los usuarios lo buscan en el carro (guía #3285). El historial de pedidos de Kroger resultó abrumador ("entirely too many clicks").
- **Sustituciones solo en el checkout** (CVS) no se encuentran en el carro; con solo 2 opciones fijas el usuario se desanima. Flujo preferido: sustitución en el carro, sugerencias, y poder elegir otro producto (guía #3303).
- **Franjas agotadas** con mensaje "Please try again tomorrow" y sin poder escoger un día futuro (guía #1955).
- Los hallazgos de 2022 siguen vigentes pese a rediseños.

---

## 8. Recomendaciones priorizadas para SIGO

Contexto: nopCommerce, 139 categorías, USD, entrega por municipio, retiro en tienda, conexión lenta, mayoría móvil, asistente de lista → carrito en la landing.

### Prioridad 1 (alto impacto, bajo/medio esfuerzo)

1. **Llevar el asistente de lista a la tienda como "Buscar por lista" (patrón Jumbo AR + Woolworths).** Icono de lista junto a la lupa en todas las páginas; modal con el copy "Escribe tu lista, un producto por línea o separados por comas"; resultado = **carrito editable** con el mejor match por ítem, cantidades interpretadas ("2 harina pan"), alternativas por ítem y marca de "no encontrado". La IA no paga por el usuario; solo llena el carro (patrón Olive). Hacerlo **sin login**.
2. **Agregar con stepper en la grilla** (Mercadona/Jumbo CL): botón "Agregar" → control −/cantidad/+ in situ, con control de peso para productos por kg (Jumbo muestra "x kg" y "(1 a 2 un. Aprox)"). El carro como **píldora en cabecera con N° y total en USD** (Mercadona). En móvil, considerar además una **barra inferior de 4 iconos** (Inicio, Categorías, Lista, Carrito) como PriceSmart, con el total en el icono de carrito.
3. **Carrito de invitado y zona diferida**: permitir agregar sin cuenta ni municipio (Mercadona/Jumbo CL). Pedir el **municipio** en una barra no bloqueante ("¿A qué municipio entregamos?" / "Retiro en tienda") y exigirlo solo al cerrar, mostrando disponibilidad/costo de delivery por municipio antes del pago. Evitar el modal obligatorio de código postal de Mercadona salvo que el catálogo cambie por tienda.
4. **Autocompletado de 3 bloques** (Jumbo AR/Éxito): términos, marcas y categorías + 2-3 productos con precio y foto + "Ver todos los N". Tolerar errores (Mercadona: "lece" → leches) y sinónimos venezolanos ("harina pan", "caraotas/frijoles", "cambur/banana", "queso blanco"). Si nopCommerce no lo da, resolver con un índice ligero (JSON de nombres+categorías, pocos KB) en el cliente.
5. **Precio por unidad de medida en cada tarjeta** ("$2,10 x kg", "$1,20 x lt"), como Jumbo CL. En Venezuela, donde se compara por presentación, es la mayor ayuda de decisión. Mostrar siempre el precio en USD y, si el negocio lo exige, la referencia en bolívares en la ficha y en el carro (no en cada tarjeta, para no recargar).
6. **Presupuesto de peso para conexión lenta**: objetivo orientativo ≤ 1 MB en la home móvil y ≤ 150 KB por listado inicial (imágenes WebP/AVIF de ≤ 12 KB, `loading=lazy`, `srcset` para 2 columnas). Hoy ningún referente cumple (Éxito ≥ 7.8 MB, Chedraui ≥ 13 MB). **Paginación numerada o "Ver más" explícito** en vez de scroll infinito (Jumbo AR, PriceSmart): menos datos y no se pierde la posición. Evitar carruseles automáticos, modales de promo al cargar y widgets de encuesta (anti-patrones vistos en Éxito y Jumbo).

### Prioridad 2 (alto impacto, esfuerzo medio)

7. **"Comprar de nuevo / Mis habituales" como primer estante** y como atajo de categoría (AH "Eerder gekocht"; Ocado "Favourites first"). Para usuarios sin cuenta, guardar en `localStorage` las últimas compras y listas; con cuenta, ordenar por frecuencia. En el carro, un carrusel "Comprar de nuevo" y **"Guardar para después"** (Baymard #622/#3285).
8. **Sustituciones en el carro, no en el checkout** (Baymard #3303; Instacart "Best match / Specific / Don't replace"). Por ítem: "Si no hay: [sustituto sugerido ▾ | elegir otro | no sustituir]", por defecto "sustituto sugerido". Importante en SIGO por el stock variable y el riesgo de rotura en productos de alta rotación. Para la lista de la landing: marcar la alternativa preseleccionada en el carro construido por el asistente.
9. **Fecha/franja de entrega visible desde el carro** (Baymard: ALDI) con mínimo y costo por municipio, y un indicador de **cuánto falta para el mínimo o el delivery gratis** (Ocado chip de £40; Carulla "$250.000"; Instacart "$0 delivery fee on $10"). Si no hay franja disponible, **ofrecer el siguiente día** en lugar de "vuelve mañana" (Baymard #1955). Permitir "cambiar método" (delivery ↔ retiro) sin rehacer el pedido (Baymard #3300).
10. **Ficha como modal/hoja sobre el listado** (Mercadona): no se pierde posición ni se recarga la página; incluye €/unidad, **etiqueta nutricional como imagen** (barata de producir con una foto del reverso), "Productos relacionados" = mismas variantes (sin azúcar, otro tamaño, otra marca) como **sustitutos**, y aviso "la imagen puede no estar actualizada".
11. **Badges útiles y honestos** (Ocado/Jumbo/Instacart): "Fresco: llega hoy" o vida útil en perecederos; "Pocas unidades"/"Agotado" con sustituto (PriceSmart "Disponible"; Instacart "Many in stock"); "Lleva 2 por $X". Evitar productos "Patrocinado" en la primera pantalla.
12. **Atajos de recompra y lista por WhatsApp**: Carulla publica WhatsApp de ventas y servicio; en Venezuela es el canal dominante. Ofrecer "Enviar mi carrito/lista por WhatsApp" como alternativa al checkout (y recibir listas por WhatsApp, que el asistente interpreta). **[Decisión de negocio, sin evidencia de referente que lo haga en el carro.]**

### Prioridad 3 (explorar)

13. **Foto de lista manuscrita → lista** (Amazon "Scan"; Woolworths "Snap & Shop"). Muy relevante: muchas compras en Venezuela parten de la lista escrita en papel. Costo de IA y peso de subida de fotos: comprimir en cliente (≤ 300 KB) antes de enviar.
14. **Recetas → carrito** (Jumbo CL "Recetas", AH "Wat eten we vandaag?" con tiempo de preparación; Sparky/Olive). Pocas recetas locales ("pabellón", "arepas", "hallacas" en temporada) con "Agregar ingredientes al carro" (editable). Menor prioridad que la lista.
15. **Puntos/cashback**: Puntos Cencosud, Puntos Colombia, Smart Pass. Para SIGO, empezar por "comprar de nuevo" y precios claros antes que un programa de puntos.
16. **PWA instalable** (en lugar de app nativa): Mercadona y Picnic han llegado a obligar a la app; con conexión lenta una PWA con catálogo cacheado (últimas categorías vistas) y carrito persistente local (service worker) es la alternativa de menor fricción. Permitir **cola de pedido sin conexión** (el carrito se sincroniza al volver).
17. **Medir antes de copiar**: A/B del stepper vs botón simple; tasa de uso de "Buscar por lista"; ítems sustituidos; abandono por falta de franja. Usar el catálogo de 139 categorías: agrupar a ~12-15 departamentos en móvil y mostrar el resto como subcategorías (Mercadona: árbol de 3 niveles con iconos).

### Qué NO copiar
- Modal obligatorio de código postal antes de ver el catálogo (si el catálogo es único para la isla).
- Pestañas tipo marketplace (Éxito: Mercado/Tecnología/Moda) mezcladas con grocery.
- Carruseles pesados y vídeos en la home (Picnic ≥ 15 MB; Chedraui ≥ 13 MB).
- Esconder sustituciones y detalles de entrega hasta el checkout (Baymard).

---

## 9. Capturas guardadas (`capturas-ecommerce/`)

`int-mercadona-plp-busqueda-1366px.jpg`, `int-mercadona-pdp-modal-1366px.jpg`, `int-mercadona-arbol-categorias-1366px.jpg`, `int-mercadona-carrito-invitado-1366px.jpg`, `int-mercadona-movil-web-solo-app-390px.jpg`, `int-jumbo-cl-home-390px.jpg`, `int-jumbo-cl-autocompletado-390px.jpg`, `int-jumbo-cl-plp-stepper-390px.jpg`, `int-jumbo-ar-buscar-por-lista-1366px.jpg`, `int-jumbo-ar-autocompletado-390px.jpg`, `int-jumbo-ar-plp-390px.jpg`, `int-exito-plp-390px.jpg`, `int-carulla-autocompletado-390px.jpg`, `int-pricesmart-barra-inferior-390px.jpg`, `int-ocado-plp-390px.jpg`, `int-ah-home-390px.jpg`, `int-instacart-home-movil-390px.jpg`, `int-instacart-tienda-1366px.jpg`, `int-amazonfresh-home-390px.jpg`, `int-rappi-direccion-primero-390px.jpg`, `int-picnic-web-solo-app-390px.jpg`.

Nota: `int-mercadona-carrito-invitado-1366px.jpg` muestra el modal "¿Ya tienes cuenta?" tras agregar el primer producto, con la píldora de cabecera "1 · 4,98 €". Algunas capturas de móvil (Ocado, AH) conservan el aviso de cookies porque el consentimiento no se pudo cerrar automáticamente.

## 10. Fuentes externas

- Baymard, Online Grocery UX 2026: https://baymard.com/research-articles/online-grocery-ecommerce-ux-2026
- Walmart Sparky: https://retailwire.com/walmart-ai-assistant-sparky/ , https://fruittoday.com/en/walmart-introduces-sparky-a-generative-ai-assistant-to-plan-compare-and-shop-smarter/
- Ask Instacart: https://www.supermarketnews.com/grocery-technology/instacart-rolls-out-ask-instacart-chatgpt-feature
- Amazon Rufus / Alexa+: https://www.aboutamazon.com/news/devices/new-alexa-features-for-grocery-shopping , https://techcrunch.com/2025/02/26/amazon-alexa-can-do-your-grocery-shopping-too/
- Woolworths Olive: https://www.channelnews.com.au/woolworths-to-roll-out-ai-shopping-assistant-that-plans-meals-and-fills-carts/ , https://www.canstar.com.au/news/woolies-launches-revamped-ai-chatbot/
- Mercadona web nueva (2019/2020, Valencia): https://www.xataka.com/servicios/haciendo-la-compra-en-la-nueva-tienda-online-de-mercadona-esta-ha-sido-nuestra-experiencia/amp
- Instacart reemplazos: https://company.instacart.com/shopper-community/providing-a-more-straightforward-replacements-experience
