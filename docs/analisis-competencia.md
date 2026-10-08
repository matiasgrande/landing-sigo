# Análisis de mercado para la nueva landing de SIGO

Fecha: 8 de octubre de 2026. Alcance: landing institucional de **SIGO Supermercados** (Isla de Margarita). El e-commerce (sigo.com.ve) queda fuera del alcance, pero la landing debe llevar tráfico hacia él.

Los informes completos están en `docs/investigacion/`:

| Informe | Contenido |
|---|---|
| `01-competencia-internacional.md` | 16 supermercados analizados (Mercadona, Lidl, ALDI, Tesco, Publix, Trader Joe's, Whole Foods, Wegmans, Éxito, Olímpica, Jumbo, Chedraui, PriceSmart, Rey, Woolworths). Carrefour, Soriana, Líder y H-E-B bloquearon la revisión automatizada. |
| `02-competencia-nacional.md` | Gama, Río Supermarket, Forum, Central Madeirense, Unicasa, Kromi, Traki y Farmatodo verificados en vivo. Plaza's, Rattan, Luvebras y otros no se pudieron verificar. |
| `03-sitio-actual-sigo.md` | Auditoría de sigo.com.ve (contenido, técnica, SEO, marca y negocio). |

> Nota metodológica: los datos marcados como [NV] en los informes no se pudieron comprobar directamente. Ningún dato de la competencia proviene de analítica interna; son observaciones de las páginas públicas.

---

## 1. Situación actual de SIGO

- **No existe una cara institucional.** `www.sigo.com.ve` es directamente una tienda nopCommerce (tecnología de 2014, más de 40 scripts) con título "SuperMarket Sigo Costazul" en todas las páginas.
- **El hero comunica marcas de terceros** (Harina P.A.N.), no a SIGO.
- **Sucursales solo en texto**, sin mapa, horarios ni botón "Cómo llegar". Las tiendas Sigo + (Boca del Río, Ecoland, Isla Caribe) no aparecen.
- **Diferenciales escondidos en FAQ**: retiro en el vehículo, tres modalidades de delivery con tarifas por municipio y Sigo Créditos (recargas desde el exterior).
- **SEO y redes**: sin Open Graph, sin schema.org y sin canonical. Al compartir el enlace por WhatsApp no aparece vista previa de marca.
- **Accesibilidad**: bloquea el zoom en móvil, usa textos grises de bajo contraste y alts genéricos.
- **Activos fuertes**: historia desde 1972 (54 años), fundador con nombre propio, eventos comunitarios (Carrera Sigo, 11ª Carrera Infantil), presencia en Sambil, Costazul y Parque Porlamar, y pagos adaptados al país.

## 2. Lo que tienen las landings de supermercados (y SIGO debe incluir)

Patrones presentes en la mayoría de los referentes:

| Elemento | Referentes | Aplicación en SIGO |
|---|---|---|
| Hero con propuesta de valor propia + 2 CTA | Gama, Publix, Whole Foods | "Sirviendo con amor desde 1972" + "Compra online" / "Encuentra tu Sigo" |
| Localizador de tiendas con horario y "Cómo llegar" | Publix, Tesco, ALDI, Forum, Farmatodo | 8 tiendas con filtros por formato y enlace a Google Maps |
| Cifras de confianza | Gama (+56 años), Madeirense (+70), Traki | 54 años, 8 tiendas, 11 municipios con delivery |
| Ofertas o folleto semanal con vigencia | Lidl, Publix, ALDI UK, Unicasa | Bloque "Ahora en Sigo" con fechas de vigencia |
| Delivery y retiro explicados | Kromi, Farmatodo, Woolworths | Tarjetas por modalidad + calculadora de tarifa por municipio |
| Medios de pago | Chedraui, Farmatodo | Zelle, PayPal, efectivo USD, transferencia, Mercantil, débito, Sigo Créditos |
| WhatsApp visible | Forum (bot Cleo), Kromi, Éxito, Olímpica | Botón flotante + barra inferior móvil con ambos números |
| Comunidad / RSE | Gama, Traki, Whole Foods, Publix | Carrera Sigo, carrera infantil, promociones con aliados |
| Empleo y proveedores | Mercadona, Publix, Wegmans | Bloque "Trabaja con nosotros" y "Sé nuestro proveedor" |
| Pie con contacto, redes y legales | Todos | Correos, ambos WhatsApp, Instagram, Facebook |

## 3. Lo que nadie hace bien (oportunidades diferenciales)

1. **Armar el carrito escribiendo.** Ningún supermercado revisado, nacional o internacional, permite escribir la lista ("2 harinas pan, 1 kg de queso…") y convertirla en carrito. Es la función insignia de la propuesta: la landing incluye una demostración que interpreta el texto, arma el carrito con precios referenciales y lo envía por WhatsApp o lo lleva a sigo.com.ve.
2. **Tasa BCV en la landing institucional.** En Venezuela solo se ve en las tiendas online (Gama, Río, Kromi). La landing la muestra en vivo (API pública con respaldo si falla).
3. **Identidad insular y turismo.** Ninguno de los sitios revisados habla del visitante ni de la isla. SIGO tiene dos tiendas dentro de hoteles (Sunsol Ecoland y Sunsol Isla Caribe) y Sigo Créditos para la diáspora: tiene una historia que contar que el resto no tiene.
4. **Mapa, horario y contacto por sucursal en una sola vista.** Solo Forum tiene mapa y solo Farmatodo y Unicasa muestran horarios; nadie combina todo.
5. **Velocidad.** La competencia pesa entre 160 KB y 3 MB solo de HTML inicial. Una landing estática y liviana es una ventaja real con la conectividad de la isla.
6. **SEO local.** Ningún referente verificado expone `GroceryStore` en la home. La landing publica JSON-LD de la organización y de las 8 tiendas.
7. **Competidor directo débil en marca.** Río Supermarket (7 sedes en la isla) es 100 % transaccional, sin narrativa de marca ni de isla.

## 4. Errores a evitar

- Menús sobrecargados (Central Madeirense, 15 entradas).
- Sitios no responsive (Unicasa desborda a 980 px).
- SPA con HTML vacío que perjudica el SEO (Gama).
- Carruseles automáticos con publicidad de terceros como hero (SIGO hoy).
- Certificados SSL vencidos o dominios caídos (Rattan, Luvebras).
- Bloquear el zoom en móvil (SIGO hoy).

## 5. Arquitectura propuesta de la landing

1. Cabecera fija mínima: logo, 5 enlaces, tasa BCV y CTA "Compra online".
2. Hero: "Sirviendo con amor desde 1972" + CTA a e-commerce y sucursales.
3. Franja de cifras animadas (años, tiendas, municipios, modalidades de entrega).
4. **Asistente "Escribe tu lista"** (demo del carrito por texto).
5. Sucursales: 8 tarjetas filtrables (Supermarket, Bodegón, Sigo +) con "Cómo llegar".
6. Cómo te lo llevamos: retiro en el vehículo y 3 modalidades de delivery + tarifa por municipio.
7. Sigo Créditos: "Haz mercado a tu familia desde cualquier parte del mundo".
8. Formas de pago.
9. Historia: línea de tiempo interactiva desde 1972.
10. Comunidad: Carrera Sigo y eventos.
11. Marcas aliadas.
12. Cierre con CTA y pie con contacto, ambos WhatsApp y redes.

## 6. Datos confirmados con SIGO

- Enfoque: solo la unidad de supermercados.
- Años: 54 (el texto de 50 años del sitio actual quedó desactualizado).
- Se mantienen ambos WhatsApp: +58 412-529-6412 (atención) y +58 412-820-8843 (pagos).
- Sucursales (8):
  - Sigo Supermarket Costazul
  - Sigo Supermarket Porlamar
  - Sigo Supermarket Sambil
  - Sigo Bodegón La Vela
  - Sigo +2 Bodegón Costazul
  - Sigo +4 Boca del Río
  - Sigo +7 Ecoland (Hotel Sunsol Ecoland)
  - Sigo +8 Isla Caribe (Hotel Sunsol Isla Caribe)

- Medios de pago adicionales confirmados: **Pago Móvil** y **Cashea (Línea Cotidiana)**.
- Fichas de Google Maps de los 3 Supermarket (consultadas el 8 oct 2026):

| Tienda | Dirección (Google Maps) | Horario visto | Teléfono |
|---|---|---|---|
| Supermarket Costazul | C.C. Parque Costazul, Zona Este, Av. Jóvito Villalba, Pampatar | 8:00–22:00 | — |
| Supermarket Sambil | C.C. Sambil Margarita, Av. Luisa Cáceres de Arismendi, Pampatar | 8:00–22:00 | +58 412-529-6412 |
| Porlamar (ficha "Sigo S.A") | C.C. Sigo, Av. Juan Bautista Arismendi con Calle Prica, Porlamar | 8:00–18:00 | +58 295-265-2000 |

> Google Maps, en vista limitada, solo muestra el horario del día de la consulta (jueves). La landing lo presenta como "horario de referencia" y calcula "Abierto/Cerrado ahora" con la hora de Margarita (UTC-4).

## 7. Pendientes por confirmar

- Horario semanal completo (y de feriados) de cada tienda; horarios de bodegones y Sigo +.
- Ubicación en Google Maps de los bodegones y de las tiendas Sigo +.
- Si la tienda de Porlamar es la misma que el sitio actual llama "C.C. Parque Porlamar, entrada Oeste" (Google la ubica en C.C. Sigo, Calle Prica).
- Logo en alta resolución o vector (la propuesta usa el PNG de 120 px del sitio actual) y manual de marca desde el ERP. En la fachada de Costazul se ve un rojo institucional en el mural "Servimos con amor" que conviene incorporar a la paleta.
- **Fotografías**: la propuesta usa fotos públicas de Google Maps con crédito a sus autores (Rossmar Maicán, Daniel Martínez, Alfredo Guánchez). Son de terceros: para publicar en producción hay que reemplazarlas por fotos propias de SIGO o pedir permiso a los autores.
- Afirmaciones sobre puerto libre: requieren validación legal antes de publicarse.
