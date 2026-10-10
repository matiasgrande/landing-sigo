# SIGO · App de iOS (prototipo)

App nativa de compras de SIGO Supermercados en **SwiftUI para iOS 26**, con **Liquid Glass**. Sigue las reglas y el diseño de la landing y de la tienda web (`/tienda`):

- **Mismos datos.** Usa el catálogo real de Costazul y Sambil (5.273 productos), con precio y existencia por tienda, y la tasa BCV en vivo.
- **Mismas reglas.** Compra mínima, tarifas por municipio, IGTF al céntimo y validación de teléfonos venezolanos.
- **Mismas funciones.** Comparador entre tiendas, ofertas, compra para otra persona, sustitutos, "comprar de nuevo" y recetas del calendario venezolano.
- **Misma marca.** Los colores son los tokens de `app/globals.css`, sacados del logo oficial. Las tarjetas son blancas sobre crema y los botones son verdes. En lugar de Nunito se usa la fuente redondeada del sistema.

## Cómo abrirla

1. En una Mac con **Xcode 26** abre `ios/SigoTienda.xcodeproj`. No hay dependencias que instalar.
2. En *Signing & Capabilities* elige tu equipo (Team). Si hace falta, cambia el *Bundle Identifier* (`ve.com.sigo.tienda.prototipo`).
3. Ejecuta en un simulador de iPhone con iOS 26 o en tu teléfono (⌘R).

El proyecto usa carpetas sincronizadas: cualquier archivo nuevo dentro de `SigoTienda/` entra solo al target.

## Estructura

```
ios/
├── SigoTienda.xcodeproj
├── SigoTienda/
│   ├── SigoTiendaApp.swift      Punto de entrada (tema, fuente redondeada, carga inicial)
│   ├── Nucleo/                  Lógica sin SwiftUI (la misma que la web, portada a Swift)
│   │   ├── Modelos.swift        Producto, Sucursal, Entrega, Pedido, Sustitutos
│   │   ├── Catalogo.swift       Lee el catálogo compacto v2 (public/catalogo-asistente.json)
│   │   ├── Normalizacion.swift  Acentos, "P.A.N." → "pan", medidas y plurales
│   │   ├── Busqueda.swift       Índice, búsqueda tolerante a errores (Levenshtein) y mejor coincidencia
│   │   ├── Comercio.swift       Precios por tienda, promociones, totales en céntimos, IGTF, comparador, WhatsApp
│   │   ├── Promociones.swift    Promociones de ejemplo y tasa BCV
│   │   ├── Temporadas.swift     Calendario venezolano (Pascua calculada) y 12 recetas
│   │   ├── Recetas.swift        Receta → carrito: peso a paquetes, litros a envases, huevos a cartones
│   │   └── Datos.swift          Tarifas, métodos de pago, WhatsApp, URLs
│   ├── Interfaz/                SwiftUI + Liquid Glass
│   │   ├── Tienda.swift         Estado observable y persistencia (UserDefaults)
│   │   ├── RaizView.swift       Pestañas, accesorio inferior con entrega y total, selector de entrega
│   │   ├── InicioView.swift     Cabecera, temporada, ofertas, lo esencial, departamentos
│   │   ├── ListadoView.swift    Listado con chips de categoría, buscador y diseño en filas
│   │   ├── ProductoVistas.swift Tarjeta, "Agregar" → contador (morph de vidrio), ficha
│   │   ├── CarritoView.swift    Carrito, sustitutos, compra mínima y comparador de tiendas
│   │   ├── CheckoutView.swift   Checkout en 3 pasos, compra para otra persona y confirmación
│   │   ├── PedidosView.swift    Mis pedidos y "Comprar de nuevo"
│   │   ├── RecetasView.swift    Temporadas y recetas escalables
│   │   └── Tema.swift           Colores de marca, tarjetas y pastillas de vidrio
│   └── Recursos/                Catálogo empaquetado, ícono, logo y color de acento
├── Package.swift                Solo para probar el núcleo fuera de Xcode
└── PruebasNucleo/               Pruebas del núcleo con el catálogo real
```

## Liquid Glass en la app

- **Barra de pestañas de iOS 26.** Se minimiza al bajar (`tabBarMinimizeBehavior`). La pestaña de búsqueda tiene `role: .search` y su campo aparece en la propia barra.
- **Accesorio inferior (`tabViewBottomAccessory`).** Muestra siempre dónde recibes la compra y el total del carrito, con lo que falta para el mínimo.
- **Botón "Agregar".** Se transforma en contador dentro del mismo vidrio (`GlassEffectContainer` + `glassEffectID`).
- **Botones.** Los principales usan `.glassProminent` en verde SIGO; los secundarios, `.glass`.
- **Chips y pastillas.** Los chips de categoría, las pastillas de descuento y el comparador de tiendas usan `.glassEffect` teñido con los colores de marca.

## Datos y conexión

- **Arranque sin conexión.** Abre con el catálogo empaquetado y luego descarga el más reciente de `https://matiasgrande.github.io/landing-sigo/catalogo-asistente.json`, que se guarda en caché.
- **Tasa BCV.** Se consulta en `ve.dolarapi.com` y se guarda la última conocida.
- **Datos locales.** El carrito, la entrega, los sustitutos y los pedidos se guardan en el teléfono.
- **Pedidos de prototipo.** Los pedidos no se registran en ningún sistema: se envían por WhatsApp, igual que en la web.

## Pruebas del núcleo

```bash
cd ios
swift test
```

Las 10 pruebas cubren el catálogo real, la búsqueda con errores de tipeo, el IGTF al céntimo (18,50 → 0,56), los teléfonos, los formatos USD y Bs, la Pascua y las temporadas, las 12 recetas con productos reales y el comparador de tiendas. Corren en macOS y en Linux.

## Límites del prototipo

- La interfaz se escribió sin poder compilarla en Xcode (el entorno de trabajo era Linux). La lógica sí está compilada y probada. Puede hacer falta algún ajuste menor de API al compilar por primera vez.
- El ícono se generó desde el logo de 120 px. Con el logo en SVG o en alta resolución quedaría nítido.
- Las promociones son de ejemplo, porque sigo.com.ve hoy no publica descuentos.
