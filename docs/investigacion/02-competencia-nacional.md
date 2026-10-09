# Benchmark de competencia nacional — Supermercados Venezuela (insumo para landing institucional SIGO)

Fecha de análisis: 8-oct-2026. Método: WebFetch/WebSearch y Chromium headless (Playwright) con render real, viewport escritorio 1280 y móvil 390 px. Donde un dato no pudo verse en pantalla se marca **[NO VERIFICADO]**. Las menciones de redes sociales salen de los enlaces del propio sitio, no de revisar los perfiles.

## 0. Cobertura y limitaciones

| Competidor | Web | Estado de verificación |
|---|---|---|
| Gama (Excelsior Gama) | gamaenlinea.com + empresa.gamaenlinea.com | Verificado (render real) |
| Río Supermarket | riomarket.com | Verificado (home e institucional) |
| Forum SuperMayorista | forum.com.ve | Verificado (home, tiendas, quiénes somos) |
| Central Madeirense | tucentralonline.com + apptucentralonline.com | Verificado (home, nosotros, tiendas) |
| Unicasa | unicasa.com.ve | Verificado (home, promociones, contacto, RSE) |
| Kromi Market (Valencia) | kromionline.com | Verificado (home); sin sucursales en Margarita |
| Traki (tiendas por departamentos; Río opera un súper dentro de Traki Margarita) | traki.com | Parcial: home; las subpáginas devolvieron solo el shell |
| Farmatodo (referente digital) | farmatodo.com.ve | Verificado vía WebFetch y render de /tiendas |
| SIGO (referencia propia) | sigo.com.ve | Verificado: hoy es una tienda en línea con catálogo |
| Automercados Plaza's | elplazas.com (tiendas por sucursal) | **No verificado**: Cloudflare bloquea la navegación automatizada (403). Datos de Fenavi/LinkedIn/búsqueda. |
| Rattan Hyper (Margarita) | rattanmargarita.com (según Facebook) | **No verificado**: el sitio falla por certificado SSL inválido. |
| Luvebras | luvebras.com.ve (según Mapcarta) | **No verificado**: conexión reiniciada. |
| GUUAO (Margarita) | guuao.com | **No verificado**: responde 200 pero sin contenido renderizado. |
| Excelsior Gama (dominio antiguo) | excelsiorgama.com | Inaccesible; hoy la marca es "Gama". |
| Daka, Tiendas Garzón, Supermercados Victoria, Hiper Líder | – | No localicé web activa. Hiper Líder aparece solo en Maracay y Barquisimeto, no en Margarita. Daka y Garzón: no encontré web oficial. |

Competidores directos en Margarita según búsquedas y guías locales (no oficiales): **Río Supermarket** (7 sucursales en la isla), **Rattan Hyper**, **GUUAO**, **Fresh Market** (Pampatar), **Kei Market** (Punta de Piedras), **Rubí**. Los datos de Rattan, GUUAO, Kei, Fresh y Rubí vienen de guías y redes, no del sitio de la marca.

Hallazgo contextual: **sigo.com.ve ya es una tienda en línea** (nopCommerce/catálogo, menú de categorías, selector Dólar/Bolívares, carrito). La landing institucional propuesta no compite con ella. Debe derivar a ella o complementarla.

---

## 1. Fichas por competidor

### 1.1 Gama (Excelsior Gama) — referente en estructura institucional
- **URLs**: https://empresa.gamaenlinea.com/ (institucional) y https://gamaenlinea.com/es/ (tienda). Dos dominios con roles separados, y es el mejor patrón del benchmark.
- **Alcance**: 25-26 sucursales en la Gran Caracas (formatos Gama, Express y Plus). Sin presencia en Margarita (búsqueda y listado oficial).
- **Secciones del sitio institucional** (menú): Inicio, Nosotros, Unidades de Negocio, Gama Club, Blog, Contacto. Enlaces secundarios: Nuestra historia, Compromiso social, Empleo, Marca Gama, Sucursales, Gama 360, Ventas corporativas, Noticias.
- **Home institucional, de arriba abajo**: cinta de contacto (correo y 0800-SERVIGAMA), hero "¡De tu lado, siempre!" con la bajada "Pide lo que te haga falta en Gama en Línea y recíbelo donde lo necesites" y CTA **"¡Quiero comprar!"**, contadores (+56 años, +2.000 trabajadores, 26 sucursales, +10.000 productos), bloque Gama Club con CTA **"Afiliarme"**, bloque de campaña social del mes ("Una Sonrisa A Su Cuenta", donaciones en caja para Fundación Operación Sonrisa) y pie legal con RIF.
- **Sucursales/horarios/mapa**: página de listado de sucursales (nombres, una ficha por tienda) y buscador de tiendas en la tienda en línea. En el listado no vi mapa ni horarios **[no verificado en las fichas individuales]**.
- **Promociones**: en la tienda, "Marca Gama" y categorías destacadas. No vi encarte descargable. Los descuentos se canjean con puntos del club.
- **Fidelidad**: **Gama Club**, el programa más explícito del benchmark. 2 puntos por cada Ref. 1 de compra. Doble puntaje los martes en "Productos del Campo". Canje en caja con catálogo semanal. Descuentos permanentes por estar afiliado. "Gamanía" (productos de temporada por puntos). Los puntos vencen a los 4 meses. Aliados con beneficios.
- **App**: no la vi **[no verificado]**.
- **Delivery/pickup**: tienda en línea con "Entregado desde: Gama Plus Santa Eduvigis" (se elige sucursal de despacho). Detalle de zonas y tiempos **[no verificado]**.
- **Pagos y tasa**: la tienda muestra una **barra de tasa BCV ("Ref. 1 = Bs. 874,73")** y un conmutador Bs./Ref. Precios en "Ref." con **IVA desglosado** (Ref + IVA = Total). Medios de pago concretos (Pago Móvil, Zelle, divisas) **[no verificado]**. Cashea aparece en el listado de Cashea para Gama.
- **Contacto**: correo tuopinion@excelsiorgama.com, línea 0800-SERVIGAMA (737 8442), formulario. WhatsApp **[no verificado]**.
- **Redes**: Instagram @somosgamave, X, Facebook, LinkedIn (enlazados en cabecera).
- **Empleo / proveedores / RSE**: "Empleo" y "Ventas corporativas" en el menú. "Compromiso social" más campaña mensual en home. Proveedores como sección propia **[no verificado]**.
- **Blog/recetas**: Blog y Noticias. Recetas **[no verificado]**.
- **Calidad visual / móvil**: institucional con 0 desbordamiento horizontal a 390 px, carga ~7,5 s en headless (pesada). La tienda es una SPA que mostró bien en móvil, pero su HTML inicial está casi vacío (impacto en SEO).
- **Lección clave**: separar "empresa" y "tienda", cifras de confianza, fidelidad con reglas claras y campaña social visible en home.

### 1.2 Río Supermarket — el competidor directo en Margarita
- **URL**: https://www.riomarket.com (el dominio riosupermarket.com NO es de la marca; pertenece a una tienda de Nueva York).
- **Origen y alcance**: nace el 30-may-2019 en Margarita (primer formato grande). "Seis tiendas más en Nueva Esparta", luego Maturín (2022), Caracas, Barcelona, Valle de la Pascua, Barquisimeto, Puerto Ordaz, Lechería, etc. Se declara "el retail más grande de Venezuela" con +50.000 m² de piso de venta. Ficha "Sobre nosotros": misión, visión y espacios gourmet, farmacia, panadería, charcutería y bodegón.
- **Secciones (home)**: es un e-commerce, no una landing. Cabecera con Categorías, login, carrito, selector "¿Cómo te gustaría recibir tu pedido?" y "¿Necesitas ayuda?". **Tasa visible en cabecera ("1 USD = 874.732 VES")**. Pide elegir ubicación para mostrar el catálogo de la tienda más cercana. Carruseles de banners (5). Categorías populares: Carnes y Refrigerados, Cesta Básica, Cuidado Personal, Frulever, Hogar, Licores, Dulces y Snacks, Súper Ofertas.
- **Hero / propuesta de valor**: banners promocionales rotativos. No hay mensaje institucional en la home **[texto de los banners no verificado, son imágenes]**.
- **CTAs**: "Agregar" por producto, "Ver más >" por categoría.
- **Promociones**: "Súper Ofertas" con **precio tachado y "Ahorro REF x"** por producto. Es el patrón de oferta más claro del benchmark.
- **Sucursales**: en /SeccionInformativaRio, listado de texto (nombre + dirección). 17+ sedes, entre ellas en Margarita: Juan Bautista Arismendi, Traki (Porlamar), Playa el Ángel, Terranova, 31 de Julio (La Asunción), Juan Griego y Sambil. **Sin horarios ni mapa visibles.**
- **Fidelidad / app**: no vi programa ni app **[no verificado]**.
- **Pagos**: precios en "REF". Cashea aceptado en sedes de Margarita según prensa (2024) **[no verificado en su sitio]**. Pago Móvil/Zelle **[no verificado]**.
- **Contacto, empleo, RSE, blog**: **[no verificado]**; el footer no se renderizó con claridad.
- **Calidad visual / móvil**: sin desbordamiento a 390 px, carga rápida (1,8 s), pero la home mide ~70.000 px de alto en móvil (scroll infinito de carruseles), lo que es agotador.
- **Lección**: es la referencia local, pero no tiene discurso institucional ni valor "isla". Dejó libre el espacio de marca.

### 1.3 Forum SuperMayorista — landing institucional más parecida a lo que SIGO propone
- **URL**: https://forum.com.ve. Tipo WordPress. 24 sucursales (listado muestra 23 sedes), ninguna en Margarita.
- **Menú**: Inicio, Noticias, Compra Online, Quiénes Somos, Ofertazo, Tiendas.
- **Hero y secuencia de la home**: bloque **WhatsApp "Conoce a CLEO"** (asistente virtual 24 h) como primer CTA ("Escríbeme aquí"); carrusel de promociones con vigencia en el pie ("Validez de las promociones descritas al pie de imagen") y botón **"Ver todos los productos"**; mensaje de experiencia ("Vive una experiencia que solo puedes encontrar en Forum SuperMayorista") con Freed Juice Bar, Groovy's y Hono Food Bar; cita del CEO; Salta Park (parque de trampolines en Forum Cagua); "Entorno pet friendly"; "Crecimiento de la mano de nuestros clientes" con eventos (Hallacazo, sorteos, rifa de vehículos 0 km, Carrera-Caminata Forum Vinotinto); **mapa Leaflet/OpenStreetMap** con las tiendas; pie con dirección de oficina y teléfono.
- **Sucursales**: página /tiendas con listado por nombre y mapa interactivo. Cada tienda tiene su subpágina. **Horarios en las subpáginas [no verificado]**.
- **Promociones**: banners con vigencia más página "Ofertazo / Precios especiales". Un enlace de /ofertazo/ devolvió 404 (rompe la navegación del pie).
- **Fidelidad / app**: no vi **[no verificado]**.
- **Delivery**: "Compra Online" redirige a un marketplace externo (**Zupper by Ridery**). Es decir, no hay e-commerce propio.
- **Pagos/tasa**: no se muestran en la landing.
- **Contacto**: **WhatsApp prominente** (bot Cleo), teléfono fijo (0212) 693-4430, dirección en Altamira. Instagram @forumsm_ve.
- **Empleo, proveedores, RSE**: no hay enlaces dedicados; la RSE aparece como narrativa de comunidad/empleo local.
- **Blog**: "Noticias" (WordPress).
- **Calidad visual / móvil**: 0 desbordamiento a 390 px, carga ~6,7 s, página de ~7.500 px, bien equilibrada. Imágenes en WebP.
- **Lección**: modelo de landing con identidad, mapa, WhatsApp como CTA principal y experiencias "más allá de la compra". Su punto débil es que el e-commerce es externo y sin horarios.

### 1.4 Central Madeirense — la más completa en secciones editoriales
- **URLs**: https://tucentralonline.com (institucional y tienda en línea), https://apptucentralonline.com (landing de la app). centralmadeirense.com figura como dominio en venta (parked). madeirense.com redirige a "/lander".
- **Alcance**: 18 sedes en el selector del sitio (Caracas, La Guaira y Altos Mirandinos); ninguna en Margarita.
- **Menú**: Nuestras sucursales, Inicio, Nosotros, Tips, Noticias, Revista Digital, Central de Bienestar, Central Gourmet, Central de Hogar, Central Verde, **Turismo Nuestro**, Proveedores, Responsabilidad Social, Únete al Equipo, Contacto, **Comprar en línea**.
- **Hero**: "Más de 70 años acompañando a las familias venezolanas" y lema "¡Viva mejor por menos!". Debajo, un feed de Instagram (@cmadeirense, ~733 mil seguidores según el widget).
- **Sucursales**: selector desplegable "Selecciona tu sede más cercana". **Sin mapa, sin horarios, sin direcciones** en la página.
- **Promociones**: la landing de la app promete "promociones imperdibles" y "Feria Campesina". Encarte propio no visible.
- **Fidelidad**: no vi programa **[no verificado]**.
- **App**: sí, en iOS y Android (landing propia con "¡Descarga la app!"). Beneficios: múltiples opciones de pago, historial de pedidos, delivery. Reseñas de App Store señalan una experiencia "anticuada" (v2.5 de oct-2023; fuente indirecta).
- **Delivery/pickup**: sí, según fichas de la app **[detalles no verificados]**.
- **Contacto**: teléfono 0212-307-1600/1605, formulario, encuesta de satisfacción. WhatsApp **[no verificado]**. Redes: Facebook, X, Instagram, YouTube.
- **Proveedores / Empleo / RSE**: secciones propias en menú (contenido no visto).
- **Blog/recetas**: el más desarrollado: Tips, revista digital y categorías Bienestar, Gourmet, Hogar, Verde y "Turismo Nuestro".
- **Calidad visual / móvil**: 0 desbordamiento, carga 3,9 s, pero la home es larga y muy cargada, con el feed de Instagram incrustado mostrando contenido fechado en marzo. Menú con 15 entradas: exceso de opciones.
- **Lección**: contenido editorial amplio y landing específica de app. Fallos: menú sobrecargado y sucursales sin mapa.

### 1.5 Unicasa — sitio institucional clásico, referencia de "qué no hacer" en diseño pero útil en contenido
- **URL**: https://unicasa.com.ve (ASP.NET, sin meta viewport, desbordamiento horizontal de 980 px en móvil: **no es responsive**).
- **Menú**: Quiénes somos, Recetas, Actividades (volante, talleres y cursos), Compromiso social, Novedades, Contactos.
- **Hero**: galería de banners promocionales. Misión y visión en la home ("Ser la cadena de autoservicio líder del país").
- **Promociones**: página **Volante** con "PRECIOS SÚPER ESPECIALES", **fechas de vigencia (05/10 a 09/10/2026)** y botón **Descargar** (PDF). Referencia directa para el encarte semanal.
- **Sucursales/horarios**: en /Contacto, filtro por región (Distrito Capital, Guárico, Miranda) y subregión; cada ficha trae dirección, varios teléfonos y **horario (Lun-Sáb 8:00-20:00, Dom 8:00-19:00)**. Sin mapa.
- **Recetas**: 20+ recetas con tiempo de preparación y porciones (hallaca, funche, panettone), etiquetadas "Receta Nueva".
- **RSE**: página extensa de "Compromiso Social" (salud, educación, ambiente, voluntariado corporativo, informes en PDF).
- **Empleo**: "Gente Única" con formulario de postulación (/Contacto/Empleate).
- **Contacto**: formulario, oficina principal en Caracas, línea 0501-UNICASA, correo siguenos@unicasa.com.ve. Redes: Twitter, Facebook, YouTube (enlaces de la cabecera). WhatsApp: no.
- **Fidelidad / app / delivery / pagos / tasa**: ninguno visible.
- **Lección**: encarte con vigencia + horarios por sucursal + recetas + RSE son contenido valioso, pero entregado con una web de 2012 sin móvil.

### 1.6 Kromi Market (Valencia) — referencia de e-commerce funcional sin Margarita
- **URL**: https://www.kromionline.com. Plataforma Stellar WebStore (misma que Traki).
- **Alcance**: 7 sedes (Prebo, Mañongo, San Felipe, Trigal Sur/Norte, Guataparo, Castillito). No opera en Margarita.
- **Home**: tienda con buscador, login, carrito, categorías (códigos tipo VIV, LIC, CAR), **conmutador de divisa "Divisa Vta BCV"**, **panel flotante de WhatsApp** ("Hola, ¿En qué podemos ayudarte?"), horario de atención (L-D 8:00-20:00), **horario de despacho por tienda (8:00-21:30)** y "**Entrega el mismo día para pedidos recibidos antes de las 8:00 pm**". Lista de ubicaciones con dirección.
- **Fidelidad/app/RSE/blog**: **[no verificado]**.
- **Calidad**: móvil sin desbordamiento; interfaz utilitaria.
- **Lección**: manera clara de comunicar el corte horario de entrega y el WhatsApp visible.

### 1.7 Traki — referente retail con presencia fuerte en Margarita
- **URL**: https://traki.com (también Stellar WebStore). "División de tiendas por departamentos con más de 35 años de trayectoria... 36 sucursales en todo el país".
- **Menú**: Nosotros, Empleo, Sucursales, Fundación Traki, **Bancamiga** (aliado financiero), Login/Registrarse. También Wishlist, **Giftcard**, FAQ, Horario y Envío (páginas separadas).
- **Home**: tienda con precios en "Ref" y etiqueta "IVA incluido". El destacado era la temporada navideña (productos de Navidad en octubre).
- **Redes**: Instagram @trakienganchate, YouTube @trakimuevete, TikTok. Presencia en TikTok y YouTube: algo poco común en el rubro.
- **Notas**: Río Supermarket tiene un súper dentro de Traki Margarita. Las subpáginas (envío, horario, FAQ) devolvieron solo el shell, así que sus reglas de envío **no se verificaron**.
- **Lección**: Fundación y alianza bancaria en el primer nivel del menú; giftcard.

### 1.8 Farmatodo — referente digital retail (no supermercado)
- **URL**: https://www.farmatodo.com.ve (e-commerce).
- **Home**: saludo "¡Hola, bienvenido a Farmatodo!", selector de ciudad, categorías (Salud, Belleza, Cuidado Personal, Bebé, Alimentos y Bebidas, Hogar), banner "las mejores ofertas", **folleto de súper precios y de ofertas (/catalogo)**, "Nuestras tiendas — Ubicar tienda", servicios: **delivery 7 días a la semana, "envíaloYa", asesoría farmacéutica en línea**.
- **Sucursales**: /tiendas con listado agrupado por ciudad y **horario por sucursal ("Abierta 24 horas", "Lunes a domingo 7:00 AM a 11:00 PM")**. Es el mejor patrón de horarios del benchmark.
- **Pagos**: Visa, MasterCard, American Express, Diners, punto de venta y contra entrega. Pago Móvil/Zelle **[no verificado]**.
- **Fidelidad / app**: no vi en la home **[no verificado]**. Contacto: formulario de "peticiones, quejas o reclamos". Redes: Facebook, X, Instagram, LinkedIn. Empleo en el pie.
- **Móvil**: 0 desbordamiento, 126 imágenes, carga 6,4 s.
- **Lección**: horarios y 24 h por sucursal, servicios con nombre propio.

### 1.9 Automercados Plaza's — **[NO VERIFICADO en vivo]**
- Web: tiendas por sucursal bajo elplazas.com (p. ej. vallearriba.elplazas.com), protegido por Cloudflare. No pude renderizarlo.
- Datos de fuentes secundarias: empresa familiar fundada en 1963 (Supermercados El Prado → Prados del Este → Plaza's), 21-24 sucursales en Gran Caracas, Higuerote, Altos Mirandinos y Valencia (Fenavi/LinkedIn/Wikipedia). Sin presencia en Nueva Esparta. Tienda en línea con app y programa "Zona Deleite" (según un caso de estudio de e-commerce, no verificado). Marca propia "Nuestra marca Plaza's". Aniversario 60 con imagen renovada (2023).
- Atención: **supermercadosplaza.com es una cadena española sin relación**.

### 1.10 Otros del segmento Margarita y no verificados
- **Rattan Hyper**: cadena de Margarita (Playa El Ángel, 4 de Mayo, Paraguachi, Porlamar, Rattan Plaza). Aceptaba Cashea según el listado de Cashea. Presencia en Instagram (@rattanhyper), Facebook y X. Web rattanmargarita.com con certificado inválido: **[no verificado]**.
- **GUUAO**: supermercado en Margarita (Sambil, La Vela, Igualdad, Encrucijada) según guía local. Web sin contenido renderizado.
- **Luvebras**: grupo de Caracas y Guatire (Facebook activo); web no accesible.
- **Fresh Market, Kei Market, Rubí**: solo guías locales e Instagram.
- **Cashea** como ecosistema: 347 comercios, 12 categorías; en el listado aparecen supermercados (Gama, Family Market, Fiorella, Fresh Market, Fruver, Balys, Aikoz) y, según el centro de ayuda, Rattan en Nueva Esparta. Muestra que el pago en cuotas ya es un criterio de decisión.

---

## 2. Matriz comparativa

Leyenda: Sí = verificado en pantalla. Parcial = existe pero incompleto. No = no vi. ? = no verificado.

| Funcionalidad | Gama | Río | Forum | C. Madeirense | Unicasa | Kromi | Traki | Farmatodo | SIGO hoy |
|---|---|---|---|---|---|---|---|---|---|
| Web institucional separada de tienda | **Sí** | No | Sí (tienda externa) | Parcial (mismo dominio) | Sí (sin tienda) | No | Parcial | No | No |
| Hero con propuesta de valor escrita | **Sí** | No (banners) | Parcial | Sí ("+70 años") | No | No | No | Parcial (saludo) | No |
| Cifras de confianza (años, sucursales, empleados) | **Sí** | Parcial (texto) | Parcial (24 sucursales) | Sí (+70 años) | No | No | Sí (35 años, 36 suc.) | No | ? |
| Listado de sucursales | Sí | Sí (texto) | **Sí** | Sí (desplegable) | Sí | Sí | Sí | **Sí** | ? |
| Mapa interactivo | No | No | **Sí** | No | No | No | ? | ? | ? |
| Horarios por sucursal | ? | No | ? | No | **Sí** | Parcial (despacho) | ? | **Sí (24 h)** | ? |
| Encarte/volante con vigencia | No | No (ofertas con ahorro) | Parcial | No | **Sí (PDF)** | No | No | Sí (folleto) | ? |
| Ofertas con precio tachado/ahorro | No | **Sí** | No | No | No | ? | No | Sí | ? |
| Programa de fidelidad | **Sí (Gama Club)** | No | No | No | No | No | No | No (programa de salud) | ? |
| App móvil | ? | ? | No | **Sí** | No | ? | No | ? | ? |
| Delivery / pickup | Sí | Sí | Externo (Zupper) | Sí | No | Sí (mismo día) | ? | **Sí (7 días)** | ? |
| Tasa BCV / conmutador Bs-Ref | **Sí** | **Sí** | No | No | No | **Sí** | Parcial (Ref) | No | Parcial (Dólar/Bs) |
| IVA desglosado | **Sí** | No | No | No | No | ? | "IVA incluido" | ? | ? |
| Medios de pago listados | ? | ? | No | "Múltiples" | No | ? | Bancamiga | Tarjetas | ? |
| Cashea (según Cashea) | Sí | Sí (Margarita 2024) | ? | ? | ? | ? | ? | ? | ? |
| WhatsApp visible | ? | ? | **Sí (bot Cleo)** | ? | No | **Sí** | ? | No | ? |
| Teléfono / 0800 | Sí (0800) | ? | Sí | Sí | Sí (0501) | Sí | ? | ? | ? |
| Formulario de contacto | Sí | ? | No | Sí | Sí | Sí | ? | Sí (reclamos) | ? |
| Redes (Instagram, etc.) | Sí | ? | Sí | Sí | Parcial (Twitter, FB, YT) | ? | **Sí (IG, YT, TikTok)** | Sí | ? |
| Trabaja con nosotros | Sí | ? | No | Sí | **Sí (formulario)** | ? | Sí | Sí | ? |
| Proveedores | ? | ? | No | **Sí** | No | No | No | No | ? |
| Responsabilidad social | **Sí + campaña** | ? | Narrativa | Sí | **Sí (extensa)** | No | **Sí (Fundación)** | No | ? |
| Blog / recetas | Blog, noticias | No | Noticias | **Sí (revista, recetas, tips)** | **Recetas + talleres** | No | No | No | ? |
| Móvil sin desborde horizontal (390 px) | Sí | Sí | Sí | Sí | **No** | Sí | Sí | Sí | Sí (396 px, leve) |
| Presencia en Margarita | No | **Sí (7)** | No | No | No | No | **Sí** | ? | **Sí** |

---

## 3. Patrones comunes en Venezuela (lo que el usuario espera)

1. **Precio en referencia a dólar, con tasa BCV a la vista.** Gama muestra una barra "BCV Ref. 1 = Bs. 874,73", Río pone "1 USD = ... VES" en la cabecera, Kromi "Divisa Vta BCV", Traki y Río etiquetan "REF". La tasa actualizada y un conmutador Bs/USD son estándar. Un sitio que no muestre la tasa se siente desactualizado.
2. **IVA explícito.** Gama desglosa Ref + IVA = Total; Traki dice "IVA incluido". Los precios dolarizados exigen transparencia fiscal.
3. **WhatsApp como canal principal de atención** (Forum con bot "Cleo" 24 h, Kromi con panel flotante). El correo y el formulario quedan en segundo plano. Menos de la mitad lo ofrece de forma visible, lo que lo hace un diferenciador barato.
4. **Pago en cuotas con Cashea** como criterio de decisión: Cashea lista 347 comercios y varias cadenas de supermercados. Los sitios rara vez lo comunican en su propia web.
5. **Medios de pago locales** (Pago Móvil, divisas en efectivo, Zelle, punto de venta, Cashea, tarjetas): casi ninguno los muestra en forma de iconos o lista (solo Farmatodo lista tarjetas). Este es un hueco de contenido en todo el mercado.
6. **Encarte/oferta semanal con vigencia** (Unicasa "Volante" con fechas y PDF; Río con "Ahorro REF x"; Farmatodo con folleto). Las promociones sin fecha de vigencia generan desconfianza.
7. **Selector de sucursal o ciudad antes de comprar** (Río pide ubicación, Gama "Entregado desde", Madeirense "Selecciona tu sede más cercana", Farmatodo ciudad).
8. **Estructura típica de landing institucional**: quiénes somos (historia y cifras), sucursales, promociones, fidelidad, trabaja con nosotros, responsabilidad social, contacto, redes.
9. **Fundación o campaña social visible** (Gama con campaña mensual, Traki con Fundación, Unicasa con voluntariado). Es una señal de confianza en el rubro.
10. **Contenido editorial como fidelización** (recetas en Unicasa y Madeirense; temporada navideña con hallaca y pan de jamón).
11. **Fuerte uso de móvil.** Las webs modernas del grupo (Gama, Forum, Río, Madeirense, Kromi, Farmatodo) pasan sin desborde en 390 px; la excepción es Unicasa.
12. **Tendencia a Instagram como "web real".** Varias cadenas (Rattan, Kei, Rubí, GUUAO) parecen mantener presencia sobre todo en Instagram y Facebook; sus webs, cuando existen, no están actualizadas o fallan.

---

## 4. Huecos y oportunidades para SIGO

**Contexto**: el único competidor directo con web propia en Margarita es Río Supermarket, y su sitio es 100 % transaccional, sin discurso de marca ni de isla. Las demás cadenas de la isla (Rattan, GUUAO, Fresh Market, Kei, Rubí) tienen web inexistente, rota o no verificable. Las grandes cadenas con buenos sitios (Gama, Forum, Madeirense, Unicasa) no operan en Margarita.

### 4.1 Lo que casi nadie hace bien
1. **Horarios + mapa por sucursal en una sola vista.** Solo Forum tiene mapa y solo Farmatodo/Unicasa tienen horarios. Nadie combina mapa, horario, teléfono, "abierto ahora" y botón "Cómo llegar" (Google Maps / Waze) con un toque.
2. **Medios de pago visibles** (Pago Móvil, divisas, Zelle, punto de venta, Cashea, tarjetas). Casi ningún sitio los muestra.
3. **Tasa BCV en una landing institucional.** Solo se ve en tiendas en línea; en la landing de una cadena sería un diferenciador de confianza.
4. **Encarte digital con vigencia, compartible por WhatsApp.** Unicasa lo hace con PDF desactualizado y sin móvil; nadie ofrece "comparte este encarte por WhatsApp".
5. **WhatsApp como CTA primario** con respuestas rápidas (ubicación, horario, encarte), no solo un botón flotante.
6. **Fidelidad bien explicada.** Solo Gama Club tiene reglas claras. Un programa SIGO (si existe) debería explicarse en tres pasos.
7. **Rendimiento móvil.** Las páginas de Gama (7,5 s) y Forum (6,7 s) son pesadas en carga; una landing ligera (<2 s) es ventaja.
8. **Transparencia institucional con cifras** (años, tiendas, empleados locales, proveedores margariteños). Madeirense y Gama usan "+70 años", "+56 años".

### 4.2 Ángulo insular / turismo / puerto libre (nadie lo explota)
Ninguno de los sitios revisados menciona turismo, visitantes ni la condición de zona franca/puerto libre de Margarita. Gama habla de Caracas; Madeirense solo tiene una categoría de blog "Turismo Nuestro" (y no es para visitantes). Oportunidades concretas:
- **"El súper de la isla"**: identidad margariteña, con historia desde 1972 (dato de guía local sobre SIGO, **por confirmar con el cliente**) y sucursales por municipio (Porlamar, Pampatar, Juan Griego, La Asunción, etc.).
- **Sección "Visitas la isla"** (turistas, posaderos, yates, segunda residencia): sucursal más cercana a hoteles y a puertos/aeropuerto, horarios extendidos, pedidos grandes para posadas y villas, "arma tu mercado antes de llegar" por WhatsApp.
- **Versión bilingüe español/inglés** al menos para sucursales, horarios y pagos (ningún competidor la ofrece; verificado en los sitios revisados).
- **Mensaje de puerto libre**: explicar qué productos importados y licores aplican (**verificar el régimen vigente de puerto libre/zona franca con asesoría legal antes de publicar afirmaciones tributarias**). Un bloque "Importados y licores de la isla" es un gancho que Río apenas toca (categoría Licores).
- **Productos margariteños y de la zona**: pescadería, sal, cocina local, proveedores locales ("Hecho en Margarita"), con página de proveedores locales para captar más.
- **Temporada alta** (Semana Santa, Carnaval, diciembre, vacaciones escolares): módulo con horarios especiales y ofertas de temporada, como el "Hallacazo" de Forum, pero con sabor local.
- **Logística insular**: aviso de ferry/aeropuerto para abastecimiento y estado de abastecimiento (transparencia); ningún competidor lo comunica.
- **Contenido**: recetas con pescado y ingredientes locales (pastel de chucho, pisca, arepas de pabellón...), que Unicasa y Madeirense hacen solo en clave capitalina.

### 4.3 Propuesta de estructura de landing derivada del benchmark
1. Cabecera mínima (6 ítems máx.), tasa BCV visible, botón WhatsApp y selector ES/EN.
2. Hero con propuesta de valor + 2 CTAs: "Ver sucursal más cercana" y "Escríbenos por WhatsApp" (más "Comprar en línea" hacia sigo.com.ve).
3. Franja de cifras de confianza (años, tiendas, empleados margariteños).
4. Encarte de la semana con vigencia, descarga y "compartir por WhatsApp".
5. Sucursales: mapa + tarjetas con horario, teléfono, "Abierto ahora" y "Cómo llegar".
6. Cómo pagas / cómo recibes: Pago Móvil, divisas, Zelle, tarjetas, Cashea (si aplica); delivery/pickup.
7. Programa de fidelidad o beneficios (si existe) en 3 pasos.
8. "Visitas Margarita" (turismo, puerto libre, importados).
9. Recetas / ideas de temporada (3 tarjetas).
10. Compromiso social y proveedores locales.
11. Trabaja con nosotros / proveedores.
12. Contacto, redes y pie legal (RIF).

### 4.4 Qué evitar (errores observados)
- Unicasa: sin diseño móvil y sin viewport; texto largo sin jerarquía.
- Madeirense: menú de 15 entradas y feed de Instagram incrustado con contenido viejo.
- Forum: enlace roto /ofertazo/; compra externa sin marca propia.
- Río: home de ~70.000 px de alto en móvil y ninguna narrativa de marca.
- Gama: SPA con HTML inicial vacío (SEO débil) y carga lenta del institucional.
- Sitios con certificado SSL inválido o dominios caídos (Rattan, Luvebras, Excelsior): confianza perdida; asegurar HTTPS válido y dominio propio.

### 4.5 Pendientes para completar el benchmark
- Probar manualmente Plaza's (elplazas.com) desde un navegador normal, ya que Cloudflare bloquea automatización.
- Revisar en vivo Rattan (Instagram/Facebook/web), GUUAO, Fresh Market, Kei Market y Rubí.
- Confirmar medios de pago, apps, WhatsApp y programa de fidelidad en Río, Gama (tienda) y Kromi mediante prueba de compra real.
- Revisar el contenido real de las páginas de empleo, proveedores y RSE de Madeirense y Gama.
- Verificar con SIGO sus datos (año de fundación, número de sucursales, programa de fidelidad, medios de pago) antes de publicar cualquier cifra.
