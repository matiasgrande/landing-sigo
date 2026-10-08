# Landing SIGO Supermercados

Propuesta de landing page institucional para **SIGO Supermercados** (Isla de Margarita, desde 1972).

- **Vista previa:** https://matiasgrande.github.io/landing-sigo/
- **Análisis de mercado:** [`docs/analisis-competencia.md`](docs/analisis-competencia.md) (informes completos en `docs/investigacion/`)

## Stack

- Next.js (App Router, exportación estática) + TypeScript estricto
- Tailwind CSS v4
- Motion (animaciones ligadas al scroll)

## Secciones

1. Hero con propuesta de marca y vista previa del asistente
2. Cifras animadas
3. **Asistente "Escribe tu lista"**: convierte texto libre en un carrito (demo con catálogo referencial) y lo envía por WhatsApp
4. Tiendas (8) con filtro por formato y "Cómo llegar"
5. Modalidades de entrega + calculadora de tarifa por municipio
6. Sigo Créditos y formas de pago
7. Historia (línea de tiempo con scroll)
8. Comunidad y marcas aliadas
9. Empleo, proveedores, llamado final y pie de página

La tasa BCV se consulta en vivo (`ve.dolarapi.com`) y se guarda la última conocida por si falla la conexión.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # verificación de tipos
npm run build      # genera ./out
```

## Despliegue

Cada push a `main` o `claude/propuesta-landing` ejecuta `.github/workflows/desplegar.yml`, que construye el sitio y lo publica en la rama `gh-pages`.

Configuración única en GitHub: **Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`**.
