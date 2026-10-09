# Verificación de correcciones — Landing SIGO

- **Build verificado:** el nuevo, servido en `http://localhost:4173/landing-sigo/` (`index.html` del 2026-10-08 23:54 UTC). No lo reconstruí ni toqué su directorio, y no modifiqué el repo.
- **Cómo se verificó:** se volvieron a ejecutar los scripts de `qa/scripts/` y se añadieron scripts nuevos de verificación (`menu-v2.js`, `foco-v2.js`, `foco-v2b.js`, `tope.js`, `b9.js`, `final-v2.js`, `marq-v2.js`).
- **Dónde está la evidencia:**
  - Logs: `qa/logs-v2/`
  - Capturas: `qa/capturas-v2/`

## Resumen

| Estado | Nº |
|---|---|
| Corregido | 23 |
| Parcial | 3 (M2, M3, B9) |
| No corregido | 0 |
| Excluido por decisión de diseño | M9, B8 y el trazo de B7 |
| Problemas nuevos | 4, todos de severidad baja |

**Sin regresiones en:**
- Layout de 280 a 2560 px y en horizontal: no queda nada fuera del viewport, recortado o solapado.
- Filtros de tiendas: ráfagas, doble clic, teclado y scroll.
- Hidratación y consola: sin errores en carga normal ni con `page.clock` en 2027-01-02 y 2026-12-31.
- Reduced motion: todo visible.
- Sin JS: todo visible.
- Anclas, recarga a media página, redimensionar cruzando breakpoints y rotar el móvil.
- Línea verde del hero: no se solapa.
- CLS 0,000.

## Estado por hallazgo

| ID | Estado | Evidencia y notas |
|---|---|---|
| **A1** Tab salta controles | **CORREGIDO** | Con movimiento y sin hacer scroll antes, Tab recorre **53 paradas** (antes 23), entre ellas el textarea, las sugerencias, los 16 enlaces de tiendas, el select y Únete/Proveedores. Todo elemento enfocado tiene opacidad 1. Cuando termina el scroll suave, ninguno queda fuera de la vista ni tapado (desk: 52 paradas, 0 problemas). Logs: `logs-v2/a11y2.log`, `logs-v2/foco.log`. |
| **A2** Hidratación en 2027 | **CORREGIDO** | Con `page.clock` en 2027-01-02 y 2026-12-31 no hay error #418 ni errores de consola. La página muestra "54 años" de forma coherente con el año del build, y el cron anual está en `desplegar.yml`. Log: `logs-v2/anio.log`. Ver la nota N3. |
| **A3** Nombres del carrito ilegibles | **CORREGIDO** | La columna del nombre mide 216 px a 320 (antes 32), 256 a 360 y 271 a 375, sin cortes. El total con cantidades altas ya no se desborda a 320. Logs: `logs-v2/carroanchos.log`, `logs-v2/carro320*.log`. |
| **A4** H1 oculto o parpadeo con JS lento | **CORREGIDO** | Con el JS retrasado 3 s, 6 s o bloqueado, el hero se ve a los 1,5–1,8 s. Con el JS a 5,5 s no hay parpadeo (`44ms:h → 1544ms:v`, ya no vuelve a ocultarse). LCP en móvil con CPU 6x y 3G lenta: **2,24 s** (antes 4,49 s). Logs: `logs-v2/lento.log`, `logs-v2/parpadeo.log`, `logs-v2/final.log`. |
| **M1** Recortes a 280 px | **CORREGIDO** | scrollWidth 280 = viewport. La cabecera muestra solo iconos y el botón de menú está dentro. "Comunidad" y la barra inferior caben. Evidencia: `logs-v2/layout.log`, `capturas-v2/layout-280x653-full.png`. |
| **M2** Texto al 200 % | **PARCIAL** | En escritorio está bien: solo "Cerrado ahora" sobresale 4 px. En móvil 390 con `font-size:200%` (equivale a un viewport de 195 px) quedan cosas fuera, y `overflow-x:clip` las oculta: el **botón de menú** queda a x 366–454 (fuera), "Sirviendo", el precio "$2.50", las píldoras "Abierto/Cerrado ahora" y "creando posibilidades.". scrollW 494 (antes 623). Por teclado el menú sigue siendo alcanzable. Evidencia: `capturas-v2/texto200-movil-hero.png`, `logs-v2/varios.log`. **Sugerencia:** con la consulta de contenedor angosta, reducir el logo y el botón de compra a `h-9`/`px-2.5`, o dejar que la cabecera haga `flex-wrap`. En el H1, `overflow-wrap:anywhere` o un mínimo menor en el `clamp`. |
| **M3** Menú: foco, Escape y trampa | **PARCIAL** | Escape cierra, Tab y Shift+Tab quedan atrapados en el diálogo y el foco vuelve a "Abrir menú". **Pero con movimiento activo (el caso por defecto) el foco no entra en el diálogo al abrir:** se queda en "Abrir menú", detrás del panel, tanto con clic como con Enter. Con reduced motion sí va a "Cerrar menú". Causa probable: el `useGSAP` de entrada (`.from(panelMenu, {autoAlpha:0})`) pone `visibility:hidden` al panel antes de que corra el `useEffect` que llama a `botonCerrar.focus()`, y un elemento oculto no recibe foco. **Corrección:** animar con `opacity` en vez de `autoAlpha` en `Encabezado.tsx` (entrada del menú), o enfocar en el `onStart`/`onComplete` de la timeline. Log: `logs-v2/menu-v2.log`. |
| **M4** Scroll bloqueado al pasar a ≥1024 | **CORREGIDO** | Con el menú abierto y el viewport pasado a 1280, el diálogo se cierra, `overflow` vuelve a "" y la rueda hace scroll (0→1500). 10 ciclos de abrir/cerrar dejan el estado limpio. |
| **M5** Tasa BCV sin validar | **CORREGIDO** | Una API con 0, valores negativos o 1e300 no muestra Bs y no guarda caché. La caché de 2019, negativa o enorme se ignora. Una caché vigente de 1 h con la red caída se muestra con `title="Tasa oficial BCV del 8/10"`. Una caché de 4 días no se muestra. El timeout de 8 s funciona: con la API a 10 s y sin caché no se muestra tasa. El carrito muestra "Bs. … · tasa BCV del 7/10". Logs: `logs-v2/tasa.log`, `logs-v2/final.log`. |
| **M6** Cantidades sin tope | **CORREGIDO** | "999999 harinas" → 99, con el aviso "Ajusté Harina de maíz P.A.N. al máximo de 99". 1e20 de hielo → 99. Carne → máximo 50 kg. El botón "+" queda `disabled` en el tope. Ver N1 para el caso de sumar desde el chat. |
| **M7** Desborde con palabras largas | **CORREGIDO** | Ninguna burbuja se desborda (`[]`), ni siquiera con 5000 caracteres inyectados por JS. "No encontré" se recorta a unos 40 caracteres con "…". |
| **M8** Intérprete | **CORREGIDO** | "-3 arroz" y "0 leche" → "¿Cuánto … quieres? La cantidad debe ser mayor que cero". "2 huevos" → docena ×2. "dos y medio kilos de carne" → 2,5 kg. "kilo y medio de queso" → 1,5 kg. "soda" → "¿te refieres a Galletas de soda o Refresco Coca-Cola?". |
| **M9** Contraste | **EXCLUIDO por decisión de diseño** | Sigue fallando (verde vivo 3,18:1, etc.). No se reporta como pendiente. |
| **M10** Marcas: teclado y reduced motion | **CORREGIDO** | La región "Marcas aliadas" está en el orden de Tab. A 800 px, con reduced motion o en móvil: `overflow-x:auto`, duplicados ocultos y scroll posible. A 1440 con movimiento: `data-animada`, marquesina en movimiento. Al pasar a 600 px se desactiva y al volver se reactiva. Ver la nota N4. |
| **M11** og:image, robots, sitemap y 404 | **CORREGIDO** | `og:image` y `twitter:image` (1200×630, 94 KB, HTTP 200). `robots.txt` y `sitemap.xml` (200) bien formados. 404 en español ("Esta página no está en el anaquel") sin canonical. El favicon queda ignorado por indicación. Nota: en un sitio con subruta de GitHub Pages, `robots.txt` bajo `/landing-sigo/` no lo leen los buscadores; es inofensivo, pero el sitemap conviene enviarlo en Search Console. |
| **M12** Listas inválidas | **CORREGIDO** | axe ya no reporta `list` ni `listitem`. Sigo Créditos: `<ol>` → `<li>`. El `<ol>` de Historia solo contiene `<li>`. |
| **B1** Objetivos táctiles | **CORREGIDO** | Restar, Sumar y Quitar, y las sugerencias, ya no aparecen por debajo de 44 px. Siguen en 40 px los filtros, "Cómo llegar" y el logo, y los `tel:` en línea miden 19 px (excepción por ir en línea). Es aceptable. |
| **B2** Barra inferior tapa el campo | **CORREGIDO** | "Mi lista" enfoca el textarea y lo deja visible (bottom 434 < barra 765). Detalle menor: "Escribe tu lista" del hero sigue llevando a `#asistente` sin enfocar el campo. |
| **B3** Sin JS | **CORREGIDO** | Móvil: barra inferior visible y botón de menú oculto. Escritorio: botón flotante visible. No queda nada oculto. |
| **B4** Puntos con reduced motion | **CORREGIDO** | Según el diff (`mm.add(CON_MOVIMIENTO)`). Con reduced motion no aparecen animaciones extra (`getAnimations` = 1, la misma de antes, que es CSS). |
| **B5** "Horario" y JSON-LD | **CORREGIDO** | "Horario" abre "¡Hola Sigo! ¿Cuál es el horario de Sigo Bodegón La Vela?". El JSON-LD tiene `logo`, `image`, `addressLocality` (Pampatar ×3 y Porlamar) y un `@id` con barra final. No se añadió `openingHours` (opcional). El teléfono de Sambil sigue pendiente de confirmar con el cliente. |
| **B6** Formato de moneda | **CORREGIDO** | El hero muestra "$2.40" y "$9.05" (punto). El mensaje de WhatsApp incluye "≈ Bs. 19.222,73 (tasa BCV del 7/10)". |
| **B7** Números decorativos | **CORREGIDO** (`aria-hidden`) / trazo **EXCLUIDO** | Los 4 números "0N" de Entregas y los 3 de Sigo Créditos tienen `aria-hidden`. |
| **B9** Cifras ocultas en el primer pliegue | **PARCIAL** | A 1440×900 las tarjetas siguen ocultas al cargar: el top está en 858 px y sobresalen 42 px, con opacidad 0 tras 3,5 s. Se ve un hueco blanco en la base del hero hasta hacer scroll. A 1920×1080 se revelan bien. A 1280×800 y 1366×768 quedan fuera del pliegue, así que no importa. Causa probable: el `y:32` inicial del `from` desplaza el trigger, o el `-mt` negativo. **Sugerencia:** `start: "top bottom"` solo en Cifras (o `immediateRender` sin desplazamiento cuando ya está en pantalla). Evidencia: `capturas-v2/b9-cifras-1440.png`. |
| **B10** Estilo safe-area | **CORREGIDO** | El estilo se eliminó. |

## Problemas nuevos (todos de severidad baja)

| ID | Severidad | Dónde | Reproducción | Obtenido | Sugerencia |
|---|---|---|---|---|---|
| **N1** | Bajo | `AsistenteCarrito.tsx` `unirCarrito()` (l.57-66) | Con 99 hielos en el carrito, escribir "5 hielo" o "hielo". | El chat responde "Listo, agregué 1 producto a tu carrito." pero **no se añade nada**: el tope se aplica en silencio al unir con el carrito existente, sin aviso. | Hacer que `unirCarrito` devuelva qué líneas se recortaron y añadir "Ya tienes el máximo de 99 de Hielo" en lugar de "agregué". |
| **N2** | Bajo | `Encabezado.tsx`, entrada del menú con `autoAlpha` | Es la causa de M3 parcial. | El foco inicial no entra en el diálogo cuando hay movimiento. | Ver M3. |
| **N3** | Bajo | `app/opengraph-image.jpg` y `opengraph-image.alt.txt` | Revisar los metadatos. | La imagen OG y su `alt` dicen "54 años" de forma fija: el rebuild anual del cron no los actualiza. Además, `og:image:alt` y `twitter:image:alt` terminan en un salto de línea (`…con delivery\n`). | Generar la OG con `opengraph-image.tsx` (ImageResponse con `ANIO_ACTUAL`), o quitar la cifra de la imagen y del alt. Hacer `trim` del `.alt.txt`. |
| **N4** | Bajo (cosmético) | `Comunidad.tsx`, región "Marcas aliadas" | Tab en escritorio con marquesina animada. | La región recibe foco (`tabIndex=0`) aunque en modo marquesina tiene `overflow:hidden` y no hay nada que desplazar: es una parada de Tab que no hace nada. | Poner `tabIndex` solo cuando no está `data-animada`, o pausar la marquesina al recibir foco. |

**Cambio de comportamiento, no es bug:** con la nueva consulta de contenedor (60rem), la cabecera muestra el botón de menú en lugar de los enlaces hasta unos 1100 px. Antes los enlaces aparecían desde 1024. A 1024 hay menú hamburguesa y no hay barra inferior (porque es `lg:hidden`); funciona correctamente.

## Comprobado sin regresiones

- **Layout:** 17 tamaños, más 280 y horizontal. Sin desbordes. El único elemento señalado es la imagen con su pie, que es intencional (`logs-v2/layout.log`).
- **Filtros de tiendas:** conteos 8/3/2/4, píldora alineada y sin pantalla en blanco (`logs-v2/filtros.log`).
- **Menú:** el foco queda atrapado y los enlaces llevan a la sección correcta (top=80).
- **Animaciones y anclas:** todo visible tras saltos, subidas, recarga a media página, redimensionado y rotación. El desvanecimiento del hero al hacer scroll en escritorio es intencional.
- **Asistente:** HTML y emojis seguros, unidades correctas, enlace de WhatsApp bien codificado, sin errores.
- **Tasa BCV:** ninguna combinación de red o almacenamiento produce NaN, undefined ni errores.
- **Sin JS y reduced motion:** sin contenido oculto.
- **Consola y red:** 0 errores y 0 peticiones fallidas.
- **JSON-LD:** válido.

---

## Cierre de pendientes tras esta verificación

| ID | Estado final | Corrección aplicada |
|---|---|---|
| M2 | CORREGIDO | Las container queries de la cabecera pasan a `em`; las medidas no textuales de la cabecera, a `px`. Los títulos y las tarjetas parten las palabras largas solo cuando no caben. Con el texto al 200 % en 390 px, el ancho de página es 390 y el botón de menú queda en x 326–370. |
| M3 / N2 | CORREGIDO | La entrada del menú anima solo la opacidad; al abrirlo, el foco entra en "Cerrar menú". |
| B9 | CORREGIDO | `Revelar` y los contadores se disparan con `start: "top bottom"`. A 1440×900 las cifras quedan visibles al cargar. |
| N1 | CORREGIDO | El asistente avisa "Ya tienes el máximo de …" y solo cuenta los productos que realmente agregó. |
| N3 | CORREGIDO | La imagen para compartir y su texto alternativo ya no incluyen cifras que caducan (sin "54 años") y no terminan en salto de línea. |
| N4 | CORREGIDO | En modo marquesina, la región de marcas sale del orden de Tab. |
| Cabecera 1024–1100 | AJUSTADO | El umbral bajó a 58em, así que a 1024 px vuelven a verse los enlaces. |
