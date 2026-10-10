"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { TEXTO_SUSTITUTO, useTienda, type PasoCheckout, type PreferenciaSustituto } from "@/componentes/tienda/ContextoTienda";
import { registrarEvento } from "@/lib/tienda/eventos";
import { mensajePedido, plural } from "@/componentes/tienda/CarritoLateral";
import { useTasa } from "@/componentes/ContextoTasa";
import { IconoWhatsApp } from "@/componentes/Iconos";
import { ComparadorSucursales } from "@/componentes/tienda/Comparador";
import { TARIFAS_MUNICIPIO } from "@/datos/entregas";
import { WHATSAPP_ATENCION, WHATSAPP_PAGOS, crearEnlaceWhatsApp } from "@/datos/contacto";
import {
  MINIMO_COMPRA_USD,
  SUCURSALES_TIENDA,
  aCentimos,
  calcularIgtf,
  tarifaDelivery,
  type ClaveSucursal,
} from "@/lib/tienda/comercio";
import { formatearBs, formatearUsd } from "@/lib/useTasaBcv";

interface MetodoPago {
  id: string;
  nombre: string;
  detalle: string;
  confirmacion: string;
  /** Pago en divisas: aplica IGTF */
  igtf: boolean;
}

const METODOS_PAGO: MetodoPago[] = [
  { id: "pago-movil", nombre: "Pago Móvil", detalle: "En bolívares a la tasa BCV del día", confirmacion: "Confirmación inmediata", igtf: false },
  { id: "debito", nombre: "Tarjeta de débito", detalle: "Punto de venta al recibir o al retirar", confirmacion: "Al momento de la entrega", igtf: false },
  { id: "cashea", nombre: "Cashea", detalle: "Paga en cuotas con tu Línea Cotidiana", confirmacion: "Aprobación en la app de Cashea", igtf: false },
  { id: "zelle", nombre: "Zelle", detalle: "Te enviamos los datos al confirmar", confirmacion: "Verificación hasta 24 h", igtf: true },
  { id: "efectivo", nombre: "Efectivo en divisas", detalle: "Al recibir o al retirar", confirmacion: "Al momento de la entrega", igtf: true },
  { id: "paypal", nombre: "PayPal", detalle: "Se aplican las comisiones de PayPal", confirmacion: "Verificación hasta 24 h", igtf: true },
  { id: "sigo-creditos", nombre: "Sigo Créditos", detalle: "Saldo recargado por tu familia", confirmacion: "Confirmación inmediata", igtf: false },
];

/** Franjas con su hora de inicio (24 h) */
const FRANJAS: { texto: string; inicio: number }[] = [
  { texto: "10:00 a.m. – 12:00 m.", inicio: 10 },
  { texto: "12:00 m. – 2:00 p.m.", inicio: 12 },
  { texto: "2:00 p.m. – 4:00 p.m.", inicio: 14 },
  { texto: "4:00 p.m. – 7:00 p.m.", inicio: 16 },
];

/** "Hoy" solo si falta al menos una hora para que empiece la franja (hora de Margarita) */
function opcionesDeHorario(): string[] {
  const hora = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/Caracas" }).format(new Date()));
  return [
    ...FRANJAS.filter((f) => hora < f.inicio - 1).map((f) => `Hoy · ${f.texto}`),
    ...FRANJAS.map((f) => `Mañana · ${f.texto}`),
  ];
}

const CLAVE_DATOS = "sigo:checkout-datos";
const CLAVE_CONFIRMADO = "sigo:pedido-confirmado";

interface DatosCheckout {
  nombre: string;
  telefono: string;
  direccion: string;
  referencia: string;
  franja: string;
  metodo: string;
  /** "1" si es una compra para otra persona (familia en Margarita, regalo, compra desde el exterior) */
  paraOtro: string;
  receptorNombre: string;
  receptorTelefono: string;
}

interface PedidoConfirmado {
  numero: string;
  mensaje: string;
  /** Pagos en divisas y Pago Móvil van al WhatsApp de pagos */
  aPagos: boolean;
  /** Compra para otra persona: aviso listo para enviarle */
  aviso?: { nombre: string; enlace: string };
}

const DATOS_INICIALES: DatosCheckout = {
  nombre: "",
  telefono: "",
  direccion: "",
  referencia: "",
  franja: "",
  metodo: "pago-movil",
  paraOtro: "",
  receptorNombre: "",
  receptorTelefono: "",
};

/** Métodos cómodos para pagar desde fuera de Venezuela */
const DESDE_EL_EXTERIOR = new Set(["zelle", "paypal", "sigo-creditos"]);

function leerSesion<T>(clave: string, validar: (valor: unknown) => valor is T): T | null {
  try {
    const valor: unknown = JSON.parse(window.sessionStorage.getItem(clave) ?? "null");
    return validar(valor) ? valor : null;
  } catch {
    return null;
  }
}

function guardarSesion(clave: string, valor: unknown): void {
  try {
    if (valor === null) window.sessionStorage.removeItem(clave);
    else window.sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento: el formulario vive solo en memoria
  }
}

const esDatos = (v: unknown): v is DatosCheckout =>
  typeof v === "object" && v !== null && Object.keys(DATOS_INICIALES).every((k) => typeof (v as Record<string, unknown>)[k] === "string");
const esConfirmado = (v: unknown): v is PedidoConfirmado =>
  typeof v === "object" && v !== null && typeof (v as PedidoConfirmado).numero === "string" && typeof (v as PedidoConfirmado).mensaje === "string";

/** Teléfono venezolano: móvil 04xx o fijo 02xx, con o sin +58 y separadores */
function esTelefonoValido(texto: string): boolean {
  if (!/^[+\d\s().-]+$/.test(texto)) return false;
  let digitos = texto.replace(/\D/g, "");
  if (digitos.startsWith("58")) digitos = `0${digitos.slice(2)}`;
  return /^0[24]\d{9}$/.test(digitos) && !/^0(\d)\1{9}$/.test(digitos);
}

/** WhatsApp de cualquier país (quien compra puede estar fuera): +código y 8 a 15 dígitos, o un número venezolano */
function esTelefonoInternacional(texto: string): boolean {
  if (esTelefonoValido(texto)) return true;
  if (!/^\+[\d\s().-]+$/.test(texto)) return false;
  const digitos = texto.replace(/\D/g, "");
  return digitos.length >= 8 && digitos.length <= 15 && !/^(\d)\1+$/.test(digitos);
}

/** "0412 123 4567" -> "584121234567" para wa.me */
function aNumeroWhatsApp(texto: string): string {
  const digitos = texto.replace(/\D/g, "");
  return digitos.startsWith("0") ? `58${digitos.slice(1)}` : digitos;
}

/** Al menos `minimo` letras: descarta "123", "!!!" o "........" */
const tieneLetras = (texto: string, minimo: number) => (texto.match(/\p{L}/gu) ?? []).length >= minimo;

/** Número de pedido de demostración, sin repetirse entre visitas */
function crearNumeroPedido(): string {
  const aleatorio = new Uint32Array(1);
  window.crypto.getRandomValues(aleatorio);
  return `SG-${((aleatorio[0] ?? 0) % 1_000_000).toString().padStart(6, "0")}`;
}

export function Checkout() {
  const {
    lineas,
    lineasCobrables,
    subtotal,
    entrega,
    setEntrega,
    navegar,
    vaciar,
    ruta,
    cargando,
    indice,
    reintentarCatalogo,
    sustitutos,
    setSustituto,
    registrarPedido,
  } = useTienda();
  const { tasa } = useTasa();
  const paso = ruta.paso;
  const [datos, setDatos] = useState<DatosCheckout>(DATOS_INICIALES);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [errores, setErrores] = useState<Partial<Record<keyof DatosCheckout | "municipio", string>>>({});
  const [confirmado, setConfirmado] = useState<PedidoConfirmado | null>(null);
  const [restaurado, setRestaurado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const formulario = useRef<HTMLFormElement>(null);

  // Datos del formulario y pedido confirmado sobreviven a recargar la página (solo esta pestaña)
  useEffect(() => {
    const opciones = opcionesDeHorario();
    setHorarios(opciones);
    const guardados = leerSesion(CLAVE_DATOS, esDatos);
    setDatos({ ...(guardados ?? DATOS_INICIALES), franja: guardados && opciones.includes(guardados.franja) ? guardados.franja : (opciones[0] ?? "") });
    setConfirmado(leerSesion(CLAVE_CONFIRMADO, esConfirmado));
    setRestaurado(true);
  }, []);
  useEffect(() => {
    if (restaurado) guardarSesion(CLAVE_DATOS, datos);
  }, [datos, restaurado]);

  // Cada paso anuncia su título y lleva el foco a él
  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
  }, [paso, confirmado]);

  const envio = tarifaDelivery(entrega);
  const metodo = METODOS_PAGO.find((m) => m.id === datos.metodo) ?? METODOS_PAGO[0];
  const base = (aCentimos(subtotal) + aCentimos(envio ?? 0)) / 100;
  const igtf = metodo?.igtf ? calcularIgtf(base) : 0;
  const total = (aCentimos(base) + aCentimos(igtf)) / 100;
  const faltante = Math.max(0, aCentimos(MINIMO_COMPRA_USD) - aCentimos(subtotal)) / 100;
  const sinExistencia = lineas.length - lineasCobrables.length;

  const paraOtro = datos.paraOtro === "1";

  // Inicio de checkout para el panel (una vez por visita a esta pantalla)
  useEffect(() => {
    registrarEvento({ tipo: "checkout" });
  }, []);

  const pasoValido = (destino: PasoCheckout) => destino === 1 || Object.keys(validar()).length === 0;

  // Recargar o entrar con ?ps=2/3 sin datos válidos: se vuelve al paso 1
  useEffect(() => {
    if (restaurado && !cargando && paso > 1 && !pasoValido(paso)) navegar({ paso: 1 }, { reemplazar: true });
  }, [restaurado, cargando, paso]);

  function actualizar(campo: keyof DatosCheckout, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
    // El error se borra en cuanto se corrige el campo
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  }

  function validar(): typeof errores {
    const nuevos: typeof errores = {};
    if (!tieneLetras(datos.nombre, 3)) nuevos.nombre = "Escribe tu nombre y apellido.";
    if (paraOtro) {
      if (!esTelefonoInternacional(datos.telefono.trim())) nuevos.telefono = "Escribe tu WhatsApp con código de país, por ejemplo +1 305 555 0123.";
      if (!tieneLetras(datos.receptorNombre, 3)) nuevos.receptorNombre = "Escribe el nombre de quien recibe.";
      if (!esTelefonoValido(datos.receptorTelefono.trim())) nuevos.receptorTelefono = "Escribe un teléfono venezolano, por ejemplo 0412 1234567.";
    } else if (!esTelefonoValido(datos.telefono.trim())) {
      nuevos.telefono = "Escribe un teléfono válido, por ejemplo 0412 1234567.";
    }
    if (entrega.modo === "delivery") {
      if (tarifaDelivery(entrega) === null) nuevos.municipio = "Elige el municipio de entrega.";
      if (!tieneLetras(datos.direccion, 5)) nuevos.direccion = "Escribe la dirección (urbanización, calle, casa).";
    }
    return nuevos;
  }

  function alContinuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (faltante > 0 || lineasCobrables.length === 0) return;
    if (paso === 1) {
      const nuevos = validar();
      setErrores(nuevos);
      if (Object.keys(nuevos).length > 0) {
        // Primer campo con error en el orden visual (tras pintar los errores)
        window.requestAnimationFrame(() => formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }
    }
    if (paso < 3) {
      navegar({ paso: (paso + 1) as PasoCheckout });
      return;
    }
    const pedido: PedidoConfirmado = {
      numero: crearNumeroPedido(),
      aPagos: Boolean(metodo?.igtf || metodo?.id === "pago-movil"),
      mensaje: "",
    };
    pedido.mensaje = [
      mensajePedido(lineas, entrega, { subtotal, envio, igtf, total }, `¡Hola Sigo! Confirmo mi pedido ${pedido.numero}:`, sustitutos),
      `Pago: ${metodo?.nombre ?? ""}`,
      entrega.modo === "delivery" ? `Dirección: ${datos.direccion.trim()}${datos.referencia.trim() ? ` (${datos.referencia.trim()})` : ""}` : "",
      `Horario: ${datos.franja}`,
      paraOtro ? `Recibe: ${datos.receptorNombre.trim()} · ${datos.receptorTelefono.trim()}` : "",
      `${paraOtro ? "Compra y paga" : "A nombre de"}: ${datos.nombre.trim()} · ${datos.telefono.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    if (paraOtro) {
      const lugar = entrega.modo === "retiro" ? `para retirar en ${SUCURSALES_TIENDA[entrega.sucursal].nombre}` : `a ${datos.direccion.trim()}`;
      const texto = `¡Hola ${datos.receptorNombre.trim()}! Te envié un mercado de SIGO (pedido ${pedido.numero}) ${lugar}, ${datos.franja}. Un abrazo, ${datos.nombre.trim()}.`;
      pedido.aviso = { nombre: datos.receptorNombre.trim(), enlace: `https://wa.me/${aNumeroWhatsApp(datos.receptorTelefono)}?text=${encodeURIComponent(texto)}` };
    }
    // Historial en el dispositivo ("Comprar de nuevo") y registro para el panel interno
    registrarPedido({
      numero: pedido.numero,
      fecha: new Date().toISOString(),
      sucursal: entrega.sucursal,
      modo: entrega.modo,
      lineas: lineasCobrables.map((l) => ({ id: l.producto.id, cantidad: l.cantidad, nombre: l.producto.nombre })),
      total,
      ...(paraOtro ? { paraOtro: datos.receptorNombre.trim() } : {}),
    });
    registrarEvento({
      tipo: "pedido",
      numero: pedido.numero,
      total,
      articulos: lineasCobrables.reduce((suma, l) => suma + l.cantidad, 0),
      sucursal: entrega.sucursal,
      paraOtro,
    });
    // El pedido queda confirmado: el carrito se vacía ya (recargar no permite repetirlo)
    guardarSesion(CLAVE_CONFIRMADO, pedido);
    guardarSesion(CLAVE_DATOS, null);
    setConfirmado(pedido);
    vaciar();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (confirmado) {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="text-5xl" aria-hidden>
          🛒
        </p>
        <h1 ref={titulo} tabIndex={-1} className="mt-3 text-3xl font-black text-azul focus:outline-none">
          ¡Pedido {confirmado.numero} listo!
        </h1>
        <p className="mt-2 text-gris">
          Este es un prototipo: el pedido no se registró en la tienda. Para hacerlo real, envíalo por WhatsApp y un asesor lo confirma.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={crearEnlaceWhatsApp(confirmado.aPagos ? WHATSAPP_PAGOS : WHATSAPP_ATENCION, confirmado.mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-verde px-6 font-extrabold text-white hover:bg-verde-700"
          >
            <IconoWhatsApp className="h-5 w-5" /> Enviar pedido por WhatsApp
          </a>
          {confirmado.aviso && (
            <a
              href={confirmado.aviso.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-azul px-6 font-extrabold text-white hover:bg-azul-700"
            >
              <IconoWhatsApp className="h-5 w-5" /> Avisarle a {confirmado.aviso.nombre}
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              guardarSesion(CLAVE_CONFIRMADO, null);
              setConfirmado(null);
              navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, pagina: 1 });
            }}
            className="min-h-12 rounded-full font-extrabold text-azul ring-1 ring-azul/15"
          >
            Volver a la tienda
          </button>
        </div>
      </section>
    );
  }

  if (cargando || !restaurado) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center" aria-busy="true">
        <h1 className="text-2xl font-black text-azul">Cargando tu carrito…</h1>
        <div className="mx-auto mt-6 h-40 animate-pulse rounded-3xl bg-white" />
      </section>
    );
  }

  if (lineasCobrables.length === 0 || faltante > 0) {
    const catalogoCaido = indice?.origen === "demo";
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 ref={titulo} tabIndex={-1} className="text-2xl font-black text-azul focus:outline-none">
          {catalogoCaido
            ? "No pudimos cargar el catálogo"
            : lineasCobrables.length === 0
              ? "Tu carrito está vacío"
              : `Te faltan ${formatearUsd(faltante)} para la compra mínima`}
        </h1>
        <p className="mt-2 text-gris">
          {catalogoCaido
            ? "Revisa tu conexión: tu carrito sigue guardado."
            : lineasCobrables.length === 0
              ? sinExistencia > 0
                ? `Los productos de tu carrito no tienen existencia en ${SUCURSALES_TIENDA[entrega.sucursal].corto}.`
                : "Busca productos o escribe tu lista y la armamos por ti."
              : `La compra mínima es de ${formatearUsd(MINIMO_COMPRA_USD)} en productos con existencia.`}
        </p>
        <button
          type="button"
          onClick={() => (catalogoCaido ? reintentarCatalogo() : navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, pagina: 1 }))}
          className="mt-4 min-h-12 rounded-full bg-verde px-6 font-extrabold text-white"
        >
          {catalogoCaido ? "Reintentar" : "Seguir comprando"}
        </button>
      </section>
    );
  }

  const campo = "mt-1 h-12 w-full rounded-2xl bg-crema px-4 text-base text-tinta ring-1 ring-azul/10 focus:outline-none focus:ring-2 focus:ring-azul/40";
  const error = (clave: keyof typeof errores) =>
    errores[clave] ? (
      <span id={`error-${clave}`} className="mt-1 block text-sm font-bold text-[#b4371c]">
        {errores[clave]}
      </span>
    ) : null;
  const atributosError = (clave: keyof typeof errores) => ({
    name: clave,
    "aria-invalid": Boolean(errores[clave]),
    "aria-describedby": errores[clave] ? `error-${clave}` : undefined,
  });
  const cantidadErrores = Object.values(errores).filter(Boolean).length;
  const TITULOS: Record<PasoCheckout, string> = { 1: "¿Cómo y dónde lo recibes?", 2: "¿Cómo pagas?", 3: "Revisa y confirma" };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form ref={formulario} onSubmit={alContinuar} noValidate className="min-w-0">
        <ol className="flex gap-2 text-sm font-bold" aria-label="Pasos de la compra">
          {["Entrega", "Pago", "Confirmar"].map((nombre, i) => (
            <li
              key={nombre}
              aria-current={paso === i + 1 ? "step" : undefined}
              className={`flex-1 rounded-full px-3 py-2 text-center ${paso === i + 1 ? "bg-azul text-white" : paso > i + 1 ? "bg-verde-100 text-verde" : "bg-white text-gris ring-1 ring-azul/10"}`}
            >
              {i + 1}. {nombre}
            </li>
          ))}
        </ol>

        <h1 ref={titulo} tabIndex={-1} className="mt-6 text-2xl font-black text-azul focus:outline-none">
          <span className="sr-only">Paso {paso} de 3: </span>
          {TITULOS[paso]}
        </h1>

        {cantidadErrores > 0 && (
          <p role="alert" className="mt-3 rounded-2xl bg-[#fdece8] p-3 text-sm font-bold text-[#b4371c]">
            Revisa {plural(cantidadErrores, "campo")} marcado{cantidadErrores === 1 ? "" : "s"} para continuar.
          </p>
        )}

        {sinExistencia > 0 && (
          <p className="mt-3 rounded-2xl bg-sol/30 p-3 text-sm font-bold text-azul">
            {plural(sinExistencia, "producto")} sin existencia en {SUCURSALES_TIENDA[entrega.sucursal].corto} no se incluye
            {sinExistencia === 1 ? "" : "n"} en este pedido.
          </p>
        )}

        {paso === 1 && (
          <fieldset className="mt-4 space-y-4">
            <legend className="sr-only">Entrega y contacto</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["delivery", "retiro"] as const).map((modo) => (
                <label key={modo} className={`flex min-h-14 cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 font-extrabold ${entrega.modo === modo ? "border-azul bg-azul-100 text-azul" : "border-azul/10"}`}>
                  <input type="radio" name="modo" checked={entrega.modo === modo} onChange={() => setEntrega({ ...entrega, modo })} className="accent-azul" />
                  {modo === "delivery" ? "Delivery" : "Retiro en tienda"}
                </label>
              ))}
            </div>
            {entrega.modo === "delivery" ? (
              <>
                <label className="block">
                  <span className="text-sm font-bold text-azul">Municipio</span>
                  <select
                    value={entrega.municipio ?? ""}
                    onChange={(e) => {
                      setEntrega({ ...entrega, municipio: e.target.value || null });
                      setErrores((actual) => ({ ...actual, municipio: undefined }));
                    }}
                    className={campo}
                    {...atributosError("municipio")}
                  >
                    <option value="">Elige tu municipio</option>
                    {TARIFAS_MUNICIPIO.map((t) => (
                      <option key={t.municipio} value={t.municipio}>
                        {t.municipio} · envío {formatearUsd(t.tarifaUsd)}
                      </option>
                    ))}
                  </select>
                  {error("municipio")}
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-azul">Dirección</span>
                  <input
                    value={datos.direccion}
                    onChange={(e) => actualizar("direccion", e.target.value)}
                    autoComplete="street-address"
                    placeholder="Urbanización, calle, casa o apartamento"
                    maxLength={200}
                    className={campo}
                    {...atributosError("direccion")}
                  />
                  {error("direccion")}
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-azul">Punto de referencia (opcional)</span>
                  <input value={datos.referencia} onChange={(e) => actualizar("referencia", e.target.value)} maxLength={120} className={campo} />
                </label>
              </>
            ) : (
              <fieldset>
                <legend className="text-sm font-bold text-azul">Tienda de retiro</legend>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(Object.keys(SUCURSALES_TIENDA) as ClaveSucursal[]).map((clave) => (
                    <label key={clave} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 font-bold ${entrega.sucursal === clave ? "border-verde bg-verde-100 text-verde" : "border-azul/10"}`}>
                      <input type="radio" name="sucursal-retiro" checked={entrega.sucursal === clave} onChange={() => setEntrega({ ...entrega, sucursal: clave })} className="accent-verde" />
                      {SUCURSALES_TIENDA[clave].corto}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <label className="block">
              <span className="text-sm font-bold text-azul">{entrega.modo === "delivery" ? "Horario de entrega" : "Horario de retiro"}</span>
              <select value={datos.franja} onChange={(e) => actualizar("franja", e.target.value)} className={campo}>
                {horarios.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl bg-sol/25 p-4">
              <input
                type="checkbox"
                checked={paraOtro}
                onChange={(e) => actualizar("paraOtro", e.target.checked ? "1" : "")}
                className="mt-1 h-5 w-5 shrink-0 accent-azul"
              />
              <span>
                <span className="block font-extrabold text-azul">Es para otra persona</span>
                <span className="block text-sm text-gris">
                  Ideal si estás fuera de Venezuela: pagas tú y tu familia en Margarita lo recibe.
                </span>
              </span>
            </label>
            {paraOtro && (
              <fieldset className="grid gap-4 rounded-2xl bg-white p-4 ring-1 ring-azul/10 sm:grid-cols-2">
                <legend className="px-1 text-sm font-extrabold text-azul">¿Quién recibe?</legend>
                <label className="block">
                  <span className="text-sm font-bold text-azul">Nombre de quien recibe</span>
                  <input
                    value={datos.receptorNombre}
                    onChange={(e) => actualizar("receptorNombre", e.target.value)}
                    maxLength={80}
                    className={campo}
                    {...atributosError("receptorNombre")}
                  />
                  {error("receptorNombre")}
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-azul">Su teléfono en Venezuela</span>
                  <input
                    value={datos.receptorTelefono}
                    onChange={(e) => actualizar("receptorTelefono", e.target.value)}
                    type="tel"
                    inputMode="tel"
                    placeholder="0412 1234567"
                    maxLength={20}
                    className={campo}
                    {...atributosError("receptorTelefono")}
                  />
                  {error("receptorTelefono")}
                </label>
              </fieldset>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-azul">{paraOtro ? "Tu nombre y apellido" : "Nombre y apellido"}</span>
                <input
                  value={datos.nombre}
                  onChange={(e) => actualizar("nombre", e.target.value)}
                  autoComplete="name"
                  maxLength={80}
                  className={campo}
                  {...atributosError("nombre")}
                />
                {error("nombre")}
              </label>
              <label className="block">
                <span className="text-sm font-bold text-azul">{paraOtro ? "Tu WhatsApp (de cualquier país)" : "Teléfono"}</span>
                <input
                  value={datos.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={paraOtro ? "+1 305 555 0123" : "0412 1234567"}
                  maxLength={20}
                  className={campo}
                  {...atributosError("telefono")}
                />
                {error("telefono")}
              </label>
            </div>
            <p className="text-sm text-gris">No necesitas crear una cuenta para comprar.</p>
          </fieldset>
        )}

        {paso === 2 && (
          <fieldset className="mt-4">
            <legend className="sr-only">Método de pago</legend>
            <div className="space-y-2">
              {METODOS_PAGO.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${datos.metodo === m.id ? "border-azul bg-azul-100" : "border-azul/10 bg-white"}`}>
                  <input type="radio" name="metodo" checked={datos.metodo === m.id} onChange={() => actualizar("metodo", m.id)} className="mt-1 accent-azul" />
                  <span className="min-w-0">
                    <span className="block font-extrabold text-azul">
                      {m.nombre}
                      {m.igtf && <span className="ml-2 rounded-full bg-sol px-2 py-0.5 text-xs text-azul">+ IGTF 3 %</span>}
                      {paraOtro && DESDE_EL_EXTERIOR.has(m.id) && (
                        <span className="ml-2 rounded-full bg-verde px-2 py-0.5 text-xs text-white">Ideal desde el exterior</span>
                      )}
                    </span>
                    <span className="block text-sm text-gris">
                      {m.detalle} · {m.confirmacion}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {paso === 3 && (
          <div className="mt-4 space-y-4">
            <dl className="space-y-2 rounded-3xl bg-white p-4 text-sm ring-1 ring-azul/5">
              <div>
                <dt className="font-bold text-gris">Entrega</dt>
                <dd className="font-semibold [overflow-wrap:anywhere]">
                  {entrega.modo === "retiro"
                    ? `Retiro en ${SUCURSALES_TIENDA[entrega.sucursal].nombre}`
                    : `Delivery a ${entrega.municipio}: ${datos.direccion}${datos.referencia.trim() ? ` (${datos.referencia})` : ""}`}
                  {` · ${datos.franja}`}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gris">Pago</dt>
                <dd className="font-semibold">
                  {metodo?.nombre} · {metodo?.confirmacion}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gris">{paraOtro ? "Compra y paga" : "Contacto"}</dt>
                <dd className="font-semibold [overflow-wrap:anywhere]">
                  {datos.nombre} · {datos.telefono}
                </dd>
              </div>
              {paraOtro && (
                <div>
                  <dt className="font-bold text-gris">Recibe</dt>
                  <dd className="font-semibold [overflow-wrap:anywhere]">
                    {datos.receptorNombre} · {datos.receptorTelefono}
                  </dd>
                </div>
              )}
            </dl>
            <div className="rounded-3xl bg-white px-4 py-3 text-sm ring-1 ring-azul/5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-black text-azul">Si algo no está al preparar tu pedido</h2>
                <label className="flex items-center gap-2 text-xs font-bold text-gris">
                  Para todos:
                  <select
                    onChange={(e) => {
                      const valor = e.target.value as PreferenciaSustituto;
                      lineasCobrables.forEach((l) => setSustituto(l.producto.id, valor));
                    }}
                    value=""
                    className="min-h-9 rounded-full bg-crema px-2 text-xs font-bold text-azul"
                  >
                    <option value="" disabled>
                      Elegir
                    </option>
                    {(Object.keys(TEXTO_SUSTITUTO) as PreferenciaSustituto[]).map((p) => (
                      <option key={p} value={p}>
                        {TEXTO_SUSTITUTO[p]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ul className="mt-2 divide-y divide-azul-100">
                {lineasCobrables.map((l) => (
                  <li key={l.producto.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                    <span className="min-w-0 flex-1">
                      {l.cantidad} × {l.producto.nombre}
                    </span>
                    <span className="shrink-0 font-bold">{formatearUsd(l.subtotal)}</span>
                    <label className="w-full">
                      <span className="sr-only">Si no hay {l.producto.nombre}</span>
                      <select
                        value={sustitutos[l.producto.id] ?? "similar"}
                        onChange={(e) => setSustituto(l.producto.id, e.target.value as PreferenciaSustituto)}
                        className="min-h-9 w-full rounded-full bg-crema px-3 text-xs font-bold text-azul sm:w-auto"
                      >
                        {(Object.keys(TEXTO_SUSTITUTO) as PreferenciaSustituto[]).map((p) => (
                          <option key={p} value={p}>
                            Si no hay: {TEXTO_SUSTITUTO[p].toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {paso > 1 && (
            <button type="button" onClick={() => window.history.back()} className="min-h-12 rounded-full px-5 font-extrabold text-azul ring-1 ring-azul/15">
              Atrás
            </button>
          )}
          <button type="submit" className="min-h-12 flex-1 rounded-full bg-verde px-5 font-extrabold text-white transition hover:bg-verde-700">
            {paso === 3 ? `Confirmar pedido · ${formatearUsd(total)}` : "Continuar"}
          </button>
        </div>
      </form>

      {/* Resumen siempre visible */}
      <aside className="h-fit rounded-3xl bg-white p-5 ring-1 ring-azul/5 lg:sticky lg:top-40" aria-label="Resumen del pedido">
        <h2 className="font-black text-azul">Resumen</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-gris">Productos ({lineasCobrables.reduce((suma, l) => suma + l.cantidad, 0)})</dt>
            <dd className="font-bold">{formatearUsd(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gris">{entrega.modo === "retiro" ? "Retiro" : "Envío"}</dt>
            <dd className="font-bold">{entrega.modo === "retiro" ? "Gratis" : envio !== null ? formatearUsd(envio) : "—"}</dd>
          </div>
          {igtf > 0 && (
            <div className="flex justify-between">
              <dt className="text-gris">IGTF (3 %)</dt>
              <dd className="font-bold">{formatearUsd(igtf)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-azul-100 pt-2 text-base">
            <dt className="font-black text-azul">Total</dt>
            <dd className="text-right">
              <span className="font-black text-azul">{formatearUsd(total)}</span>
              {tasa && <span className="block text-xs text-gris">{formatearBs(total, tasa.valor)}</span>}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <ComparadorSucursales compacto />
        </div>
        <button type="button" onClick={() => navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null, pagina: 1 })} className="mt-4 min-h-11 text-sm font-extrabold text-verde">
          ← Seguir comprando
        </button>
      </aside>
    </section>
  );
}
