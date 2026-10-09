# E-commerce de supermercados en Venezuela: benchmark de UX para el rediseño de la tienda SIGO

Fecha de análisis: 9-oct-2026. Alcance: tiendas online (catálogo, carrito, checkout), no webs institucionales. Esto complementa `02-competencia-nacional.md` (institucional) y `03-sitio-actual-sigo.md` (SIGO hoy).

## 0. Método, cobertura y límites

**Método.** Navegué en vivo con Chromium headless (Playwright) en móvil 390 px y escritorio 1366 px. Probé home, menú, buscador (incluido un error de tipeo deliberado: "hrina"), listado (PLP), ficha (PDP), agregar al carrito, carrito y, cuando no exigía login, el checkout. Las capturas están en `docs/investigacion/capturas-ecommerce/` (JPG, todas de 150 KB o menos; las que citan este informe llevan el nombre de la tienda como prefijo).

**Qué quedó sin ver.** Los pasos posteriores al login (franjas horarias, selección final de pago, confirmación) exigen cuenta y datos reales. No hice compras de prueba. Todo lo que dependa de eso va marcado **[NV]** (no verificado).

**Pesos y tiempos.** Los mido con headless a través de un proxy. Son útiles para comparar entre sitios, no como valores absolutos de un usuario en 4G.

| Competidor | Plataforma / URL | Estado |
|---|---|---|
| Gama en Línea (Excelsior Gama) | SAP Commerce (Hybris), `gamaenlinea.com/es/` | Verificado hasta carrito. Checkout **[NV]** (login obligatorio) |
| Río Supermarket | Instaleap headless, `riomarket.com` | Verificado hasta PDP y modal de entrega. Carrito y checkout **[NV]** |
| Kromi Online (Valencia) | Stellar WebStore (PHP), `kromionline.com` | Verificado hasta carrito. Checkout **[NV]** (login obligatorio) |
| Traki | Stellar WebStore, `traki.com` | Home, PDP; páginas de envío, horario y FAQ vienen vacías |
| Farmatodo | Web propia, `farmatodo.com.ve` | Verificado: búsqueda, PLP, agregar. Checkout **[NV]** |
| Central Madeirense | WooCommerce por sede, `tucentralonline.com/<sede>/` | Verificado completo hasta el formulario de pago |
| Forum SuperMayorista | No tiene tienda propia. Vende en Zupper (by Ridery), `zupper.market` | Verificado perfil de tienda y catálogo |
| SIGO (referencia) | nopCommerce, `www.sigo.com.ve` y subdominios por sucursal | Verificado hasta carrito |
| Plaza's, PedidosYa | Cloudflare bloquea la navegación automatizada | **[NV]** |
| Yummy | Landing de "SuperApp" (4 M usuarios, 35 ciudades, "+6.000 restaurantes y supermercados"). El catálogo vive en la app | Catálogo de súper **[NV]** |
| GUUAO | App web Flutter con verificación de edad (+18). No es un súper tradicional | Catálogo **[NV]** |
| Rattan Hyper, Luvebras, Hiper Líder, Unicasa | Rattan: certificado SSL inválido (`ERR_CERT_COMMON_NAME_INVALID`). Luvebras e Hiper Líder: sin conexión. Unicasa: sin tienda | Sin e-commerce verificable |
| Excelsior Gama (dominio viejo) | Hoy es "Gama" | Cubierto en Gama |

Dos correcciones a `02-competencia-nacional.md`. (1) La home de Río mide unos 5.200 px de alto en móvil, no 70.000. (2) GUUAO se comporta como app de delivery con control de edad, no como cadena con catálogo web.

---

## 1. Resumen ejecutivo

1. **El estándar venezolano ya existe y se repite.** Precios en dólares con la etiqueta "Ref." o "REF", tasa BCV a la vista (Gama y Río la ponen en cabecera) y un selector Ref./Bs. Gama separa Ref + IVA + Total en cada tarjeta. Farmatodo muestra solo bolívares. SIGO tiene un selector "US Dólar" pero no muestra la tasa.
2. **Los mejores sitios fuerzan la pregunta "¿dónde te lo llevo?" antes de mostrar el catálogo**, porque el inventario depende de la tienda.
   - Gama pregunta municipio y urbanización, y de ahí asigna la sucursal ("Entregado desde: Gama Plus Santa Eduvigis").
   - Río pregunta "a domicilio o en tienda", y luego dirección o estado/ciudad/tienda.
   - Central Madeirense obliga a elegir sede entre 18.
   - SIGO obliga a elegir tienda con dos banners de imagen, y cada tienda es un subdominio separado.
3. **Quien mejor ejecuta es Río**, con tecnología Instaleap, y **Gama** en estructura y transparencia fiscal.
   - **Río:** buscador tolerante a errores, tarjeta con "Ahorro REF x" y precio tachado, precio por unidad o kg, barra de compra fija en la ficha.
   - **Gama:** mega-menú de 9 departamentos, IVA e IGTF desglosados, aviso de mínimo de compra ("debe agregar al menos Ref. 13,00 más"), carritos guardados y club de lealtad. Su FAQ lista más de 10 medios de pago.
4. **El checkout local es una jungla de medios de pago manuales.** Zelle, Pipol Pay, Zinli, Mony, Venmo, Medopay, WallyMóvil, transferencia y Pago Móvil, casi todos con "paga y luego registra el pago". Solo Gama (Pago Móvil, C2P, tarjetas) confirma de inmediato algunos medios; el resto toma 24 h de validación. Cashea no aparece como método propio en ninguna tienda revisada **[NV en checkout]**.
5. **Los fallos de UX son tan instructivos como los aciertos.**
   - Central Madeirense muestra "#" en lugar de "$", botones en inglés, imágenes rotas y un checkout largo con registro obligatorio.
   - Farmatodo calcula mal el precio por unidad ("Gramos a Bs 990.00" para 1 kg).
   - Traki publica páginas de envío y horario vacías.
   - Kromi tarda 11 s o más en mostrar productos tras un esqueleto gris.
   - Zupper pesa 9,4 MB.
6. **SIGO hoy está por debajo del estándar nacional en seis frentes** (detalle en la sección 5):
   - Buscador sin tolerancia a errores.
   - Dos tiendas con carritos separados bajo subdominios.
   - Sin tasa BCV visible.
   - Sin ofertas con ahorro ni precio por unidad.
   - Árbol de categorías con errores de enlace.
   - Sin mínimo de compra ni costo de envío visible antes del checkout.
7. **Hueco competitivo.** Ninguna tienda revisada ofrece **listas de compra, "comprar de nuevo", recetas, sustitutos elegidos por el cliente ni seguimiento del pedido a la vista**. Solo Gama tiene carritos guardados y Farmatodo tiene "Avísame cuando esté disponible" y "Ver productos similares". Hay espacio para diferenciarse en Margarita **[los flujos posteriores al login no se verificaron en ninguna tienda]**.

**Recomendación central.** Una sola tienda con un carrito, donde el cliente elige delivery por municipio y sector o retiro en tienda, y el sistema asigna la sucursal. A eso se suman tasa BCV y doble moneda visibles, buscador tolerante, tarjetas de oferta con ahorro y checkout corto con pagos locales claros (lista priorizada en la sección 9).

---

## 2. Tabla comparativa por función

Leyenda: Sí = verificado en pantalla. Parcial = existe con limitaciones. No = no lo vi. [NV] = no verificable. "Ref." significa que el precio se rotula "Ref" o "REF".

### 2.1 Home, navegación y búsqueda

| Función | Gama | Río | Kromi | Traki | Farmatodo | C. Madeirense | Forum (Zupper) | SIGO hoy |
|---|---|---|---|---|---|---|---|---|
| Obliga a elegir tienda o ubicación antes de comprar | Sí, por defecto una sucursal con "Modificar" (municipio y urbanización) | Sí, modal de método de entrega al primer "Agregar" | Selector de sucursal por parámetro (`suc=UNI02`) | [NV] | Selector de ciudad (Caracas) | Sí, 18 sedes en radios, un sitio por sede | Sí, modal "Elige tu ciudad" | Sí, 2 banners de imagen a subdominios distintos |
| Tasa BCV visible | Sí, barra "BCV / Ref. 1 = Bs. 875,65" | Sí, "1 USD = 875.651 VES" | Sí, selector "Divisa Vta BCV" y pestaña "Dolar" | Selector "Ref / Dolar USD" | No, precios solo en Bs | Elección de moneda en checkout | No | No (solo "US Dólar" sin tasa) |
| Conmutador de moneda | Sí (Ref. / Bs.) | Parcial (solo muestra la tasa) | Sí | Sí | No | Sí (en checkout) | No | Sí, "US Dólar / Bolívares", sin tasa |
| Hero y ofertas en home | Hero de marca propia, carruseles de producto | Banners de marcas aliadas (Plumrose, Capri, PAN), "Súper Ofertas" | Banner con vigencia "09 al 12 de octubre 2026", 4 accesos rápidos | Navidad en octubre | Banner "Promoción autorizada por la SUNDDE, válida del 05 al 11 de octubre" | Carrusel "PROMOCIONES" con cuenta regresiva | Productos destacados con ahorro | Banner "Bienvenidos", sin ofertas visibles |
| Menú | Mega-menú de 9 departamentos, 2 niveles, "Ver todo" | Botón "Categorías" (mega-menú) | 19 departamentos en pestañas MAYÚSCULAS | Pestaña inferior "Categorías" | 6 departamentos con desplegable | Menú de 7 departamentos (Víveres, Refrigerados, Frutería y Vegetales, Cuidado Personal, Limpieza, Licores, Hogar y Temporada) | Pasillos en barra lateral | Mega-menú con 139 categorías |
| Autocompletado | Sí, 1 sugerencia + 5 productos con foto y precio | Sí (resultados al instante) [parcial] | Pestaña "Buscar" [parcial] | Icono de lupa [parcial] | Sí (panel de filtros + productos) | Caja "Busca aquí" estándar de WooCommerce | Buscador interno de la tienda | Búsqueda por palabra clave |
| Tolerancia a errores ("hrina") | Parcial: ignora la palabra mal escrita y busca "pan" | Sí: "hrina" devuelve los mismos 162 resultados que "harina" | [NV] | [NV] | Sí: "hrina de maiz" devuelve harinas | [NV] | [NV] | **No: "No se encontraron productos"** |
| Búsqueda por voz | No vi | No vi | No vi | No vi | No vi | No vi | No vi | No |
| Estructura de URLs | `/es/<slug>/c/A0102`, `/p/<id>` | `/search?name=`, `/p/<slug>-<EAN>` | `Products.php?cat=VIV.ARZ&suc=UNI02` | `/product/30093068` | `/buscar?product=...` | `/<sede>/comprar/<cat>/` | `zupper.market/comercios/...` | `/harinas`, subdominio por sucursal |

### 2.2 PLP, PDP, carrito y checkout

| Función | Gama | Río | Kromi | Traki | Farmatodo | C. Madeirense | Forum (Zupper) | SIGO hoy |
|---|---|---|---|---|---|---|---|---|
| Filtros PLP | Sidebar: promociones, precio (aparece dos veces), marca, categorías | Panel móvil: precio, características similares, categorías, promociones, marca | Un `<select>` de orden (precio, nombre) | [NV] | Categoría, marca, subcategoría, precio | "Filter" + orden (popularidad, precio, rating) | Pasillos | Filtros por categoría y fabricante; orden por posición, nombre, precio |
| Tarjeta: precio | "Ref. 2.00 / IVA / Total Ref." | "REF 2,09" + tachado + pill "Ahorro REF 0,39" | `$1.38`, "Exento de IVA" o "$12.59 + IVA / $14.60" | "Ref 39.00 / IVA INCLUIDO" | `Bs.990,00` | `# 2,09` (símbolo erróneo) | `5.79$`, tachado y chip `-0.49$` | `$1.87` |
| Precio por unidad o kg | No vi | Sí: "1 un (un a REF 2,09)" y "0.5 kg (kg a REF 1,35)" | No | No | Sí, pero con error: "Gramos a Bs 990.00" para 1 kg | No | Sí: "$5.29/kg", "Desde 300 Gr" | No |
| Badges | Filtro "¡SUPER DESCUENTO!" | Llama/%, "Últimas unidades", "Ahorro REF x" | "COMPRA AL MAYOR", "Descuento a partir de 24 UND" | No | Reseñas, "35 mins", "Avísame cuando esté disponible" | "-18%" con "LA OFERTA TERMINA EN" | "-0.49$" | "PRÓXIMAMENTE" en varios productos |
| Agregar rápido con stepper | Botón que pasa a stepper -/+ en la misma tarjeta | Botón "Agregar" (modal de método de entrega la primera vez) | "Agregar" (cantidad en carrito) | "Agregar" | "+" azul que se vuelve contador | Stepper y botón "ADD TO CART" siempre visibles | "+" circular | Stepper y botón siempre visibles; texto truncado "AÑADIR AL CARRI…" |
| Grilla móvil | 2 columnas | 2 columnas | 1 columna en lista | 2 columnas | 1 columna en lista | 2 columnas | Carruseles | 2 columnas |
| Paginación | Numerada (« 1 2 3 »), 12 por página | Scroll continuo [parcial] | Lista larga con carga diferida | [NV] | Lista continua | Numerada, 20, 30 o 40 por página | Carruseles por pasillo | 20, 30 o 40 por página |
| PDP | Foto con "Expandir imagen", marca, ID, IVA y total, cantidad, "En stock", relacionados, detalles, reseñas | Foto, wishlist, zoom, marca, descripción, especificaciones, relacionados; **barra inferior fija** con precio, ahorro y botón | [NV] | Estrellas, descripción | [NV] | Ficha estándar WooCommerce | [NV] | Ficha nopCommerce [parcial] |
| Mínimo de compra | **Sí, en carrito**: "debe agregar al menos Ref. 13,00 más" (para un carrito de Ref. 2,00) | [NV] | [NV] | [NV] | [NV] | No visible | [NV] | No visible |
| Mini-carrito | Icono con contador, página de carrito | Icono con contador | Icono con contador, panel de resumen | Pestaña inferior | Icono con contador | Dropdown con "View cart" | Canasta con contador | Panel lateral "Carrito de compras" |
| Carrito: desglose | Subtotal, IVA, **IGTF pendiente**, **envío pendiente**, total, cupón, **guardar carrito** | [NV] | Items, subtotal, IVA, total | [NV] | [NV] | Subtotal y total; envío "calculado en checkout" | [NV] | Subtotal, envío "calculado durante el checkout" |
| Registro o invitado | Login obligatorio para procesar | [NV] | Login obligatorio ("Inicie sesión para procesar su compra") | [NV] | Login por número celular [NV el resto] | Crea cuenta en el mismo formulario (campo de contraseña) | [NV] | Pasos Carro / Envío / Pago / Confirmar / Completa; invitado [NV] |
| Retiro en tienda | Pickup en tiendas seleccionadas (texto SEO) | Sí ("En tienda") | [NV] | "Horarios para retirar en tienda" (enlace) | [NV] | Sí, "Pickup" en envío | [NV] | Sí (drive-thru), según `03-sitio-actual-sigo.md` |
| Franjas horarias | [NV]. Prometen entrega en menos de 2 h y "12 horas hábiles" tras confirmar el pago | [NV] | Corte "mismo día antes de las 8:00 pm" (según `02`) | [NV] | ETA por producto: "35 mins" | Solo aviso: "pedido procesado de lunes a domingo desde las 7:00 am hasta el cierre" | "2 hr" en el perfil | Express, Especial y Programado en texto de ayuda |
| Costo de envío visible | "Pendiente" en carrito | [NV] | Banner "Condiciones Delivery Gratis" | [NV] | [NV] | $3,50 fijo, más cargo si pasa 22 kg | [NV] | "Calculado durante el checkout" |
| Medios de pago | Tarjetas, transferencias (4 bancos), Multipagos Banesco, Todoticket, Zelle, Pipol Pay, Zinli, Mony, Pago Móvil, PayPal, Banplus; solicitud de clave C2P | [NV] | [NV] | Banner de Bancamiga | Visa, MasterCard, Amex, Diners, punto de venta, contra entrega | Pago Móvil, Zelle, Pipol Pay, Venmo, Medopay, Mony, WallyMóvil, efectivo (solo retiro en Chacaito) | [NV] | Zelle, PayPal, transferencia, efectivo, Mercantil, Sigo Créditos |
| Cashea como método en la tienda | No vi | No vi | No vi | No vi | No vi | No vi | No vi | No |
| Doble moneda y tasa en el pago | Ref./Bs. + IGTF | [NV] | Selector de divisa | Selector | Solo Bs | **Elige "Dólar / Bolívar Venezolano" antes de pagar** | [NV] | Selector sin tasa |

### 2.3 Diferenciales y rendimiento

| Función | Gama | Río | Kromi | Traki | Farmatodo | C. Madeirense | Forum (Zupper) | SIGO hoy |
|---|---|---|---|---|---|---|---|---|
| Listas de compra, favoritos | Carritos guardados | Corazón en tarjeta y PDP | Favoritos (pestaña) | Favoritos y Giftcard | Corazón en la tarjeta | No | No | Lista de deseos y comparar |
| Recompra, historial | [NV] | [NV] | [NV] | [NV] | [NV] | [NV] | Pestaña "historial" | No |
| Recetas | Blog institucional | No | No | No | No | Sección editorial separada | No | Blog |
| WhatsApp | No vi en tienda | No vi | **Botón flotante** | **Botón flotante** | Soporte flotante | **Botón flotante y chat "Habla con nosotros"** | No | Enlace "¡Contáctanos!" |
| Lealtad | **Gama Club** (Supermillas) | No vi | No vi | Giftcard | Cupón de primera compra | Boletín | No | Sigo Créditos (monedero) |
| Sustitutos y agotados | [NV] | "Últimas unidades" | [NV] | [NV] | **"Avísame" + "Ver productos similares"** | [NV] | "AGOTADO" en el listado | "PRÓXIMAMENTE" sin explicación |
| Seguimiento | [NV] | [NV] | [NV] | [NV] | Notificaciones (campana) | [NV] | Historial | [NV] |
| App | [NV] | [NV] | **Android en Google Play** | No | [NV] | No | App Zupper | No |
| Peso móvil (headless) | 4,1 MB, 91 req, ~10 s | 2,8 MB, 247 req, ~8,6 s | 3,7 MB, 91 req, home ~19 s, PLP ~11 s | 0,4 MB, 99 req, ~5,6 s | 3,3 MB, 231 req, ~8,4 s | 4,2 MB, 130 req, ~10-12 s | **9,4 MB**, 121 req, ~9,7 s | Tienda ~3,0 MB, 97 req, ~2,1 s (carga inicial) |
| Desborde horizontal a 390 px | No | No | No | No | No | No | No | No |

---

## 3. Fichas por competidor

### 3.1 Gama en Línea (Excelsior Gama)

**Capturas:** `gama-home-escritorio.jpg`, `gama-home-movil.jpg`, `gama-megamenu-escritorio.jpg`, `gama-modificar-sucursal-municipio-urbanizacion.jpg`, `gama-plp-escritorio-filtros.jpg`, `gama-plp-movil-grilla2col.jpg`, `gama-buscador-autocompletado.jpg`, `gama-stepper-tras-agregar-movil.jpg`, `gama-pdp-movil.jpg`, `gama-carrito-minimo-compra-movil.jpg`.

1. **Home.**
   - **Cabecera:** barra roja con "BCV | Ref. 1 = Bs. 875,65" y selector Ref./Bs. Debajo van logo, buscador grande con botón "Buscar" (en móvil, icono), sucursal activa ("Entregado desde Gama Plus Santa Eduvigis" con "Modificar"), login y carrito.
   - **Contenido:** un hero único de marca propia ("Tus nuevos favoritos para todos los días son marca Gama", CTA "Descúbrelos aquí"), carruseles de producto, "Categorías populares", un bloque de Gama Club ("Acumula Supermillas", "Crea una cuenta"), un bloque de salud y ayuda ("Llama a Servigama (0800) 737 8442").
   - **Texto SEO final:** enumera medios de pago y promete "entrega express en menos de 2 horas".
   - **Personalización:** no hay "recomendados para ti" ni historial a la vista (sin sesión).
2. **Navegación y búsqueda.**
   - **Menú:** 9 departamentos (Despensa, Alimentos frescos, Congelados y refrigerados, Licores, Bebidas, Cuidado personal y salud, Limpieza, Mascotas, Hogar). Al abrir "Despensa", un mega-menú en 4 columnas muestra ~20 subcategorías con "Ver todo X" en rojo. Son 2 niveles visibles y un tercero al entrar.
   - **Buscador:** autocompletado con 1 sugerencia de texto y 5 productos con foto, nombre y precio. Con "hrina pan" ignoró "hrina" y mostró panes (tolerancia parcial). Sin voz.
3. **PLP.**
   - **Estructura:** migas, título, chips de subcategorías, sidebar con Promociones ("¡SUPER DESCUENTO! (2)"), Precio (duplicado, defecto visible), Marca y Categorías. Orden "Comprar por: Relevancia", "Artículos por página: 12", paginación numerada. En móvil, botón "Filtrar por" y grilla de 2 columnas.
   - **Tarjeta:** categoría, nombre en mayúsculas, "Ref.x", "IVA Ref.x", "Total Ref.x", botón "Añadir al carrito". Al pulsarlo se convierte en stepper -/+ en el mismo lugar. No muestra precio por kg.
4. **PDP.** Foto con "Expandir imagen", categoría, nombre, ID, marca, precio con desglose de IVA, selector de cantidad, "En stock", productos relacionados, detalles, reseñas.
5. **Carrito y checkout.**
   - **Mínimo de compra:** aviso en la parte superior: "Para procesar su compra, debe agregar al menos Ref. 13,00 más a su pedido" (con Ref. 2,00 en el carrito, el mínimo es Ref. 15).
   - **Carritos:** "Guardar carrito" y "Ver carritos guardados". Hay campo de cupón.
   - **Resumen:** subtotal, IVA, **IGTF "Pendiente"**, **gastos de envío "Pendiente"** y total.
   - **Botón:** "Procesar compra" queda fijo abajo en móvil.
   - **Sucursal:** al tocar "Modificar" se pide municipio (Baruta, Chacao, El Hatillo, Libertador, Sucre) y urbanización, y de ahí sale la sucursal.
   - **Acceso:** el login por correo y contraseña es obligatorio para procesar (hay "Regístrate").
   - **Pago (según FAQ, no lo recorrí):** se paga una vez ingresada la dirección, con temporizador en pantalla. Tarjeta, Pago Móvil y Todoticket confirman al instante. Transferencias, Zelle, Zinli, Mony y similares tardan hasta 24 h de validación, y luego corren "12 horas hábiles para la entrega". El pedido no se cancela tras el pago. Hay flujo para factura con crédito fiscal y para contribuyente especial. Footer: "Solicitud de clave pago móvil C2P".
6. **Diferenciales.** Gama Club (puntos), carritos guardados, FAQ de pagos muy completa, atención 0800 de 8:00 a 17:00, buscador de tiendas. Recompra, listas, recetas y seguimiento no los vi **[NV]**.
7. **Rendimiento y móvil.** 4,1 MB, 91 peticiones, contenido en ~10 s en headless. Sin desborde. El `<title>` de PLP es bueno ("Harinas y pastas | Supermercado Gama en Línea"). Fallos: el filtro de precio aparece repetido y el HTML inicial está casi vacío (SPA, impacto SEO).

**Lo que aporta a SIGO:** el flujo "municipio → urbanización → sucursal" es casi idéntico al que SIGO necesita para los municipios de Margarita.

### 3.2 Río Supermarket

**Capturas:** `rio-home-escritorio-tasa-bcv.jpg`, `rio-home-movil.jpg`, `rio-modal-metodo-entrega.jpg`, `rio-direccion-entrega-movil.jpg`, `rio-plp-movil-ahorro-badges.jpg`, `rio-filtros-movil.jpg`, `rio-pdp-movil-barra-fija.jpg`.

1. **Home.**
   - **Cabecera:** barra verde con logo, botón "Categorías", buscador ("Buscar en Río Supermarket Lomas del Sol"), "Mi cuenta" y "Carrito". Debajo, barra lima con "Cómo te gustaría recibir tu pedido", "¿Necesitas ayuda?" y la tasa "1 USD = 875.651 VES".
   - **Banners:** 5 slides rotativos de **marcas aliadas** (Plumrose, Capri, Nutribela, PAN, Natulac, Kotex). Es publicidad pagada de proveedores dentro de la home.
   - **Contenido:** "Categorías populares" en círculos con foto de producto (Carnes y Refrigerados, Cesta Básica, Cuidado Personal, Frulever, Hogar, Licores, Dulces y Snacks, Súper Ofertas) y carruseles "Súper Ofertas" y "Cesta Básica" con "Ver más >". Alto de home ~5.200 px en móvil.
   - **Aviso:** un tooltip negro persistente sobre el banner dice "Elige tu ubicación y podrás ver el catálogo de tu tienda más cercana". En móvil tapa el hero.
2. **Navegación y búsqueda.** Búsqueda por URL (`/search?name=`). "harina" devuelve 162 resultados y **"hrina" devuelve exactamente los mismos 162**: tolerancia real a errores. Hay un menú de categorías tipo cuadrícula en el botón "Categorías" (no logré abrirlo en headless **[NV]**). Panel de filtros móvil con Precio, Características similares, Categorías, Promociones (casilla) y Marca, y botones Limpiar y Aplicar.
3. **PLP.** Tarjeta con foto, corazón de favoritos, icono de llama o % si hay oferta, precio verde "REF 2,09", precio tachado "(REF 2,48)", pill roja **"Ahorro REF 0,39"**, nombre, línea de unidad ("1 un (un a REF 2,09)" o "0.5 kg (kg a REF 1,35)" para pesables), badge "Últimas unidades" y botón verde "Agregar" con icono de carrito. Los pesables arrancan en 0,5 kg.
4. **PDP.** URL con código de barras (`/p/harina-de-maiz-pan-2-kg-7591002200268`), migas, marca enlazada, foto con zoom, corazón, descripción, especificaciones y relacionados con "Agregar". **Barra inferior fija** con precio, precio anterior, pill de ahorro y botón "Agregar".
5. **Entrega y carrito.** Al pulsar "Agregar" por primera vez aparece el modal **"Elige un método de entrega"** (A domicilio / En tienda). Si eliges domicilio: "Usar mi ubicación actual", buscador de dirección o "Ingrésala manualmente". Si eliges tienda: Estado y Ciudad, y luego la lista de tiendas. Mínimo, franjas, pagos y checkout **[NV]**.
6. **Diferenciales.** Retail media (banners de marca), favoritos, tasa en cabecera, motor Instaleap (peticiones a `nextgentheadless.instaleap.io`). El tipo de cambio sale de `/api/exchange/rate`. WhatsApp, lealtad y recetas: no vi.
7. **Rendimiento.** 247 peticiones, 2,8 MB, ~8,6 s en headless. Sin desborde. Defecto: el tooltip permanente y el hecho de que el primer "Agregar" abre un modal en lugar de agregar.

### 3.3 Kromi Online (Valencia)

**Capturas:** `kromi-home-escritorio.jpg`, `kromi-home-movil-tabbar.jpg`, `kromi-plp-movil-lista.jpg`, `kromi-carrito-movil.jpg`.

1. **Home.** Cabecera azul con buscador (en móvil, pestaña "Buscar"), ubicación, favoritos y carrito. Barra con "Categorías" y selector **"Divisa Vta BCV"**. Banner con vigencia explícita: *"Válido desde el viernes 09 al lunes 12 de octubre 2026. Cantidades limitadas"*. Banner "¡YA TENEMOS APP! Descárgala en Google Play". Cuatro accesos rápidos: **Zonas de envío, Tu opinión importa, Horarios, Condiciones Delivery Gratis**. La home no muestra productos. WhatsApp flotante. En móvil hay **barra inferior** (Inicio, Dólar, Buscar, Favoritos, Usuario).
2. **Navegación.** 19 departamentos en pestañas horizontales en MAYÚSCULAS (VIVERES, CARNICERIA, LICORES, REFRIGERADOS Y CONGELADOS...) con códigos internos (`cat=VIV.ARZ`). Se despliegan por subcategoría.
3. **PLP móvil.** Lista de una columna: foto a la izquierda, nombre truncado, **"Exento de IVA"** o "$12.59 + IVA / $14.60", precio USD grande y botón azul "Agregar". Badges **"COMPRA AL MAYOR"** y "Descuento a partir de 24 UND". Filtro: un `<select>` con 4 órdenes (precio y nombre).
4. **Carrito.** Foto, "Precio / +IVA / Total", stepper, papelera, resumen (items, subtotal, IVA, total) y "Procesar compra" / "Seguir comprando". Al pulsar "Procesar compra": **"Inicie sesión para procesar su compra"**.
5. **Rendimiento.** Mide 3,7 MB; la home tarda ~19 s y la PLP ~11 s en mostrar productos tras un **esqueleto gris**. Es el sitio más lento del estudio.

**Lo que aporta a SIGO:** vigencia visible en cada banner, 4 accesos rápidos a la información logística, barra inferior en móvil, etiqueta "Exento de IVA" y precios por volumen.

### 3.4 Traki

**Capturas:** `traki-home-movil.jpg`. Es una tienda por departamentos (no un súper) que comparte plataforma con Kromi; Río opera un súper dentro de Traki Margarita según `02`.

- **Home móvil:** selector "Ref / Dolar USD", cuatro accesos rápidos (Nuestras tiendas, Horarios para retirar en tienda, Políticas de envío, Preguntas frecuentes), tarjetas con estrellas, "IVA INCLUIDO", "Agregar", barra inferior (Inicio, Categorías, Carrito, Favoritos, Entrar) y WhatsApp. Giftcard.
- **Fallo clave:** `/envio`, `/horario` y `/faq` **cargan solo el footer, sin contenido**. Los accesos rápidos prometen información que la página no entrega.
- **Rendimiento:** muy ligera (0,4 MB, ~5,6 s).

### 3.5 Farmatodo

**Capturas:** `farmatodo-home-escritorio.jpg`, `farmatodo-home-movil.jpg`, `farmatodo-plp-movil-busqueda.jpg`.

1. **Home.** Selector de país, buscador con selector de categoría, "Inicia sesión", ciudad ("Caracas"), campana de notificaciones y carrito. Menú azul con 6 departamentos y **"Ingresar cupón"**. Hero con **"Promoción autorizada por la SUNDDE, válida del 05 al 11 de octubre de 2026"**. Carrusel "Las mejores ofertas para ti" con tarjetas "Hasta 20% / 15% / 25% dcto" por categoría, y un formulario de login (celular +58) incrustado en el hero. Banners de primera compra ("solo delivery"). En móvil: buscador sticky, categorías en círculos y **barra inferior** (Home, Categorías, Cupón, Soporte).
2. **Búsqueda y PLP.** **"hrina de maiz" devuelve harinas**. El panel de filtros muestra categoría, marca, subcategoría y rango de precio en Bs. La tarjeta de lista tiene corazón, nombre, precio en bolívares, **"Gramos a Bs ..."** (precio por unidad), marca, estrellas con número de reseñas, **"35 mins"** de entrega y un "+" azul que se vuelve contador. Para agotados: **"Avísame cuando esté disponible"** y **"Ver productos similares"**.
3. **Errores.** El precio por unidad está mal calculado: "Harina PAN 1 Kg, Bs.990,00, Gramos a Bs 990.00" (declara 990 Bs por gramo). Solo muestra bolívares, sin referencia en dólares.
4. **Pagos.** Footer: Visa, MasterCard, American Express, Diners Club, punto de venta, contra entrega. Pago Móvil y Zelle no aparecen **[NV en checkout]**.
5. **Rendimiento.** 231 peticiones, 3,3 MB, ~8,4 s. Soporte flotante.

### 3.6 Central Madeirense (Tu Central Online)

**Capturas:** `central-madeirense-selector-sede.jpg`, `central-madeirense-home-movil.jpg`, `central-madeirense-plp-movil-imagenes-rotas.jpg`, `central-madeirense-checkout-movil.jpg`.

1. **Modelo.** WooCommerce (desarrollado por Meraki Tech Group) con **un sitio por sede** (`/Chacaito-07/`). La entrada es una página de 18 sedes con botones de radio y "SELECCIONAR SEDE".
2. **Home de tienda.** Banner, carrusel **"PROMOCIONES"** con insignia "-18%" y **cuenta regresiva "LA OFERTA TERMINA EN: 10 DÍAS 10:11:36"**. Varias ofertas muestran el mismo reloj (parece genérico). Home móvil de ~6.900 px.
3. **PLP.** Interfaz en inglés: "FILTER", "Default sorting", "Sort by popularity", "ADD TO CART" (truncado como "ADD TO CAR"), "0 out of 5". El símbolo de moneda es **"#"** ("# 2,09"). **Varios productos no tienen foto (placeholder gris)**. Hay stepper en cada tarjeta, 20, 30 o 40 por página. Sin tasa ni precio por unidad.
4. **Carrito y checkout.**
   - **Carrito:** WooCommerce estándar ("Carrito de compra / Checkout / Order Complete", "APPLY COUPON", "UPDATE CART", "PROCEED TO CHECKOUT"), con mezcla de inglés y español.
   - **Moneda:** el checkout abre con **"Escoge tu moneda de pago: Dólar / Bolívar Venezolano"** y un aviso: *"su pedido será procesado de lunes a domingo a partir de las 7:00 am hasta el cierre de la sucursal seleccionada"*.
   - **Formulario:** un solo formulario largo: nombre, apellidos, país, ciudad, **urbanización/zona** (lista de cientos con prefijo de zona: "(Este) Chacao", "(Centro) La Candelaria"), dirección, teléfono, correo, **"Create account password"**, nacionalidad (Venezolano/Extranjero), cédula, notas.
   - **Envío:** "Delivery" a **$3,50** fijo (con cargo adicional si la compra pasa **22 kg**) o "Pickup".
   - **Pagos:** "Pago Electrónico" con Zelle, Pipol Pay, Venmo, Medopay, Mony y WallyMóvil (dos entradas), cada uno con un correo y la instrucción de "usar el número del pedido como referencia"; texto sobre **IGTF**, y "Puedes registrar tu pago AQUÍ". La página "Medios de pago" agrega Pago Móvil y efectivo ("válido para retiros en sede Chacaito").
   - **Zonas:** hay una página "Zonas de Delivery" con la lista completa.
5. **Diferenciales.** Chat "¿Necesitas ayuda? Habla con nosotros" más WhatsApp flotante, boletín, contenido editorial en el sitio institucional.
6. **Rendimiento.** 4,2 MB, 130 peticiones, 10 a 12 s en headless. reCAPTCHA visible.

**Lo que aporta a SIGO (en negativo):** la selección de moneda al inicio del checkout y la lista de zonas son útiles; la mezcla de idiomas, el "#" y las imágenes rotas son el modelo de lo que hay que evitar.

### 3.7 Forum SuperMayorista (vía Zupper by Ridery)

**Capturas:** `forum-zupper-escritorio.jpg`, `forum-zupper-movil.jpg`.

- Forum **no tiene tienda propia**: "Compra Online" lleva a Zupper (marketplace de Ridery, "Hecho con ❤️ en Cumaná"). Hay modal "Elige tu ciudad" (solo "caracas" disponible en el selector) y barra "Agrega una dirección".
- **Perfil de tienda:** logo, "2 hr", ★ 4,6, "Abierto", "Más información", **pasillos** en barra lateral (Víveres, Refrigerados y congelados, Fruver, Cuidado personal, Bebidas, Limpieza) y pestañas por pasillo con "Ver todos".
- **Tarjeta:** precio `5.79$`, precio anterior tachado, **chip de ahorro absoluto "-0.49$"**, y para pesables **"$5.29/kg"** y "Desde 300 Gr". Botón "+" circular.
- **Móvil:** barra inferior (casa, búsqueda, canasta, historial, perfil). Hay productos sin foto.
- **Rendimiento:** **9,4 MB**, 121 peticiones. El más pesado del estudio.
- Que Margarita figure o no entre las ciudades: **[NV]**.

### 3.8 Otros

- **Yummy** (yummy.com.ve): "SuperApp de Venezuela" con 4 M de usuarios, 35 ciudades, "+6.000 restaurantes y supermercados" y "seguimiento en tiempo real". Es una landing que lleva a la app. El catálogo de súper y su UX **[NV]**.
- **PedidosYa Market y Plaza's:** bloqueados por Cloudflare ("Just a moment..."). **[NV]**
- **GUUAO:** app web Flutter con pantalla de edad (+18); el catálogo **[NV]**.
- **Rattan Hyper (Margarita):** el sitio no abre por certificado inválido. **[NV]** Operan sobre todo en Instagram según `02`.
- **Unicasa:** sin tienda.

### 3.9 SIGO hoy (referencia)

**Capturas:** `sigo-home-escritorio-www.jpg`, `sigo-home-movil-www.jpg`, `sigo-tienda-costazul-home-movil.jpg`, `sigo-plp-movil.jpg`, `sigo-carrito-movil.jpg`.

1. **Arquitectura.** Dos niveles.
   - `www.sigo.com.ve` es un catálogo sin carrito en la cabecera (en móvil, solo logo y cuenta) y sin buscador visible. Muestra "PRÓXIMAMENTE" en muchos productos.
   - Cada sucursal es un **subdominio con su propia tienda y carrito** (`costazul.sigo.com.ve`, `sambil.sigo.com.ve`). El cliente llega a ellas tocando dos banners de imagen ("¡Hola! Estás entrando a Sigo Supermarket Costazul/Sambil con servicio de delivery").
2. **Home de tienda.** Banner "Bienvenidos" con iconos de métodos de pago, 7 categorías con iconos, bloque "TU DOSIS DE FELICIDAD" con un desplegable rotulado **"Custom List"** (texto sin traducir), "¡SIEMPRE FRESCO!", blog. Sin ofertas con vigencia ni tasa BCV.
3. **Menú.** Mega-menú de **139 categorías**, y el HTML móvil incluye todo el árbol en la página. Errores de enlace observados: "Varias" bajo Harinas enlaza a `/brochas-y-pinceles`; "Frutas y Vegetales" bajo Enlatados enlaza a `/encurtidos`; "Mariscos y Pescados" enlaza a `/enlatados`; "Frutas y Vegetales" aparece dos veces.
4. **Búsqueda.** Caja con "Buscar en tienda". "harina" funciona; **"hrina" devuelve "No se encontraron productos que coincidan con sus criterios"**. Sin sugerencias de producto observadas **[parcial: probé la caja en móvil sin ver panel]**.
5. **PLP.** Botón verde "FILTROS", dos `<select>` (Posición, 20 por página), tarjetas de 2 columnas con foto, nombre, estrellas vacías (0 reseñas), precio USD, stepper y botón **"AÑADIR AL CARRI…" truncado**. Sin precio por unidad, sin badges de oferta. Hay un precio anómalo: "Harina de Trigo Todo Uso Mary 900 gr, $23.69" en el catálogo `www` (otras tiendas la tienen a ~Ref. 1,07).
6. **Carrito.** Barra de 5 pasos (Carro, Envío, Pago, Confirmar, Completa), botones "Actualizar carrito", "Vaciar carrito", "Continuar comprando", paneles "Códigos de descuento y cupones" y "Estimación del envío", casilla de términos. Envío "calculado durante el checkout". No se muestra mínimo de compra.
7. **Rendimiento.** La tienda carga en ~2,1 s (carga inicial) con 97 peticiones y ~3,0 MB. Es de las más rápidas del estudio, pero sin contenido de producto en la primera pantalla.

---

## 4. Patrones comunes en el e-commerce venezolano

1. **"Ref." más tasa BCV visible.** Gama (barra superior), Río (barra de entrega), Kromi (selector "Divisa Vta BCV") y Traki ("Ref / Dolar USD") lo usan. La excepción es Farmatodo, que solo muestra bolívares.
2. **IVA tratado de forma explícita.** Gama separa Ref + IVA + Total; Kromi rotula "Exento de IVA" o "+ IVA"; Traki "IVA INCLUIDO". El IGTF aparece en carrito (Gama) o en el checkout (Central Madeirense).
3. **Entrega según ubicación.** El catálogo y el inventario cambian con la sucursal, por eso todos piden municipio, urbanización, ciudad o sede al inicio.
4. **Medios de pago locales manuales.** Zelle, Pipol Pay, Zinli, Mony, Venmo, Medopay, WallyMóvil y Pago Móvil con "paga y luego reporta". Ventana de validación de hasta 24 h (Gama).
5. **Registro obligatorio.** Gama, Kromi y Farmatodo exigen cuenta antes de pagar; Central Madeirense la crea dentro del formulario de pago. No vi compra como invitado en ninguna tienda.
6. **Pestaña inferior en móvil.** Kromi, Traki, Farmatodo y Zupper usan barra inferior; Gama y Río usan hamburguesa y cabecera.
7. **WhatsApp flotante.** Kromi, Traki, Central Madeirense y Farmatodo (soporte).
8. **Ofertas con vigencia.** Kromi ("Válido desde el viernes 09 al lunes 12 de octubre"), Farmatodo ("autorizada por la SUNDDE, válida del 05 al 11") y Central Madeirense (cuenta regresiva).
9. **Retail media.** Río llena el hero con marcas aliadas.
10. **Casi nadie ofrece:** búsqueda por voz, recetas dentro de la tienda, listas de compra, recompra, sustitutos elegidos por el cliente, ni seguimiento visible del pedido **[NV tras login]**.

---

## 5. Brechas de SIGO frente al estándar

| # | Brecha de SIGO | Quién lo hace bien | Impacto |
|---|---|---|---|
| 1 | El buscador no tolera errores ("hrina" no devuelve nada) | Río, Farmatodo | Alto: la búsqueda es el camino principal en súper |
| 2 | Dos tiendas con subdominios y carritos separados; elección por banners de imagen | Gama (una tienda; sucursal asignada por municipio y urbanización), Río (modal de método de entrega) | Alto: el cliente puede perder el carrito al cambiar de tienda |
| 3 | Sin tasa BCV ni fecha de actualización; selector "US Dólar" sin referencia | Gama, Río, Kromi | Alto: genera desconfianza y llamadas |
| 4 | Sin badges de oferta, precio tachado ni "Ahorro" | Río, Zupper, Central Madeirense | Alto: es lo que convierte en una oferta |
| 5 | Sin precio por unidad o kg | Río, Zupper, Farmatodo (con error) | Medio |
| 6 | Árbol de categorías con 139 entradas y enlaces cruzados | Gama (9 departamentos, 2 niveles) | Alto: el cliente no encuentra lo que busca |
| 7 | Sin mínimo de compra ni costo de envío visibles antes del checkout | Gama (mínimo y envío "pendiente"), Central Madeirense ($3,50 en envío) | Alto: sorpresas al final del flujo |
| 8 | Sin IGTF explícito en carrito | Gama | Medio |
| 9 | Botones truncados ("AÑADIR AL CARRI…"), etiqueta "Custom List" sin traducir, estrellas vacías | Gama, Río | Medio: aspecto de producto sin terminar |
| 10 | "PRÓXIMAMENTE" sin explicación; precio anómalo de $23,69 en un producto de ~$1 | Farmatodo ("Avísame", "Ver similares") | Medio |
| 11 | WhatsApp solo como enlace de menú | Kromi, Traki (flotante) | Medio |
| 12 | Sin favoritos reutilizables, listas de compra ni recompra | Gama (carritos guardados), Farmatodo (corazón) | Oportunidad de diferenciación |
| 13 | HTML móvil con el árbol completo de categorías | Gama (menú lateral de 9) | Medio: peso y accesibilidad |

---

## 6. Buenas prácticas a copiar

1. **Gama:** barra superior con tasa BCV y selector Ref./Bs. Desglose Ref + IVA + Total en cada tarjeta. Mega-menú de 9 departamentos con "Ver todo". Aviso de mínimo de compra con el monto faltante. "Guardar carrito". Selección de sucursal por municipio y urbanización. Buscador con producto, foto y precio. FAQ de pagos con tiempos de validación y flujo para factura fiscal.
2. **Río:** buscador tolerante a errores. Tarjeta con precio actual, precio anterior tachado y pill "Ahorro REF x". Línea de unidad con precio por unidad o kg y pesables en pasos de 0,5 kg. Barra de compra fija en la ficha. Modal "A domicilio / En tienda" con "Usar mi ubicación actual".
3. **Kromi:** vigencia explícita en banners y accesos rápidos a Zonas de envío, Horarios y Condiciones de delivery gratis. Barra inferior en móvil. Etiquetas "Exento de IVA" y "Compra al mayor" con descuento por volumen.
4. **Farmatodo:** ETA por producto ("35 mins"). "Avísame cuando esté disponible" y "Ver productos similares". Cupón de primera compra. Promociones con vigencia y autorización SUNDDE.
5. **Central Madeirense:** moneda elegida al inicio del checkout (Dólar / Bolívar), aviso de horario de proceso, página pública de zonas de delivery, límite de peso explícito (22 kg).
6. **Zupper:** chip de ahorro en monto, precio por kg en pesables, pasillos laterales, "historial" en la barra inferior.

---

## 7. Errores a evitar

1. **Central Madeirense:** símbolo "#" en lugar de "$", interfaz mezclada en inglés, productos sin foto, botón truncado, relojes de cuenta regresiva idénticos en todas las ofertas y formulario de pago con registro obligatorio y cientos de zonas en un desplegable.
2. **Farmatodo:** precio por unidad calculado mal ("Gramos a Bs 990.00" para 1 kg) y solo bolívares, sin referencia.
3. **Traki:** accesos rápidos (envío, horarios, FAQ) que llevan a páginas vacías.
4. **Kromi:** esqueleto gris por 11 s o más y home sin un solo producto.
5. **Zupper:** 9,4 MB por página y productos sin foto.
6. **Gama:** filtro de precio duplicado, "hrina" tratado como ruido, y registro obligatorio sin alternativa de invitado.
7. **Río:** tooltip permanente que tapa el hero en móvil y modal obligatorio en el primer "Agregar".
8. **SIGO hoy:** "Custom List", botones truncados, "PRÓXIMAMENTE" sin explicación, enlaces de categoría cruzados, precios anómalos y buscador sin tolerancia.
9. **En general:** pagos manuales sin explicar tiempos ni qué pasa si el pedido cambia mientras se valida el pago (Gama avisa que "no garantizaremos la disponibilidad del inventario, ni el precio").

---

## 8. Hallazgos que requieren confirmación **[NV]**

- Franjas horarias de entrega, tiempos de despacho y costo de envío real en Gama, Río, Kromi y Farmatodo: exigen cuenta y dirección. Recomiendo una compra de prueba con cuenta del equipo en Gama, Río y Farmatodo antes de cerrar el diseño del checkout.
- Compra como invitado en Río, Farmatodo y Zupper.
- Mínimo de compra en Río, Kromi y Farmatodo.
- Uso real de Cashea en el checkout de cualquier súper. Según `02`, Cashea lista a Gama y a Rattan, pero ninguna tienda lo muestra como método propio en lo que pude ver.
- Seguimiento del pedido, recompra y sustitutos tras el pago.
- Si Zupper o Yummy tienen supermercados de Margarita.
- Menú de categorías de Río en escritorio (el botón no abrió en headless).

---

## 9. Recomendaciones priorizadas para el e-commerce de SIGO

**Escala de prioridad.** P0 = hacerlo antes de lanzar el rediseño. P1 = en la primera iteración. P2 = diferenciales. Esfuerzo: S (días), M (1 a 2 semanas), L (más de 2 semanas).

### P0. Fundamentos de confianza y conversión

| # | Recomendación | Referencia | Esfuerzo |
|---|---|---|---|
| 1 | **Una sola tienda, un solo carrito.** Eliminar la elección por banners de imagen. Pedir primero "Delivery o retiro en tienda". Para delivery, elegir municipio y sector (Maneiro, Mariño, Arismendi, García, Gómez, Antolín del Valle, Díaz, Marcano, Tubores, Macanao) y asignar la sucursal; para retiro, elegir Costazul o Sambil. Guardar la elección y mostrarla en la cabecera como "Entregado desde: Sigo Costazul" con "Modificar". | Gama, Río | L |
| 2 | **Barra de tasa y moneda en cabecera.** "BCV: 1 USD = Bs. X (actualizado hoy HH:MM)" y un conmutador USD / Bs. con precio secundario en Bs. en la tarjeta y en el carrito. | Gama, Río, Kromi | M |
| 3 | **Buscador tolerante a errores con autocompletado** (sugerencias de texto, 5 productos con foto y precio, historial reciente). Aceptar "hrina", "mantekilla", "cafe" sin tilde. | Río, Farmatodo, Gama | M |
| 4 | **Tarjeta de producto completa.** Foto, nombre, precio USD, equivalente en Bs., precio por unidad o kg, badge de oferta con precio anterior tachado y "Ahorro $x", botón "Agregar" que se vuelve stepper -/+ en la misma tarjeta, y estado "Agotado" con "Avísame". Texto del botón sin truncar. | Río, Zupper, Farmatodo | M |
| 5 | **Carrito transparente.** Mínimo de compra con el monto faltante ("Te faltan $X para el mínimo"), costo de envío por municipio calculado desde la dirección elegida, IGTF desglosado según el medio de pago y cupón. | Gama, Central Madeirense | M |
| 6 | **Árbol de categorías reducido.** Mostrar 9 a 12 departamentos con un mega-menú de 2 niveles y "Ver todo" (los 139 nodos solo en el árbol interno). Corregir enlaces cruzados ("Varias", "Frutas y Vegetales" duplicadas, "Mariscos y Pescados"). En móvil, menú lateral con carga bajo demanda en lugar del árbol completo en el HTML. | Gama | M |
| 7 | **Limpiar el catálogo.** Auditar precios anómalos ($23,69 en harina de trigo) y reemplazar "PRÓXIMAMENTE" por "Sin stock hoy" con "Avísame". Quitar etiquetas sin traducir ("Custom List"), estrellas vacías y los productos sin foto. | Farmatodo | S |

### P1. Checkout local y móvil

| # | Recomendación | Referencia | Esfuerzo |
|---|---|---|---|
| 8 | **Checkout corto** de 3 pasos (Entrega, Pago, Confirmar), con teléfono y correo como identificación mínima. Ofrecer **compra como invitado** con opción de crear cuenta al final. | Mejor que Gama, Kromi y Central Madeirense | M |
| 9 | **Pagos locales explicados con tiempos.** Un selector con iconos: Pago Móvil (con C2P si el banco lo permite), Zelle, PayPal, transferencia, efectivo USD (en retiro o contra entrega), Sigo Créditos. En cada uno, el tiempo de confirmación y qué ocurre si cambia el precio. Evaluar **Cashea** y mostrar su insignia en la ficha y el carrito si se activa. | Gama (FAQ), Central Madeirense | L |
| 10 | **Ventanas de entrega visibles** antes de pagar: Express (2 a 4 h, municipios cercanos), Especial (salida única) y Programado (franjas). Mostrar cuándo es el corte para "entrega hoy" (Kromi: antes de las 8:00 pm). | Kromi, Gama, Farmatodo (ETA) | M |
| 11 | **Barra inferior en móvil** (Inicio, Categorías, Buscar, Carrito, Cuenta) y botón de compra fijo en PDP y carrito. | Kromi, Farmatodo, Río | S |
| 12 | **WhatsApp flotante unificado** con un solo número y mensaje precargado con el contexto (pedido o producto). Corregir los dos números actuales sin explicación. | Kromi, Traki, Central Madeirense | S |
| 13 | **Accesos rápidos de logística en la home** (Zonas y tarifas, Horarios, Retiro en tienda, Cómo pagar) con contenido real, nunca páginas vacías. | Kromi, Traki (en negativo) | S |

### P2. Diferenciales (donde nadie compite bien)

| # | Recomendación | Referencia | Esfuerzo |
|---|---|---|---|
| 14 | **"Comprar de nuevo"** y listas de compra con nombre ("Mercado semanal", "Casa de playa"), y carritos guardados. | Gama (carritos guardados), Zupper (historial) | M |
| 15 | **Ofertas con vigencia** ("Válido del X al Y") y encarte semanal en la home, con filtro "En oferta" en cada categoría. | Kromi, Farmatodo, Río | M |
| 16 | **Sustitutos a elección** durante el checkout ("si no hay, prefiero: [producto similar] / llamarme / quitarlo") y "Ver productos similares" en agotados. | Farmatodo (parcial) | M |
| 17 | **Seguimiento del pedido** por estados (recibido, validando pago, armando, en camino, entregado) y aviso por WhatsApp. | Yummy y Zupper en app **[NV]** | L |
| 18 | **Sigo Créditos visible** en el checkout como medio de pago y en la home ("Envía mercado a tu familia en Margarita"). Recargable desde el exterior con PayPal. | Propio de SIGO | M |
| 19 | **Recetas "compra los ingredientes"** (hallaca, pan de jamón, arepas) con un botón que agrega todos al carrito. | Central Madeirense (solo contenido) | L |
| 20 | **Programa de puntos** (tipo Gama Club) o descuentos por registro. | Gama | L |

### Rendimiento y calidad técnica (transversal)

- **Presupuesto de peso:** home móvil por debajo de 1,5 MB y menos de 60 peticiones. Referencia: Traki 0,4 MB; Zupper 9,4 MB es el contraejemplo.
- Imágenes en WebP con `srcset`, carga diferida bajo el primer pliegue y esqueleto con tiempo máximo (Kromi tarda 11 s o más).
- Evitar páginas con el árbol completo de categorías en el HTML.
- Interfaz 100% en español, símbolo "$" y "Bs." correctos, y sin textos truncados en botones.
- Mantener sin desborde horizontal a 390 px (todos los competidores lo logran).

### Métricas a seguir tras el rediseño

Tasa de agregar al carrito desde búsqueda, búsquedas sin resultados (objetivo cercano a 0), abandono por paso del checkout, porcentaje de pedidos con pago confirmado en menos de 15 minutos, y uso del conmutador USD/Bs.

---

## 10. Anexo: índice de capturas

Carpeta: `docs/investigacion/capturas-ecommerce/`. Los archivos con prefijo `int-` pertenecen a otra investigación.

- **Gama:** `gama-home-escritorio`, `gama-home-movil`, `gama-megamenu-escritorio`, `gama-modificar-sucursal-municipio-urbanizacion`, `gama-plp-escritorio-filtros`, `gama-plp-movil-grilla2col`, `gama-buscador-autocompletado`, `gama-stepper-tras-agregar-movil`, `gama-pdp-movil`, `gama-carrito-minimo-compra-movil`.
- **Río:** `rio-home-escritorio-tasa-bcv`, `rio-home-movil`, `rio-modal-metodo-entrega`, `rio-direccion-entrega-movil`, `rio-plp-movil-ahorro-badges`, `rio-filtros-movil`, `rio-pdp-movil-barra-fija`.
- **Kromi:** `kromi-home-escritorio`, `kromi-home-movil-tabbar`, `kromi-plp-movil-lista`, `kromi-carrito-movil`.
- **Traki:** `traki-home-movil`.
- **Farmatodo:** `farmatodo-home-escritorio`, `farmatodo-home-movil`, `farmatodo-plp-movil-busqueda`.
- **Central Madeirense:** `central-madeirense-selector-sede`, `central-madeirense-home-movil`, `central-madeirense-plp-movil-imagenes-rotas`, `central-madeirense-checkout-movil`.
- **Forum (Zupper):** `forum-zupper-escritorio`, `forum-zupper-movil`.
- **SIGO hoy:** `sigo-home-escritorio-www`, `sigo-home-movil-www`, `sigo-tienda-costazul-home-movil`, `sigo-plp-movil`, `sigo-carrito-movil`.
