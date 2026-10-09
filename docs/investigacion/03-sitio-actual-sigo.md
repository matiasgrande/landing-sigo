# Auditoría del sitio actual de SIGO (Isla de Margarita)

Fecha de revisión: 2026-10-08. Método: curl + Chromium headless (capturas desktop 1366 px y móvil 390 px) y WebSearch. Revisión hecha por un analista, sin acceso a analítica interna de SIGO.

## 1. URLs encontradas y alcance de la revisión

| URL | Estado | Qué es |
|---|---|---|
| https://sigo.com.ve/ (y www.) | Carga OK (HTTP 200, HTTP redirige 301 a HTTPS) | Tienda online (e-commerce) de Sigo. Es el único sitio web "oficial" que se pudo verificar. Su `<title>` es "SuperMarket Sigo Costazul" |
| https://costazul.sigo.com.ve/ | 200 | Subdominio de la misma tienda (las imágenes del home se sirven desde aquí) |
| https://sambil.sigo.com.ve/ | 200 | Subdominio para la sucursal Sambil, `<title>` "Sigo Supermarket Sambil" (no se auditó a fondo) |
| sigonline.com | NO accesible: error de certificado TLS (el certificado no coincide con el dominio) | No se confirmó que sea de SIGO |
| gruposigo.com | NO accesible: error TLS interno | No se confirmó |
| sigosa.com | Conexión reseteada por el servidor, no accesible | Es el dominio de correo corporativo (ver contacto), pero no se pudo cargar |
| Instagram `instagram.com/sigosa/` | NO accesible (HTTP 429, bloqueo) | Enlace tomado del footer del sitio |
| Facebook `facebook.com/SigoVenezuela/` | Respondió HTTP 200 pero con cuerpo vacío (login wall) | Enlace tomado del footer; no se pudo leer contenido |
| TikTok | No hay enlace en el sitio; WebSearch no encontró nada | [no verificado] si existe cuenta |
| WhatsApp | Solo se verificaron los números publicados en el sitio (ver sección 5) | Chat no abierto |

Conclusión clave: **no existe un sitio institucional/landing; el dominio principal es directamente la tienda e-commerce** (plataforma nopCommerce). WebSearch (2 consultas) no devolvió ningún resultado sobre SIGO, así que ninguna información proviene de prensa o terceros. Todo lo "verificado" abajo viene del propio sitio sigo.com.ve y es declaración de la empresa, no confirmación independiente. No pude ver el contenido de redes sociales; el análisis de lo que comunican en redes queda pendiente (recomendación: revisión manual del equipo).

## 2. Inventario de secciones y contenido

**Estructura de navegación (header):**
- Barra superior gris oscura con selector de moneda "US Dolar / Bolívares".
- Logo (arriba izquierda), buscador "Buscar en tienda", Mi cuenta, Comparar productos, Lista de deseos, Carrito ($0.00).
- Menú principal: botón "TODAS LAS CATEGORÍAS" (mega menú con unas 30 categorías: víveres, congelados, frutas y vegetales, carnicería, charcutería, licores, panadería, cuidado personal, cosméticos, flores, limpieza, chucherías, bebidas, hogar, electrónicos, mascotas, bebés, saludable, automotriz, farmacia con muchas subcategorías, cigarros), "PÁGINA DE INICIO", "SUCURSALES" (submenú: Supermarket Sambil, Supermarket Costazul), "¡CONTÁCTANOS!" con icono de WhatsApp.

**Home (en orden):**
1. Hero: slider de banners. En la revisión mostraba una publicidad de marca de terceros ("LLEVA TU P.A.N. DE 1KG", Harina P.A.N.), es decir, el hero comunica una marca proveedora y no a SIGO.
2. Fila de 7 categorías con íconos circulares de colores: Víveres, Frutas y Vegetales, Carnicería, Charcutería, Licores, Chucherías, Farmacia.
3. Bloque "TU DOSIS DE FELICIDAD" (lista de productos cargada por AJAX; en la captura apareció vacío/"Loading").
4. Bloque "¡SIEMPRE FRESCO!" (frutas, también cargado dinámicamente).
5. Sección "En bienestar" / Blog con 3 entradas recientes.
6. Carrusel de logos de proveedores/marcas aliadas: Coca-Cola FEMSA de Venezuela, Alimentos Mary, Natulac, Ronco Pastas, Alfonzo Rivas y Cía, La Lucha, Alimentos Polar Comercial.
7. Footer: suscripción "Entérate de nuestras promociones", Servicios (Métodos de entrega, Recargas Sigo Club, Sucursales, Términos), Preguntas frecuentes (¿Cómo registrarme? ¿Cómo comprar? ¿Cómo pagar? Productos, Sigo Créditos), Sobre nosotros (Conócenos, Política de privacidad, ¡Únete!), redes (solo Facebook e Instagram), copyright 2026.

**Páginas internas revisadas:**
- `/conocenos`: historia, legado y conteo de negocios (ver sección 5).
- `/sucursales-2`: lista de sucursales por formato (solo texto, con una imagen "visítanos"; **sin mapa, sin horarios, sin teléfonos por sucursal**).
- `/como-comprar`: pasos de compra, retiro en tienda, delivery, tarifas por municipio.
- `/pagos`: formas de pago y validación.
- `/sigo-creditos`: Recargas Sigo Club.
- `/unete`: empleo (llama a un Google Form).
- `/blog` y entradas: noticias/eventos (carrera 15K/10K/5K, carrera infantil, promo "Aventura Sigo en Margarita").
- `/contactus`: solo muestra un correo (compraonline@sigosa.com); sin formulario visible en el texto extraído.

**Promociones:** no hay sección de ofertas/folleto semanal en la navegación. Las promos viven en el blog y en banners del slider. Promo vigente documentada: "Aventura Sigo en Margarita" (7 semanas; compra mínima de $40 con 4 productos de marcas patrocinantes; premios de paseos para dos personas; entrada del blog del 11 ago 2026). Estado actual de la promo (oct 2026) [no verificado].

## 3. Hallazgos técnicos

| Aspecto | Hallazgo |
|---|---|
| CMS/plataforma | nopCommerce (meta generator) con tema comercial "Emporium" y plugins Nop-Templates/SevenSpikes (mega menú, sliders, ajax cart, instant search). jQuery 3.3.1 + jQuery Migrate, Kendo UI 2014, jQuery UI 1.12, Bootstrap, Nivo slider. Stack antiguo |
| HTTPS | Sí, con redirección 301 desde HTTP. Dominios alternos (sigonline.com, gruposigo.com) con fallas TLS |
| Rendimiento | HTML de ~180 KB (sin comprimir según curl), TTFB ~0.7 s, descarga ~0.8-1.0 s desde esta red. Carga más de 40 scripts (muchos jQuery/Kendo/plugins) y un CSS bundle de ~300 KB. Mediciones aproximadas, sin Lighthouse. Los bloques de productos del home cargan por AJAX y aparecían vacíos en la captura |
| Responsive | Sí, adapta a móvil (menú hamburguesa, categorías en rejilla de 2 columnas). Defectos: `viewport` con `maximum-scale=1, user-scalable=0` (impide hacer zoom, mala práctica de accesibilidad); el banner hero se corta en móvil (texto del banner recortado); mucho espacio vacío bajo la rejilla de categorías |
| SEO | `<title>` genérico y atado a una sucursal ("SuperMarket Sigo Costazul") en todo el sitio, incluida la página institucional. `meta description` presente y buena en el home: "Sirviendo con amor desde 1972. Haz tus compras online y recíbelas en la puerta de tu casa. Ingresa YA y encuentra ¡TODO PARA TU FAMILIA!". Keywords: "Margarita, Sigo, Online, Tienda, Delivery, Pick up". **Sin Open Graph, sin Twitter Cards, sin schema.org/JSON-LD, sin canonical, sin hreflang**. robots.txt estándar de nopCommerce; `/sitemap.xml` responde con redirección 302 (no verificada su validez) |
| Idioma | `<html lang="es">` correcto (hay una referencia secundaria "ES-MX" en un script, irrelevante). Contenido en español; sin versión en inglés pese a que dice atender compras desde el exterior |
| Accesibilidad | Pocos atributos aria (5 `aria-label` en el HTML del home). Imágenes con alts genéricos ("banner", "Imagen para la categoría X", logo "SuperMarket Sigo Costazul"). Bloqueo de zoom. Contraste: texto gris (#8c8c8c es el color más usado en CSS) sobre blanco es bajo. Páginas de texto largas (¿Cómo comprar?, Pagos) sin jerarquía clara |
| Analítica / tracking | Píxel de Facebook/Meta detectado (ID 1769980523222843). No se detectó Google Analytics/GTM en el HTML inicial (podría cargarse tras consentimiento; no confirmado) |
| Contenido en la página | Errores de redacción: "Wahtsapp", "Arismendi $3.5G", "deWahtsapp", etc. en `/como-comprar`; horarios incoherentes del Delivery Express ("9:00pm a 8:00pm" en un punto y "9:00 a.m. a 8:00 p.m." en otro) |
| Marca/dominio | Mezcla de subdominios (sigo, costazul, sambil) y nombres ("Sigo", "Sigo Supermarket", "SuperMarket Sigo Costazul", "SIGOSA" en correos e Instagram) |

## 4. Identidad de marca observada

- **Logo:** wordmark minúsculo "sigo" en azul marino con trazo redondeado y una hoja verde sobre la "i" (guiño a lo fresco/natural). Se ve pequeño en el header (aprox. 50 px de alto en desktop). No se descargó el archivo para extraer colores exactos; los hex siguientes son de CSS del tema y observación visual, por lo que son **aproximados**.
- **Colores (aprox.):** azul marino del logo (~#004074 es el azul más repetido en el CSS; el azul del botón de búsqueda y del logo se ven en esa familia), verde hoja/frescura (~#97c300 aparece 138 veces en el CSS, pero es el acento por defecto del tema Emporium, así que no hay certeza de que sea el verde oficial de marca; #008639 también aparece), amarillo/dorado (#eebe00 / #e8af00 en hovers). Íconos de categorías en una paleta multicolor saturada: naranja (víveres), verde lima (frutas y verduras), rojo/carmesí (carnicería), rosa (charcutería), negro (licores), rojo (chucherías), azul (farmacia). Fondo blanco/gris claro (#f6f6f6, #eee). [no verificado] que exista manual de marca.
- **Tipografías:** Roboto como fuente base (declarada en CSS) más fuente de íconos "emporium-icons". Es la tipografía por defecto del tema, no una elección de marca.
- **Tono de voz:** cálido, familiar y local. Frases textuales del sitio: "Sirviendo con amor desde 1972", "¡TODO PARA TU FAMILIA!", "creando posibilidades", "Pensando en ti, seguimos creciendo", "Tu dosis de felicidad", "¡Siempre fresco!", "¡Gracias por estar!". Mezcla trato de tú, exclamaciones y lenguaje comercial; en las páginas de políticas el tono pasa a formal/legal y largo.
- **Eslogan:** no hay un eslogan único visible. Se repiten "Sirviendo con amor desde 1972" (meta description) y "creando posibilidades" (institucional).
- **Imagen:** el hero actual usa creatividades de marcas proveedoras; fotografía propia de tiendas, equipo o isla prácticamente inexistente en el home.

## 5. Datos de negocio

Todo lo marcado como verificado proviene del propio sitio de SIGO (declaración corporativa), no de fuente independiente.

**Historia y cifras**
- Fundación en 1972 por José Martínez Valenzuela, con un primer negocio en el Boulevard Guevara de Margarita, base de "La Proveeduría" en Pedregales y Porlamar. [verificado: sigo.com.ve/conocenos]
- "Durante 50 años" creando posibilidades para la población neoespartana; "una de las compañías más sólidas del oriente del país". [verificado como declaración: sigo.com.ve/conocenos]. Nota: 1972 a 2026 son 54 años; el texto dice 50 (probablemente sin actualizar).
- Comenzaron "en pleno corazón de Porlamar". [verificado: /conocenos]
- Carrera anual de Sigo: "10 años de la carrera" (2026) y "11° Carrera Infantil Sigo", 19 jul 2026, 7:00 am, C.C. Parque Costazul. [verificado: blog de sigo.com.ve]. Otro evento: carrera 15K/10K/Caminata 5K con fecha "30 de Agosto" [verificado: blog; resultado no verificado].
- Cifras de empleados, ventas, años de proveedores: [no verificado], no aparecen.

**Sucursales / formatos**
- Texto de /conocenos: 1 Sigo Bodegón, 3 Sigo Farmacias, 3 Sigo Supermarket, 1 Ecommerce al detal, 2 Sigo Más+. [verificado: /conocenos] (los Sigo Más+ no están descritos ni ubicados en ningún otro lugar [no verificado]).
- Sigo Supermarket (3): C.C. Parque Porlamar, entrada Oeste; C.C. Parque Costazul, entrada Bambú; C.C. Sambil Margarita, local T-128, entrada Playa Caribe. [verificado: /sucursales-2]
- Sigo Farmacia (3): dentro de cada Supermarket (Porlamar, Costazul, Sambil). [verificado: /sucursales-2]
- Sigo Bodegón: C.C. La Vela y C.C. Parque Costazul (la lista muestra 2, mientras /conocenos dice 1: **inconsistencia**). [verificado con discrepancia]
- El menú del sitio solo lista Sambil y Costazul como sucursales para comprar online; Porlamar no aparece en el submenú. [verificado: home]
- Horarios de tienda física, teléfonos por sucursal, coordenadas: [no verificado], no publicados.

**Servicios**
- Compra online con selección de sucursal; compras desde el exterior permitidas. [verificado: /como-comprar]
- Retiro en tienda (drive-thru: se entrega en el vehículo, estacionamiento preferencial), todos los días 10:00 am a 9:00 pm; solo en Supermarket Sambil y Costazul; pedido resguardado 3 días. [verificado: /como-comprar]
- Delivery a domicilio en toda la Isla, todos los días 10:00 am a 8:00 pm, en 3 modalidades: Express (moto, 2 a 4 h, municipios Maneiro, Mariño, Arismendi, García), Especial (vehículo, salida única 3:00 pm, todos los municipios), Programado (10:00 am a 7:00 pm). Tarifas: Maneiro y Mariño $2.5, Arismendi $3.5, García $4.5, Gómez/Antolín del Valle/Díaz/Marcano $15, Tubores $25, Macanao $30. [verificado: /como-comprar; algunos nombres de municipio están abreviados en el original]
- Pagos: Zelle, PayPal (comisión $0.30 + 6% y 3% IGTF según el sitio), transferencia bancaria, efectivo en divisas, E-pagos Banco Mercantil (débito Mercantil o crédito de cualquier banco), tarjeta de débito (en sucursal), Sigo Créditos. Zelle/transferencia: 2 horas para registrar comprobante; validación de 5 a 15 min. [verificado: /pagos]
- Divisas: precios en USD con selector USD/Bolívares. [verificado: home]
- Sigo Créditos / Recargas Sigo Club: monedero prepagado en dólares (1 USD = 1 Sigo crédito) para usar en tiendas y web, recargable por terceros (familiares en el exterior) vía PayPal. [verificado: /sigo-creditos]
- App móvil propia: no se encontró mención ni enlaces a tiendas de apps. [no verificado]
- Tarjeta de fidelidad/puntos: no hay programa de puntos visible. "Sigo Club" aparece solo como marca de las recargas. [no verificado]
- Empleo: página ¡Únete! con Google Form. [verificado]

**Contacto**
- WhatsApp enlazado en el menú "¡Contáctanos!": +58 412-5296412. [verificado: HTML del home]
- WhatsApp para validación de pagos en fines de semana/feriados: +58 412-8208843. [verificado: /pagos] (dos números distintos sin explicar cuál es de qué)
- Correos: compraonline@sigosa.com (contacto); ventasonline@sigosa.com / ventasonline1@sigosa.com (pagos, escritos de forma inconsistente). [verificado]
- Redes enlazadas en footer: Facebook /SigoVenezuela y Instagram @sigosa. TikTok y YouTube no enlazados. [verificado: footer]. Contenido de esas cuentas: [no verificado] (acceso bloqueado).
- Titular de cuenta PayPal indicado: "TERMO DIESEL CORP" (razón social distinta de Sigo; conviene que el cliente confirme que es correcta y por qué se muestra públicamente). [verificado: /pagos]

**Proveedores aliados mostrados:** Coca-Cola FEMSA de Venezuela, Alimentos Mary, Natulac, Ronco Pastas, Alfonzo Rivas y Cía, La Lucha, Alimentos Polar. [verificado: home]

## 6. Fortalezas, debilidades y oportunidades

**Fortalezas**
1. Historia fuerte y diferenciadora: "desde 1972", fundador con nombre, raíz en Porlamar. Casi nadie en la isla puede decir "50+ años".
2. Operación omnicanal ya existente y bien definida: retiro en vehículo, tres tipos de delivery con tarifas por municipio, Sigo Créditos para remesas familiares. Son diferenciales reales que hoy están escondidos en páginas de FAQ.
3. Presencia física en centros comerciales clave (Parque Costazul, Sambil, Parque Porlamar) y varios formatos (supermarket, farmacia, bodegón).
4. Activación de comunidad y marca: carreras anuales, promo "Aventura Sigo en Margarita", red de marcas aliadas.
5. Logo simpático y reconocible, buena base de color (azul marino + verde).
6. Pagos adaptados al contexto venezolano (Zelle, PayPal, divisas, Mercantil).

**Debilidades**
1. No existe una cara institucional: el dominio principal es una tienda con título atado a una sucursal ("Costazul"); un visitante que busca "dónde queda Sigo / a qué hora abren" no lo resuelve.
2. Sucursales: solo lista de texto; sin mapa, horarios, teléfono, fotos, cómo llegar ni estacionamiento. Inconsistencia en el número de bodegones y "Sigo Más+" sin explicar.
3. Hero y banners comunican marcas de terceros, no a SIGO ni sus promociones propias; bloques de productos vacíos al cargar.
4. SEO y compartición social deficientes: sin Open Graph, sin schema.org (LocalBusiness/GroceryStore), títulos genéricos; al compartir un enlace en WhatsApp/Instagram no hay vista previa controlada.
5. Tecnología antigua y pesada (jQuery 3.3, Kendo 2014, ~40 scripts), poco optimizada; bloqueo de zoom y accesibilidad pobre.
6. Información clave enterrada en textos largos con erratas, horarios contradictorios y números de WhatsApp distintos.
7. Ecosistema de marca fragmentado (Sigo / Sigosa / Sigo Supermarket / Costazul / Sambil subdominios; dominios secundarios con TLS roto).
8. Sin programa de fidelidad ni app visibles, sin sección de ofertas/folleto semanal, sin inglés (turismo y diáspora).

**Oportunidades concretas para la nueva landing institucional**
1. Hero propio: promesa de marca (p. ej. "Sirviendo con amor desde 1972") + dos CTAs claros: "Compra online" (a sigo.com.ve, mantener el e-commerce como destino) y "Encuentra tu Sigo".
2. Sección "Encuentra tu Sigo": tarjetas por sucursal con dirección, horarios, teléfono/WhatsApp, botón "Cómo llegar" (Google Maps) y chips de servicios (farmacia, retiro en tienda, delivery). Requiere que SIGO entregue horarios y confirme el número real de tiendas.
3. Bloque "Cómo te lo llevamos": resumir en 3 tarjetas visuales Retiro en vehículo / Delivery Express / Delivery Especial con tiempos y tarifa por municipio (tabla simple), en lugar del texto largo actual.
4. Sigo Créditos como pieza de marca: "Envía mercado a tu familia en Margarita" dirigido a la diáspora (con versión en inglés opcional).
5. Línea de tiempo de historia (1972 Boulevard Guevara, La Proveeduría, hoy) con cifras actualizadas y foto del fundador; reforzar confianza.
6. Promociones y comunidad: módulo de "Ahora en Sigo" (promo vigente, carrera Sigo, ofertas de la semana) editable y con fecha de vigencia.
7. Rutas rápidas de contacto: botón flotante de WhatsApp unificado (un solo número acordado) y barra fija en móvil con "Llamar / WhatsApp / Cómo llegar".
8. SEO local y social desde el día uno: title y description propios, Open Graph con imagen de marca, JSON-LD `GroceryStore`/`Pharmacy` por sucursal, canonical, sitemap, lang="es"; mobile-first, sin bloquear zoom, imágenes WebP, sin librerías pesadas (objetivo: página estática liviana).
9. Sistema visual: partir del azul marino y verde del logo (validar hex con el archivo de logo oficial), tipografía propia con buena legibilidad y jerarquía clara; usar fotografía real de tiendas, frescos y gente de la isla en lugar de banners de proveedores.
10. Reunir en un solo hub la marca: enlazar Facebook, Instagram y (si existen) TikTok/YouTube; mostrar feed o galería para dar "prueba social"; incluir proveedores aliados como sello de confianza (con permiso).
11. Medición: mantener el píxel de Meta, agregar GA4 y eventos de clic en "Comprar online", "Cómo llegar" y WhatsApp.

**Pendientes para el cliente (datos que no se pudieron verificar):** horarios por sucursal, número real de tiendas y qué es "Sigo Más+", WhatsApp oficial único, archivos de logo y manual de marca, contenido y métricas de Instagram/Facebook/TikTok, existencia de app y programa de fidelidad, cifras de empleados y años, estado actual de promos.
