# Benchmark internacional de landing/home de supermercados (para SIGO, Isla de Margarita)

Fecha de captura: 8-oct-2026. Método: `curl` con User-Agent de navegador + Playwright/Chromium (`/opt/pw-browsers/chromium-1194`) sobre las home reales; extracción de encabezados, navegación, JSON-LD y señales técnicas (manifest, service worker, WhatsApp, apps). WebSearch/WebFetch no se usaron: la captura directa dio datos suficientes.

## 0. Leyenda de verificación y limitaciones

| Marca | Significado |
|---|---|
| **[V]** | Verificado directamente en el HTML/DOM renderizado de la home (8-oct-2026) |
| **[P]** | Verificación parcial (HTML servido pero la home depende de JS/SPA, o solo se vio parte) |
| **[NV]** | No verificado en esta sesión: dato de conocimiento general previo; contrastar antes de citar |

Sitios bloqueados o no legibles:
- **Carrefour ES**: HTTP 403 con curl; Chromium recibió el desafío Cloudflare ("Just a moment"). **[NV]** todo su detalle.
- **Soriana (MX)**: 403 / Cloudflare "Attention Required". **[NV]**.
- **Líder (CL)**: "Robot or human?". **[NV]**.
- **H-E-B (US)**: respuesta de 212 bytes por curl; Chromium renderizó una página vacía (anti-bot). **[NV]**.
- **Supermercados Rey (PA)**: SPA; el HTML solo expone título. Se confirmó presencia de enlaces a WhatsApp y a tiendas de apps. **[P]**.
- **Wegmans**: sin encabezados h1-h3 en el HTML inicial; se verificó navegación y títulos. **[P]**.
- No se midieron Core Web Vitals reales (sin Lighthouse). Los pesos de HTML son del documento inicial sin comprimir, medidos con curl.
- Los textos de campañas (Halloween, Diwali, etc.) son de la fecha de captura y cambiarán.

Cobertura: 18 sitios intentados; 13 con datos directos [V]/[P] (Mercadona, Lidl ES, ALDI US, ALDI UK, Tesco, Publix, Trader Joe's, Whole Foods, Wegmans, Éxito, Olímpica, Jumbo CL, Chedraui, PriceSmart, Rey, Woolworths AU); 4 bloqueados. Nota: Tesco, Trader Joe's, Woolworths y ALDI UK devolvieron 403 a curl pero se leyeron con Chromium.

---

## 1. Fichas por supermercado

### 1.1 Mercadona (ES) [V, home mínima]
- **Estructura**: home casi de un solo bloque. Hero "Empieza tu compra en Mercadona" con campo de **código postal** como único CTA, aviso "Nueva tienda online en algunas zonas", y selector de público: **Cliente / Trabajador / Proveedor / Sociedad**. Menú: Conócenos, Supermercados, Trabaja con nosotros, Atención al cliente. (Texto total de página ~1,5 k caracteres; HTML inicial 2,2 KB, es una SPA.)
- **Propuesta de valor**: ninguna retórica; entra directo a la acción (compra online por zona).
- **Folleto/ofertas, fidelización, recetas**: no en home. **[NV]** Mercadona no usa programa de puntos ni folleto promocional (política "precios bajos siempre").
- **Destacable**: el **código postal como puerta de entrada** (disponibilidad por zona) y la **segmentación de audiencias** (cliente/empleado/proveedor/sociedad) en la propia home. Extremadamente liviana.
- **Confianza**: sin sellos en home; la marca lo hace por sobriedad.

### 1.2 Lidl España [V]
- **Orden**: header con categorías (Alimentación, Bricolaje, Hogar, Moda, Bebé...) y accesos a **Descuentos, Marcas Lidl, Lidl Plus, Ideas y consejos, Trabaja en Lidl, Servicios (Recetas, Newsletter)** -> "Estas ofertas son para ti" (personalizado, CTA "Regístrate para ver tus ofertas") -> bloque tienda online "Innovador. Intuitivo. Fácil." -> "Los destacados de la semana" -> campañas estacionales (otoño) -> **Folletos** -> **Consejos y tutoriales** -> categorías populares -> "Lidl vale la pena: en tu tienda y online" -> info legal.
- **Fidelización**: **Lidl Plus** con marcado `MemberProgram`/`MemberProgramTier` (schema.org) en JSON-LD [V]; cupones personalizados.
- **Contenido**: recetas con chef famoso (Karlos Arguiñano), tutoriales.
- **Técnico**: manifest, hreflang, lazy-load, srcset, enlaces a WhatsApp/wa.me presentes. HTML inicial **~680 KB** (pesado). Mensaje de compatibilidad de navegador (Chrome/Firefox/Safari/Edge).
- **Destacable**: folletos como entidad de primer nivel; tienda online separada de la oferta semanal; datos estructurados de membresía.

### 1.3 ALDI US [V]
- **Orden**: header con Departments / Shop -> "Featured Pages" -> **Price Drops** (productos reales con precio) -> categorías -> storytelling de producto ("Tonight's dinner just went global", comidas internacionales) -> About Us / Help / **Weekly Specials**.
- **Propuesta**: "Quality Food. Everyday Low Prices." (en el título).
- **Destacable**: el precio es el héroe; "Price Drops" y "Weekly Specials" como segundas puertas. Sticky header, skip links, aria-label, hreflang. HTML ~1 MB (pesado). Sin JSON-LD en home.

### 1.4 ALDI UK [V vía Chromium]
- **Orden**: "Welcome to Aldi!" -> **PRICE DROPS** -> "Plan Your Week Right" -> **"Your Middle Aisle Exclusive"** / **SPECIALBUY TOP PICKS** (no-alimentación semanal) -> suscripción email -> pie (About, Help, Find us on the web, Download our App).
- **Patrón único**: **calendario de lanzamientos por fecha** en el menú (jue 8 oct, dom 11 oct, jue 15 oct...) con categorías que llegan cada día. Convierte las ofertas en una cita recurrente.
- **Utilidad**: "Store Locator", "Help Centre", "Sign Up To Emails", lista, skip to content. JSON-LD: `BreadcrumbList`, `Corporation`.

### 1.5 Tesco (UK) [V vía Chromium]
- **Orden**: banner de consentimiento (cookies/privacidad) -> barra superior (Tesco Insurance/Bank/Mobile, **Delivery Saver**, **Store locator**, Help, Sign in/Register) -> navegación: Groceries & Essentials, My Favourites, Special Offers, **Tesco Clubcard**, F&F Clothing, Marketplace, New & Trending, **Recipes** -> "What's new this week?" -> carruseles de campañas ("Top picks for you this week", Supersaver Event, Festive Food, Diwali, F&F sale) -> "More ways to shop and save" (Clubcard 16-17, Delivery Saver).
- **Fidelización**: Clubcard como pilar del menú y del mensaje (precios Clubcard). 
- **Destacable**: "Skip to main content" y "Skip to search" (accesibilidad); buscador omnipresente; personalización ("Top picks for you"); campañas culturales locales (Diwali). JSON-LD `Organization`. Es un e-commerce completo; para SIGO solo interesa la cabecera y los bloques de campaña.

### 1.6 Publix (US) [V]
- **Orden**: utilidades (Skip to Main Content, Catering, Gift Cards, Order Sushi/Subs, **Weekly Ad**, Pharmacy, Shopping list, Log in / Sign up) -> "Savings" (Weekly ad, BOGOs, Subs & Wraps, Halloween, Cakes, Platters & Catering) -> **"Join the Club."** -> **"Shop with us"** -> **"Work with us"** -> **"Services you'll love"** -> **"More ways to shop"** -> pie con Locations, FAQ, Recalls, Apps, Club Publix membership, tax-exempt, About, Careers, **Corporate Social Responsibility, Community, Business partners**, Recipes, Health & wellness, Birthday, Wedding, Departments (Pharmacy, Liquors, Apparel & gifts), Accessibility.
- **Propuesta**: "Where Shopping is a Pleasure" y "empleado-propietario" (employee-owned) en la meta descripción [V]. Es el mejor ejemplo de **confianza institucional** (propiedad de empleados, comunidad, RSC).
- **Destacable**: **Weekly Ad** como acceso primario; servicios (sushi, subs, catering, pastelería) que son "la razón para ir a tienda"; "Work with us" en cuerpo de home; manifest + service worker presentes [V]. HTML ~616 KB.

### 1.7 H-E-B (US) [NV: bloqueado]
Anti-bot total. Conocimiento previo (no verificado): selector de tienda sticky, "Digital Coupons", Meal Simple, marca propia Hill Country Fare/H-E-B, fuerte énfasis comunitario/emergencias (Texas), app muy usada. **No citar sin contrastar.**

### 1.8 Trader Joe's (US) [V vía Chromium]
- **Orden**: "My Store: Wichita" (selector de tienda en header) -> Stores, About Us, Careers, Announcements, Shopping List -> mega-menú **Products** (What's New, Food > Bakery, Cheese, Dairy..., Fresh Prepared, Flowers & Plants), **Discover** (Entertaining, Guides, Stories), **Recipes** (por comida), **Listen** (podcast) -> "Welcome to Trader Joe's!" -> What's New (productos) -> Podcast -> recetas -> "And There's More" -> **recalls / avisos** ("RECALL: ..." en home) y "Opens Friday" (nuevas tiendas).
- **Rasgo**: no hay e-commerce ni puntos ni cupones; el sitio es **editorial y de marca** (tono lúdico, "Fearless Flyer", podcast, historias). Hero muy simple. Es el modelo más cercano a una **landing institucional sin e-commerce**.
- **Confianza**: transparencia (retiros de producto visibles en home), nuevas aperturas anunciadas.

### 1.9 Whole Foods Market (US) [V]
- **Orden**: "Skip main navigation" -> utilidades (Sign in, Cart, Grocery Pickup & Delivery, Weekly Sales, Catering, Recipes) -> hero rotativo de ofertas (con Prime) -> "Save big every Tuesday and Friday." -> **"We believe real food just tastes better."** -> "Discover our latest and greatest." -> **"Our purpose is to nourish people and the planet."** -> bloque Shopping / Mission in Action / About / Need Help / Connect With Us.
- **Confianza**: Responsible Sourcing, Quality Standards, Community Giving, Environmental Stewardship, Our Values como enlaces de primer nivel; meta: "local, organic, plant-based... special diet".
- **Destacable**: dietas especiales como navegación (Special Diets), "Browse In-Store" (lo que hay en tienda), días fijos de oferta (martes y viernes). Dependencia de Amazon Prime. HTML ~163 KB.

### 1.10 Wegmans (US) [P]
- Navegación: Stores, Pharmacy, **Meals 2GO & Catering**, **Meals & Recipes**, **Digital Coupons**, Health & Nutrition, Careers, My Items; temas (Seasonal Entertaining, Gold Pan Entrees, Bakery Desserts, Artisan Breads, Living Gluten Free). Pie: Our Values in Action, Newsroom, Suppliers, Business Customers, Accessibility, Chat With Us, Events.
- Meta: "meal help, consistent low prices, and an excellent grocery store experience". Destaca **ayuda para decidir qué cocinar** (comidas y recetas) como diferencial frente al precio. No se vio la jerarquía de secciones del cuerpo.

### 1.11 Éxito (CO) [V]
- **Orden**: header con "Mi cuenta", categorías (Mercado, Tecnología, Hogar, Moda), "Ofertas y promociones", **Gana Cashback**, "Ahorra todos los días", "Días de promos", "Súper combos", "Tienda destacada"; pie con **Ventas por WhatsApp (+57 ...)**, línea de atención con horarios, PQRS, Habeas Data, Almacenes (locator), Compra y recoge, Referidos, Vende en exito.com, **Fundación Éxito**, **Donar "goticas"** (donación en caja/online), Grupo Éxito, Canal de denuncias.
- **Técnico**: JSON-LD `WebSite` + `SearchAction`; manifest; WhatsApp. HTML ~240 KB.
- **Destacable**: **WhatsApp como canal de ventas con número en pie**; cashback; responsabilidad social visible; "Compra y recoge". Es un híbrido marketplace/retail: mucho ruido de no-alimentos.

### 1.12 Olímpica (CO, Caribe) [V]
- **Orden**: "Tus ofertas favoritas están aquí" -> "Encuentra todo fácilmente" -> "¡Ofertas por tiempo limitado!" con **temporizador de cuenta regresiva** ("Las ofertas expiran en") -> "No esperes más y ahorra hoy mismo" -> "¡Precios que te van a encantar!" con tarjetas de producto (neveras, aires acondicionados, consolas).
- **Técnico**: la más completa en datos estructurados: `Product`, `Offer`, `AggregateOffer`, `ItemList`, `Organization`, `WebSite`, `SearchAction`; service worker; WhatsApp. **HTML 3 MB** (muy pesado).
- **Relevancia**: costa Caribe colombiana, clima y cultura de consumo cercanos al oriente venezolano. Tono promocional agresivo y orientado a electro.

### 1.13 Jumbo (CL, Cencosud) [V]
- **Orden**: utilidades (Centro de ayuda, Estado del pedido, **Inscribe/Paga/Solicita tu tarjeta**, Catálogo de canjes, Seguros Cencosud) -> **"Lo más vendidos"** (carrusel con precios) -> "Oferta" / "Exclusivo online" -> **"¡Sólo por hoy!"** con cuenta regresiva (hh:mm:ss) -> "Categorías destacadas" (Pastelería, Importados, Vacuno, Frutas y verduras) -> carruseles de marcas -> "Centro de ayuda: Resuelve tus dudas".
- **Marca propia**: etiquetas "Frutas y Verduras Propias", "Panadería Propia", "Jumbo Artesanal" sobre el producto.
- **Destacable**: tarjeta financiera de la cadena (Cencosud) integrada a la home; urgencia diaria; WhatsApp (wa.me) y manifest. HTML ~2,2 MB.

### 1.14 Líder (CL, Walmart) [NV: bloqueado]
"Robot or human?". Sin datos. Conocimiento previo (no verificado): Lider.cl es e-commerce puro con buscador central y categorías; marca propia Great Value.

### 1.15 Soriana (MX) [NV: bloqueado] y Chedraui (MX) [V]
- **Soriana**: Cloudflare. Sin datos.
- **Chedraui** [V]: "Obtén tu envío gratis con:" -> "Departamentos principales" -> **"Promociones bancarias"** (descuentos por banco/tarjeta) -> "Promociones del día" -> **"Nuestras marcas"**. Enlaces a App Store, Google Play y wa.me; manifest + service worker; `WebSite`/`SearchAction`. HTML ~3 MB.
- **Destacable**: **promociones por medio de pago** (muy relevante en economías con múltiples métodos de pago); envío gratis como gancho.

### 1.16 PriceSmart (Centroamérica/Caribe) [V]
- Página de Costa Rica: título "Un Club Lleno de Beneficios". Bloques: **Member's Selection** (marca propia), Ahorros del Fabricante, Servicio a Negocios, Lo Nuevo, Farmacia, **La Cocina de PriceSmart**, Tienda de Panadería, Mixología, Charcutería, Orgánico, Libre de gluten; app iOS/Android; **PriceCash** (monedero de recompensas). Selector de país (hreflang). Modelo de **membresía** como propuesta central.

### 1.17 Supermercados Rey (PA) [P]
SPA con título "Supermercados Rey - Siempre Fresco". Confirmado: enlaces a WhatsApp, apps iOS, skip link y aria-label. Estructura interna **[NV]**. Relevante por mercado hispano-caribeño similar al de SIGO.

### 1.18 Woolworths AU [V vía Chromium]
- "Woolworths Homepage" -> "$10 off back to school..." -> "Welcome to Woolworths" -> "Helping you find great value" -> Fruit & Veg -> Selected Snacks. Menú: Lists & Buy again, **New Catalogue**, All Specials & Offers, Ways to Shop, **Plan with Lists**, **Everyday Extra** (fidelidad). JSON-LD presente. Skip to main content. Patrón: **catálogo semanal + listas de compra**.

### 1.19 Carrefour ES/FR [NV: bloqueado]
Solo constatamos Cloudflare. Ficha omitida para no inventar.

---

## 2. Matriz comparativa

Leyenda: Sí = verificado; (P) = parcial; No = no se vio en la home; ? = no verificado (sitio bloqueado/SPA).

| Supermercado | Hero/propuesta | Buscador | Selector tienda/zona | Locator | Folleto/ofertas semanales | Fidelización | App | Recetas/contenido | Marca propia | Sostenib./comunidad | Empleo | Proveedores | Personalización | WhatsApp | Schema JSON-LD |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mercadona | CP -> compra | No | **CP** | Menú "Supermercados" | No | No | ? | No | ? | "Sociedad" | Sí | Sí (público) | Por audiencia | No | No |
| Lidl ES | Ofertas + Lidl Plus | Sí | ? | ? | **Folletos** | **Lidl Plus** | ? | **Sí (chef)** | **Marcas Lidl** | ? | Sí | ? | **Sí (ofertas para ti)** | Sí (presencia) | MemberProgram |
| ALDI US | Precios bajos | Sí | Sí (tienda) | Sí | **Weekly Specials/Price Drops** | No | ? | Sí (storytelling) | Sí (Simply Nature...) | ? | Sí | ? | No | No | No |
| ALDI UK | Bienvenida + Price Drops | Sí | Sí | **Store Locator** | **Calendario por fecha** | Email | Sí (pie) | Plan your week | Sí | ? | ? | ? | No | No | Corporation |
| Tesco | Campañas | **Sí (skip to search)** | Sí | **Store locator** | Special Offers | **Clubcard** | Sí | Recipes | Sí | ? | ? | ? | **Sí** | No | Organization |
| Publix | "Join the Club" | Sí | Sí | **Locations** | **Weekly Ad** | **Club Publix** | Sí | Recipes | Sí | **CSR, Community** | **Work with us** | **Business partners** | Parcial | No | No |
| H-E-B | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| Trader Joe's | Editorial | No (home) | **My Store** | Stores | No (What's New) | No | No | **Recetas, podcast** | **Sí (todo)** | Anuncios | Careers | No | No | No | No |
| Whole Foods | Valores + ofertas | Sí | Sí | Sí | **Weekly Sales (mar/vie)** | Prime | Sí | Recipes | 365 | **Fuerte** | Sí | Sí | Special diets | No | No |
| Wegmans | Comidas + precio | Sí | Sí | **Stores** | Cupones digitales | Shoppers Club (?) | Sí | **Meals & Recipes** | Sí | Valores | Careers | **Suppliers** | My Items | No | No |
| Éxito | Ofertas | Sí | Sí | Almacenes | Días de promos | **Cashback** | Sí | No | Sí | **Fundación, donar** | ? | Sí (vende) | No | **Sí (número en pie)** | WebSite/Search |
| Olímpica | Ofertas c/ cuenta regresiva | Sí | ? | ? | Ofertas tiempo limitado | ? | ? | No | Sí (Olimpo) | ? | ? | ? | No | Sí | **Amplio** |
| Jumbo CL | Más vendidos | Sí | ? | ? | "Sólo por hoy" | Tarjeta Cencosud | ? | No | **Propias** | ? | ? | ? | No | Sí | No |
| Chedraui | Envío gratis | Sí | Sí | ? | Promos del día | ? | **Sí** | No | **Nuestras marcas** | ? | ? | ? | No | Sí | WebSite/Search |
| PriceSmart | Membresía | Sí | **País** | ? | Ahorros | **PriceCash** | **Sí** | **La Cocina** | **Member's Selection** | ? | ? | Servicio a negocios | No | ? | No |
| Rey (PA) | ? | ? | ? | ? | ? | ? | Sí | ? | ? | ? | ? | ? | ? | Sí | ? |
| Woolworths AU | Valor | Sí | Sí | Sí | **Catálogo** | **Everyday Extra** | Sí | Listas | Sí | ? | ? | ? | **Sí (buy again)** | No | Sí |
| Carrefour / Soriana / Líder | **No verificado (bloqueados)** | | | | | | | | | | | | | | |

(Las celdas con "Sí" sin marca especial fueron deducidas de menús/pies vistos; cuando se trate de datos sensibles para decisión, validar con captura manual.)

---

## 3. Patrones recurrentes ("table stakes")

Presentes en la gran mayoría de los sitios verificados:
1. **Cabecera sticky con buscador** y acceso a cuenta/lista. Skip links ("Skip to main content") en Tesco, Publix, Whole Foods, Woolworths, ALDI UK.
2. **Localizador de tienda / selector de tienda o zona** en el header o primer pliegue (Mercadona CP, Trader Joe's "My Store", Tesco, ALDI).
3. **Ofertas de la semana / folleto** como bloque o enlace primario (Lidl "Folletos", Publix "Weekly Ad", Woolworths "New Catalogue", ALDI "Price Drops/Weekly Specials").
4. **Programa de fidelización con CTA claro** (Lidl Plus, Clubcard, Club Publix, PriceCash, Everyday Extra, Cashback).
5. **Enlaces a descarga de app** (App Store/Google Play), sobre todo en pie.
6. **Recetas/ideas** como contenido de apoyo (Tesco, Lidl, Trader Joe's, Wegmans, Whole Foods, PriceSmart).
7. **Marca propia** destacada (Member's Selection, Marcas Lidl, "Propias" de Jumbo, 365).
8. **Pie extenso** con: Contacto/Atención al cliente, Careers, Proveedores, Sostenibilidad/Comunidad, Accesibilidad, Privacidad/Términos, Retiros de producto (Publix "Recalls").
9. **Segmentación por audiencia** en el pie o en el hero (Mercadona: cliente/trabajador/proveedor/sociedad; Publix: Shop/Work with us/Business partners).
10. **Banner de consentimiento de cookies** y política de privacidad visibles.
11. **Elementos de confianza**: propiedad/trayectoria (Publix), valores y sourcing (Whole Foods), transparencia de retiros (Trader Joe's, Publix), medios de contacto con horarios (Éxito).
12. **Campaña estacional** en hero/carrusel (Halloween, Diwali, Navidad, regreso a clases).

Para SIGO (landing sin e-commerce) se recomienda, como mínimo: hero con propuesta + CTA a tiendas, locator con horarios, ofertas/folleto semanal, fidelización (si existe), recetas, marca propia, "Nuestra gente/comunidad", empleo, proveedores, contacto, app (si existe), y un punto de enlace futuro a e-commerce.

---

## 4. Ideas diferenciales adaptables a un contexto venezolano/insular con conectividad limitada

Basadas en patrones observados + necesidades locales; son **propuestas**, no hechos del mercado.

1. **Home ligera "estilo Mercadona"**: hero único + 1 acción (por ejemplo "¿Cuál es tu tienda más cercana?"). Referencia de rendimiento: Mercadona 2 KB iniciales frente a 0,6-3 MB de Lidl/Olímpica/Chedraui.
2. **Folleto en formato "ligero primero"**: carrusel de imágenes WebP/AVIF comprimidas + versión **PDF/imagen descargable** y **"Enviar folleto por WhatsApp"** (botón `wa.me` con texto prellenado). Éxito, Jumbo, Chedraui, Lidl y Rey muestran WhatsApp en su ecosistema.
3. **PWA offline-first** (manifest + service worker, presentes en Publix, Chedraui, Olímpica): cachear tiendas, horarios, folleto vigente y la última lista de ofertas para consultar sin datos. Botón "Instalar".
4. **Modo ahorro de datos** (toggle y detección de `Save-Data`/`navigator.connection`): sin vídeo, imágenes de baja resolución, sin carruseles autoplay.
5. **Locator de tienda sin mapa pesado**: lista con horario, teléfono, botón "Cómo llegar" (enlace a Google Maps / Waze), "Llamar" y "WhatsApp de la tienda"; mapa solo bajo demanda (carga diferida o imagen estática). Estado "Abierto ahora" calculado localmente.
6. **Calendario de días de oferta** (patrón ALDI UK + Whole Foods "martes y viernes"): "Martes de frescos", "Fin de semana de carnes". Crea hábito semanal y se adapta a un presupuesto semanal.
7. **Precios en USD y Bs con tasa visible y fecha** en ofertas (contexto bimonetario): mostrar "Actualizado: hoy HH:MM" para confianza. Requiere decisión de negocio; tratar con cuidado (sin precios obligatorios en la landing si no hay fuente de datos fiable).
8. **Medios de pago aceptados** como bloque visual (patrón Chedraui "promociones bancarias"): Pago Móvil, Zelle, punto de venta, efectivo USD, bancos aliados.
9. **Isla de Margarita como identidad**: producto local (pescado, pan, quesos, productores margariteños), "orgullo insular", mapa de la isla con tiendas por municipio; recetas locales (pastel de chucho, arepas). Referencias: Publix/Whole Foods usan lo local como confianza.
10. **Seguimiento de continuidad de servicio**: aviso discreto de "tienda abierta/cerrada hoy", horario especial en feriados y apagones; cintillo de avisos operativos (equivalente a los avisos/recalls de Trader Joe's y Publix).
11. **Hub de WhatsApp Business**: pedido asistido por catálogo de WhatsApp como puente hacia el e-commerce futuro; enlaces `wa.me` por tienda.
12. **"Arma tu lista" sin cuenta**: lista de compras local (localStorage) imprimible o compartible por WhatsApp (patrón Tesco/Woolworths "Lists"), sin login.
13. **Preparación para e-commerce**: slot reservado en header ("Compra online - Próximamente" con registro de interés por WhatsApp/email) y arquitectura de URLs (`/tiendas`, `/ofertas`, `/tienda-online`) que no cambie después. Selector de zona tipo Mercadona (por municipio/sector) listo para cuando exista cobertura.
14. **Segmentación por audiencia en la home** (Mercadona): Cliente / Empleo / Proveedores / Comunidad.
15. **Transparencia y confianza**: años de trayectoria, nº de tiendas, empleados margariteños, y canal de reclamos visible (equivalente a PQRS de Éxito).

---

## 5. Buenas prácticas de rendimiento, SEO local y accesibilidad

### 5.1 Rendimiento (presupuesto sugerido)
- Observación: HTML inicial de la competencia: 2 KB (Mercadona), 163 KB (Whole Foods), 245 KB (Wegmans, Éxito), 616-682 KB (Publix, Lidl), 1,0-1,7 MB (ALDI US, Rey), 2,2-3 MB (Jumbo, Olímpica, Chedraui). Para un entorno de conectividad limitada, apuntar muy por debajo.
- Presupuesto objetivo propuesto: HTML < 50 KB, CSS crítico inline < 15 KB, JS < 100 KB total, página inicial < 500 KB (sin imágenes diferidas), LCP < 2,5 s en 3G/4G lento, CLS < 0,1, INP < 200 ms.
- Imágenes: AVIF/WebP con `srcset`/`sizes`, `width`/`height` explícitos, `loading="lazy"` salvo el hero (`fetchpriority="high"`), hero < 80 KB; placeholders de color (LQIP).
- Tipografías: sistema o 1-2 variables con `font-display: swap`, subset latino; evitar frameworks pesados (sitio estático o islas).
- Sin carruseles autoplay; sin vídeo de fondo; vídeo bajo demanda con `preload="none"`.
- Hosting con CDN y caché larga con hash; compresión Brotli; `Cache-Control` para folletos.
- Service worker: cache-first de assets, stale-while-revalidate para ofertas y tiendas, página offline.
- Terceros (analítica, chat, píxeles) diferidos y mínimos.

### 5.2 SEO local y datos estructurados
Observado: solo Olímpica, Lidl, Éxito, Chedraui, Woolworths y Tesco/ALDI UK usan JSON-LD en home; ninguno de los verificados expone `GroceryStore` en la home (podría estar en páginas de tienda; **[NV]**). Esto es una oportunidad.
- `Organization` (con `logo`, `sameAs`, `contactPoint`) en la home.
- `WebSite` + `SearchAction` solo si hay buscador real.
- **Una página por tienda** (`/tiendas/<slug>`) con `GroceryStore` (subtipo de `LocalBusiness`): `name`, `address` (`PostalAddress`, `addressLocality`, `addressRegion` Nueva Esparta), `geo`, `telephone`, `openingHoursSpecification` (incluye feriados con `validFrom/validThrough`), `image`, `url`, `parentOrganization`, `sameAs`, `hasMap`, `paymentAccepted`, `currenciesAccepted`.
- `BreadcrumbList` en páginas internas; `Offer`/`OfferCatalog` solo si se publican precios reales.
- Ficha de Google Business Profile coherente (NAP: nombre, dirección, teléfono idénticos), con horarios y fotos; enlazar la ficha a la página de la tienda.
- Metadatos: `<title>` con ciudad ("Supermercados SIGO en Margarita"), meta description única, `lang="es-VE"`, canonical, Open Graph/Twitter, `sitemap.xml`, `robots.txt`.
- Contenido local indexable (municipios: Porlamar, Pampatar, La Asunción, Juan Griego, etc.), sin esconder tiendas tras JS.
- Validar con Rich Results Test / Schema Markup Validator.

Ejemplo mínimo:
```json
{
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  "name": "SIGO - Tienda <Nombre>",
  "url": "https://<dominio>/tiendas/<slug>",
  "telephone": "+58-...",
  "address": {"@type":"PostalAddress","streetAddress":"...","addressLocality":"Porlamar","addressRegion":"Nueva Esparta","addressCountry":"VE"},
  "geo": {"@type":"GeoCoordinates","latitude":0,"longitude":0},
  "openingHoursSpecification": [{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"opens":"08:00","closes":"20:00"}],
  "paymentAccepted": "Efectivo, Pago Móvil, Tarjeta de débito, Zelle",
  "parentOrganization": {"@type":"Organization","name":"SIGO"}
}
```

### 5.3 Accesibilidad (WCAG 2.2 AA)
- Observado en la competencia: skip links (Tesco, Publix, Whole Foods, Woolworths, ALDI UK), `aria-label` generalizado, sticky headers. Replicar y mejorar.
- HTML semántico (`header`, `nav`, `main`, `section`, `footer`), un solo `h1`, jerarquía de encabezados correcta (Wegmans y PriceSmart no exponen h1-h3 en el HTML inicial: evitarlo).
- Contraste mínimo 4,5:1 (3:1 para texto grande y componentes); no transmitir información solo por color (precios, ofertas).
- Foco visible, navegación completa por teclado, objetivos táctiles >= 44x44 px (clave en móvil).
- `alt` descriptivo en folletos; si el folleto es solo imagen, ofrecer texto/lista alternativa; `prefers-reduced-motion` para cuentas regresivas y animaciones.
- Formularios con `label`, errores claros; el locator accesible como lista antes que como mapa.
- Cuentas regresivas (Jumbo, Olímpica): evitar `aria-live` ruidoso; no generar urgencia falsa.
- Declaración de accesibilidad en el pie (Publix, Wegmans la incluyen).
- Consentimiento de cookies mínimo y no bloqueante.

---

## 6. Conclusiones rápidas
- Los referentes más útiles para una **landing institucional sin e-commerce**: Trader Joe's (editorial), Publix (confianza, Weekly Ad, empleo/proveedores), Mercadona (simplicidad y segmentación), Whole Foods (propósito), ALDI UK (ritmo semanal), Olímpica/Éxito/Chedraui (Caribe/LatAm: WhatsApp, promociones, datos estructurados).
- La mayoría pesa demasiado para la conectividad insular: la ventaja competitiva de SIGO puede ser **velocidad, offline y WhatsApp**.
- Ningún referente verificado expone `GroceryStore` en la home: oportunidad SEO local clara.
- Pendiente de validar manualmente (bloqueados): Carrefour, Soriana, Líder, H-E-B.
