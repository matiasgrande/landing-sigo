"use client";

import { useState, type FormEvent } from "react";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { mensajePedido } from "@/componentes/tienda/CarritoLateral";
import { useTasa } from "@/componentes/ContextoTasa";
import { IconoWhatsApp } from "@/componentes/Iconos";
import { TARIFAS_MUNICIPIO } from "@/datos/entregas";
import { WHATSAPP_ATENCION, WHATSAPP_PAGOS, crearEnlaceWhatsApp } from "@/datos/contacto";
import { MINIMO_COMPRA_USD, SUCURSALES_TIENDA, TASA_IGTF, tarifaDelivery, type ClaveSucursal } from "@/lib/tienda/comercio";
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

const FRANJAS = ["10:00 a.m. – 12:00 m.", "12:00 m. – 2:00 p.m.", "2:00 p.m. – 4:00 p.m.", "4:00 p.m. – 7:00 p.m."];

type Paso = 1 | 2 | 3;

export function Checkout() {
  const { lineas, subtotal, entrega, setEntrega, navegar, vaciar } = useTienda();
  const { tasa } = useTasa();
  const [paso, setPaso] = useState<Paso>(1);
  const [datos, setDatos] = useState({ nombre: "", telefono: "", direccion: "", referencia: "", franja: FRANJAS[0] ?? "", metodo: "pago-movil" });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [confirmado, setConfirmado] = useState<{ numero: string; total: number } | null>(null);

  const envio = tarifaDelivery(entrega) ?? 0;
  const metodo = METODOS_PAGO.find((m) => m.id === datos.metodo) ?? METODOS_PAGO[0];
  const igtf = metodo?.igtf ? Math.round((subtotal + envio) * TASA_IGTF * 100) / 100 : 0;
  const total = Math.round((subtotal + envio + igtf) * 100) / 100;
  const actualizar = (campo: keyof typeof datos, valor: string) => setDatos((d) => ({ ...d, [campo]: valor }));

  if (confirmado) {
    const resumen = mensajePedido(lineas, entrega, confirmado.total, `¡Hola Sigo! Confirmo mi pedido ${confirmado.numero}:`);
    const detalle = [
      resumen,
      `Pago: ${metodo?.nombre ?? ""}`,
      entrega.modo === "delivery" ? `Dirección: ${datos.direccion} (${datos.referencia})` : "",
      `Horario: ${datos.franja}`,
      `A nombre de: ${datos.nombre} · ${datos.telefono}`,
    ]
      .filter(Boolean)
      .join("\n");
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="text-5xl" aria-hidden>
          🛒
        </p>
        <h1 className="mt-3 text-3xl font-black text-azul">¡Pedido {confirmado.numero} listo!</h1>
        <p className="mt-2 text-gris">
          Este es un prototipo: el pedido no se registró en la tienda. Para hacerlo real, envíalo por WhatsApp y un asesor lo confirma.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={crearEnlaceWhatsApp(metodo?.igtf || metodo?.id === "pago-movil" ? WHATSAPP_PAGOS : WHATSAPP_ATENCION, detalle)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-verde px-6 font-extrabold text-white hover:bg-verde-700"
          >
            <IconoWhatsApp className="h-5 w-5" /> Enviar pedido por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              vaciar();
              navegar({ vista: "inicio", departamento: null, categoria: null, consulta: null });
            }}
            className="min-h-12 rounded-full font-extrabold text-azul ring-1 ring-azul/15"
          >
            Volver a la tienda
          </button>
        </div>
      </section>
    );
  }

  if (lineas.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-azul">Tu carrito está vacío</h1>
        <button type="button" onClick={() => navegar({ vista: "inicio" })} className="mt-4 min-h-12 rounded-full bg-verde px-6 font-extrabold text-white">
          Ir a la tienda
        </button>
      </section>
    );
  }

  function validarEntrega(): boolean {
    const nuevos: Record<string, string> = {};
    if (datos.nombre.trim().length < 3) nuevos.nombre = "Escribe tu nombre y apellido.";
    if (!/^\+?[\d\s-]{10,15}$/.test(datos.telefono.trim())) nuevos.telefono = "Escribe un teléfono válido, por ejemplo 0412 1234567.";
    if (entrega.modo === "delivery") {
      if (!entrega.municipio) nuevos.municipio = "Elige el municipio de entrega.";
      if (datos.direccion.trim().length < 8) nuevos.direccion = "Escribe la dirección (urbanización, calle, casa).";
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function alContinuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (paso === 1 && !validarEntrega()) return;
    if (paso < 3) {
      setPaso((paso + 1) as Paso);
      window.scrollTo({ top: 0 });
      return;
    }
    if (subtotal < MINIMO_COMPRA_USD) return;
    const numero = `SG-${Date.now().toString().slice(-6)}`;
    setConfirmado({ numero, total });
  }

  const campo = "mt-1 h-12 w-full rounded-2xl bg-crema px-4 text-base text-tinta ring-1 ring-azul/10 focus:outline-none focus:ring-2 focus:ring-azul/40";
  const error = (clave: string) =>
    errores[clave] ? (
      <span id={`error-${clave}`} className="mt-1 block text-sm font-bold text-[#b4371c]">
        {errores[clave]}
      </span>
    ) : null;

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form onSubmit={alContinuar} noValidate className="min-w-0">
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

        {paso === 1 && (
          <fieldset className="mt-6 space-y-4">
            <legend className="text-2xl font-black text-azul">¿Cómo y dónde lo recibes?</legend>
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
                    onChange={(e) => setEntrega({ ...entrega, municipio: e.target.value || null })}
                    className={campo}
                    aria-invalid={Boolean(errores.municipio)}
                    aria-describedby={errores.municipio ? "error-municipio" : undefined}
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
                    className={campo}
                    aria-invalid={Boolean(errores.direccion)}
                    aria-describedby={errores.direccion ? "error-direccion" : undefined}
                  />
                  {error("direccion")}
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-azul">Punto de referencia (opcional)</span>
                  <input value={datos.referencia} onChange={(e) => actualizar("referencia", e.target.value)} className={campo} />
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
                {FRANJAS.map((f) => (
                  <option key={f} value={f}>
                    Hoy · {f}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-azul">Nombre y apellido</span>
                <input
                  value={datos.nombre}
                  onChange={(e) => actualizar("nombre", e.target.value)}
                  autoComplete="name"
                  className={campo}
                  aria-invalid={Boolean(errores.nombre)}
                  aria-describedby={errores.nombre ? "error-nombre" : undefined}
                />
                {error("nombre")}
              </label>
              <label className="block">
                <span className="text-sm font-bold text-azul">Teléfono</span>
                <input
                  value={datos.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0412 1234567"
                  className={campo}
                  aria-invalid={Boolean(errores.telefono)}
                  aria-describedby={errores.telefono ? "error-telefono" : undefined}
                />
                {error("telefono")}
              </label>
            </div>
            <p className="text-sm text-gris">No necesitas crear una cuenta para comprar.</p>
          </fieldset>
        )}

        {paso === 2 && (
          <fieldset className="mt-6">
            <legend className="text-2xl font-black text-azul">¿Cómo pagas?</legend>
            <div className="mt-4 space-y-2">
              {METODOS_PAGO.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${datos.metodo === m.id ? "border-azul bg-azul-100" : "border-azul/10 bg-white"}`}>
                  <input type="radio" name="metodo" checked={datos.metodo === m.id} onChange={() => actualizar("metodo", m.id)} className="mt-1 accent-azul" />
                  <span className="min-w-0">
                    <span className="block font-extrabold text-azul">
                      {m.nombre}
                      {m.igtf && <span className="ml-2 rounded-full bg-sol px-2 py-0.5 text-xs text-azul">+ IGTF 3 %</span>}
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
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-black text-azul">Revisa y confirma</h2>
            <dl className="space-y-2 rounded-3xl bg-white p-4 text-sm ring-1 ring-azul/5">
              <div>
                <dt className="font-bold text-gris">Entrega</dt>
                <dd className="font-semibold">
                  {entrega.modo === "retiro"
                    ? `Retiro en ${SUCURSALES_TIENDA[entrega.sucursal].nombre}`
                    : `Delivery a ${entrega.municipio}: ${datos.direccion}${datos.referencia ? ` (${datos.referencia})` : ""}`}
                  {` · Hoy ${datos.franja}`}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gris">Pago</dt>
                <dd className="font-semibold">
                  {metodo?.nombre} · {metodo?.confirmacion}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-gris">Contacto</dt>
                <dd className="font-semibold">
                  {datos.nombre} · {datos.telefono}
                </dd>
              </div>
            </dl>
            <ul className="divide-y divide-azul-100 rounded-3xl bg-white px-4 text-sm ring-1 ring-azul/5">
              {lineas.map((l) => (
                <li key={l.producto.id} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0">
                    {l.cantidad} × {l.producto.nombre}
                  </span>
                  <span className="shrink-0 font-bold">{formatearUsd(l.subtotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {paso > 1 && (
            <button type="button" onClick={() => setPaso((paso - 1) as Paso)} className="min-h-12 rounded-full px-5 font-extrabold text-azul ring-1 ring-azul/15">
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
            <dt className="text-gris">Productos ({lineas.length})</dt>
            <dd className="font-bold">{formatearUsd(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gris">{entrega.modo === "retiro" ? "Retiro" : "Envío"}</dt>
            <dd className="font-bold">{entrega.modo === "retiro" ? "Gratis" : entrega.municipio ? formatearUsd(envio) : "—"}</dd>
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
        <button type="button" onClick={() => navegar({ vista: "inicio" })} className="mt-4 min-h-11 text-sm font-extrabold text-verde">
          ← Seguir comprando
        </button>
      </aside>
    </section>
  );
}
