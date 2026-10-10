// Iconos SVG en línea para no depender de librerías externas
import type { SVGProps } from "react";

type PropsIcono = SVGProps<SVGSVGElement>;

const base: PropsIcono = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconoWhatsApp(props: PropsIcono) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.43 1.32-1.97 1.37-.5.05-.97.23-3.28-.68-2.78-1.1-4.54-3.95-4.68-4.13-.13-.18-1.12-1.49-1.12-2.84s.71-2.02.96-2.29c.25-.28.55-.34.73-.34l.53.01c.17 0 .4-.06.62.48.24.56.8 1.94.86 2.08.07.14.12.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.14-.28.29-.12.57.16.27.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.17-.18.7-.82.89-1.1.18-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.28.13.46.2.53.32.07.11.07.66-.17 1.33Z" />
    </svg>
  );
}

export function IconoCarrito(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2.5 3h2.2l2.4 11.2a1.8 1.8 0 0 0 1.8 1.4h8.6a1.8 1.8 0 0 0 1.7-1.3L21 7H6" />
    </svg>
  );
}

export function IconoUbicacion(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function IconoFlecha(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconoEnviar(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function IconoChat(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </svg>
  );
}

export function IconoTienda(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9.5 4.5 4h15L21 9.5" />
      <path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M5 12v8h14v-8M10 20v-5h4v5" />
    </svg>
  );
}

export function IconoMoto(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M8.5 17h6l3-6h-4l-2-4H9M14.5 11 12 17" />
    </svg>
  );
}

export function IconoCamion(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

export function IconoCarro(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16V12l2-5h12l2 5v4" />
      <path d="M3 16h18v2H3z" />
      <circle cx="7.5" cy="12.5" r=".8" />
      <circle cx="16.5" cy="12.5" r=".8" />
    </svg>
  );
}

export function IconoReloj(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconoCorazon(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.2 4 4 7.4 4c2 0 3.5 1.1 4.6 2.7C13.1 5.1 14.6 4 16.6 4 20 4 22.4 7.2 21.2 10.6 19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function IconoGlobo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function IconoMenos(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconoMas(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoCerrar(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconoMenu(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconoInstagram(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
    </svg>
  );
}

export function IconoFacebook(props: PropsIcono) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3Z" />
    </svg>
  );
}

export function IconoCorreo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconoTrofeo(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
    </svg>
  );
}

export function IconoBuscar(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconoCasa(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconoMarcador(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function IconoFiltro(props: PropsIcono) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}
