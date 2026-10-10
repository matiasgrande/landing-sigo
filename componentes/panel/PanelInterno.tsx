"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ProductoCatalogo } from "@/datos/catalogo";
import { useTienda } from "@/componentes/tienda/ContextoTienda";
import { RECETAS } from "@/datos/temporadas";
import { buscarProductos } from "@/lib/tienda/buscar";
import { SUCURSALES_TIENDA, aCentimos, nombreLegible, precioRegularEn } from "@/lib/tienda/comercio";
import { CLAVE_EVENTOS, guardarEventos, leerEventos, type Evento } from "@/lib/tienda/eventos";
import { guardarPromociones, hoyEnMargarita, leerPromociones, promocionesDeEjemplo, type Promocion } from "@/lib/tienda/promociones";
import { formatearUsd } from "@/lib/useTasaBcv";

const DIA_MS = 86_400_000;

/** Cifra destacada: el número es el protagonista, la etiqueta lo nombra */
function Cifra({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-azul/5">
      <p className="text-xs font-extrabold uppercase tracking-wider text-gris">{etiqueta}</p>
      <p className="mt-1 text-3xl font-black text-azul">{valor}</p>
      {detalle && <p className="text-xs text-gris">{detalle}</p>}
    </div>
  );
}

/** Ranking en barras horizontales de una sola serie: etiqueta y valor en texto, la barra solo da la proporción */
function Ranking({ titulo, filas, vacio, formato = (n: number) => n.toLocaleString("es-VE") }: {
  titulo: string;
  filas: { etiqueta: string; valor: number; detalle?: string }[];
  vacio: string;
  formato?: (n: number) => string;
}) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <section className="rounded-3xl bg-white p-4 ring-1 ring-azul/5" aria-label={titulo}>
      <h2 className="font-black text-azul">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="mt-2 text-sm text-gris">{vacio}</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {filas.map((fila) => (
            <li key={fila.etiqueta} className="text-sm" title={`${fila.etiqueta}: ${formato(fila.valor)}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-semibold text-tinta">{fila.etiqueta}</span>
                <span className="shrink-0 font-black text-azul">{formato(fila.valor)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-azul-100" aria-hidden>
                <div className="h-2 rounded-full bg-verde" style={{ width: `${Math.max(2, (fila.valor / maximo) * 100)}%` }} />
              </div>
              {fila.detalle && <p className="text-xs text-gris">{fila.detalle}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function contar<T>(elementos: T[], clave: (e: T) => string): Map<string, number> {
  const mapa = new Map<string, number>();
  elementos.forEach((e) => mapa.set(clave(e), (mapa.get(clave(e)) ?? 0) + 1));
  return mapa;
}

const top = (mapa: Map<string, number>, n = 8) => [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

/** Uso simulado de 30 días con productos reales, para presentar el panel sin esperar tráfico */
function crearDatosDemostracion(productos: ProductoCatalogo[]): Evento[] {
  const ahora = Date.now();
  const azar = (n: number) => Math.floor(Math.random() * n);
  const buscadas = ["harina pan", "arroz", "queso blanco", "cafe", "aceite", "pollo", "cerveza polar", "detergente", "pañales", "leche"];
  // Lo que la gente busca y la tienda en línea no vende: el hallazgo más útil para compras
  const sinResultado = ["pernil", "cazon", "hielo", "queso de mano", "pescado fresco", "carne para mechar", "ají dulce"];
  const disponibles = productos.filter((p) => p.disponible !== false && p.imagen);
  const eventos: Evento[] = [];
  for (let dia = 29; dia >= 0; dia--) {
    const base = ahora - dia * DIA_MS;
    const pedidosDelDia = 2 + azar(6);
    for (let i = 0; i < pedidosDelDia * 6; i++) {
      const t = base - azar(DIA_MS / 2);
      if (Math.random() < 0.2) {
        eventos.push({ tipo: "busqueda", consulta: sinResultado[azar(sinResultado.length)] ?? "pernil", resultados: 0, t });
      } else {
        eventos.push({ tipo: "busqueda", consulta: buscadas[azar(buscadas.length)] ?? "arroz", resultados: 20 + azar(80), t });
      }
      const producto = disponibles[azar(Math.min(disponibles.length, 120))];
      if (producto) eventos.push({ tipo: "agregar", id: producto.id, cantidad: 1 + azar(3), t });
    }
    for (let i = 0; i < pedidosDelDia + 2 + azar(3); i++) eventos.push({ tipo: "checkout", t: base - azar(DIA_MS / 2) });
    for (let i = 0; i < pedidosDelDia; i++) {
      eventos.push({
        tipo: "pedido",
        numero: `DEMO-${dia}-${i}`,
        total: 15 + azar(9000) / 100,
        articulos: 4 + azar(20),
        sucursal: Math.random() < 0.6 ? "costazul" : "sambil",
        paraOtro: Math.random() < 0.18,
        t: base - azar(DIA_MS / 2),
      });
    }
    if (Math.random() < 0.6) eventos.push({ tipo: "receta", receta: RECETAS[azar(RECETAS.length)]?.id ?? "arepas", t: base });
  }
  return eventos.sort((a, b) => a.t - b.t);
}

function GestorPromociones() {
  const { indice } = useTienda();
  const [promociones, setPromociones] = useState<Promocion[] | null>(null);
  const [consulta, setConsulta] = useState("");
  const [descuento, setDescuento] = useState(10);
  const [hasta, setHasta] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    setPromociones(leerPromociones());
    const dentroDeUnaSemana = new Date(Date.now() + 7 * DIA_MS);
    setHasta(hoyEnMargarita(dentroDeUnaSemana));
  }, []);

  const porId = useMemo(() => new Map(indice?.entradas.map((e) => [e.producto.id, e.producto]) ?? []), [indice]);
  const lista = promociones ?? (indice ? promocionesDeEjemplo(indice) : []);
  const candidatos = useMemo(
    () => (indice && consulta.trim().length >= 2 ? buscarProductos(indice, consulta).productos.slice(0, 6) : []),
    [indice, consulta],
  );

  function guardar(nuevas: Promocion[]) {
    guardarPromociones(nuevas);
    setPromociones(nuevas);
  }

  function crear(producto: ProductoCatalogo, evento?: FormEvent) {
    evento?.preventDefault();
    const limpio = Math.min(90, Math.max(1, Math.round(descuento)));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(hasta) || hasta < hoyEnMargarita()) {
      setAviso("Elige una fecha de fin a partir de hoy.");
      return;
    }
    guardar([{ id: producto.id, descuento: limpio, hasta }, ...lista.filter((p) => p.id !== producto.id && !p.ejemplo)]);
    setAviso(`Promoción creada: ${producto.nombre} -${limpio}% hasta el ${hasta}.`);
    setConsulta("");
  }

  return (
    <section className="rounded-3xl bg-white p-4 ring-1 ring-azul/5" aria-labelledby="titulo-promociones">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="titulo-promociones" className="font-black text-azul">
          Promociones de la tienda
        </h2>
        {promociones !== null && (
          <button type="button" onClick={() => guardar(indice ? promocionesDeEjemplo(indice) : [])} className="min-h-11 text-sm font-bold text-gris underline">
            Restaurar las de ejemplo
          </button>
        )}
      </div>
      <p className="text-sm text-gris">
        sigo.com.ve hoy no publica descuentos. Desde aquí SIGO crearía sus promociones; se ven al instante en la tienda de este dispositivo.
      </p>

      <ul className="mt-3 divide-y divide-azul-100 text-sm">
        {lista.map((promocion) => {
          const producto = porId.get(promocion.id);
          const vencida = promocion.hasta < hoyEnMargarita();
          return (
            <li key={promocion.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <span className="min-w-0 flex-1 font-semibold">{producto?.nombre ?? `Producto ${promocion.id}`}</span>
              <span className="rounded-full bg-coral-700 px-2 py-0.5 text-xs font-extrabold text-white">-{promocion.descuento}%</span>
              <span className={`text-xs font-bold ${vencida ? "text-[#b4371c]" : "text-gris"}`}>
                {vencida ? "Vencida" : `Hasta ${promocion.hasta}`}
                {promocion.ejemplo && " · ejemplo"}
              </span>
              <button
                type="button"
                onClick={() => guardar(lista.filter((p) => p.id !== promocion.id))}
                className="min-h-11 px-2 text-xs font-bold text-gris hover:text-[#b4371c]"
                aria-label={`Quitar promoción de ${producto?.nombre ?? promocion.id}`}
              >
                Quitar
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={(e) => (candidatos[0] ? crear(candidatos[0], e) : e.preventDefault())} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_10rem]">
        <label className="block text-sm font-bold text-azul">
          Producto
          <input
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Busca: harina pan, café…"
            className="mt-1 h-11 w-full rounded-2xl bg-crema px-3 font-normal text-tinta ring-1 ring-azul/10"
          />
        </label>
        <label className="block text-sm font-bold text-azul">
          Descuento %
          <input
            type="number"
            min={1}
            max={90}
            value={descuento}
            onChange={(e) => setDescuento(Number(e.target.value))}
            className="mt-1 h-11 w-full rounded-2xl bg-crema px-3 font-normal text-tinta ring-1 ring-azul/10"
          />
        </label>
        <label className="block text-sm font-bold text-azul">
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="mt-1 h-11 w-full rounded-2xl bg-crema px-3 font-normal text-tinta ring-1 ring-azul/10"
          />
        </label>
      </form>
      {candidatos.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {candidatos.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => crear(p)} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 text-left hover:bg-crema">
                <span className="min-w-0 truncate">{p.nombre}</span>
                <span className="shrink-0 font-bold text-verde">Crear -{descuento}%</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 min-h-5 text-sm font-bold text-verde" aria-live="polite">
        {aviso}
      </p>
    </section>
  );
}

export function PanelInterno() {
  const { indice } = useTienda();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setEventos(leerEventos());
    setListo(true);
    // Otra pestaña con la tienda abierta registra uso: el panel se actualiza solo
    const alCambiar = (evento: StorageEvent) => {
      if (evento.key === CLAVE_EVENTOS || evento.key === null) setEventos(leerEventos());
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  const productos = useMemo(() => indice?.entradas.map((e) => e.producto) ?? [], [indice]);
  const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);

  const metricas = useMemo(() => {
    const pedidos = eventos.filter((e): e is Extract<Evento, { tipo: "pedido" }> => e.tipo === "pedido");
    const checkouts = eventos.filter((e) => e.tipo === "checkout").length;
    const busquedas = eventos.filter((e): e is Extract<Evento, { tipo: "busqueda" }> => e.tipo === "busqueda");
    const ventas = pedidos.reduce((s, p) => s + aCentimos(p.total), 0) / 100;
    const sinResultado = busquedas.filter((b) => b.resultados === 0);
    const agregados = eventos.filter((e): e is Extract<Evento, { tipo: "agregar" }> => e.tipo === "agregar");
    const recetas = eventos.filter((e): e is Extract<Evento, { tipo: "receta" }> => e.tipo === "receta");
    // Pedidos por día, últimos 14 días (hora de Margarita)
    const dias = Array.from({ length: 14 }, (_, i) => hoyEnMargarita(new Date(Date.now() - (13 - i) * DIA_MS)));
    const porDia = contar(pedidos, (p) => hoyEnMargarita(new Date(p.t)));
    return {
      pedidos: pedidos.length,
      ventas,
      ticket: pedidos.length ? ventas / pedidos.length : 0,
      conversion: checkouts ? pedidos.length / checkouts : 0,
      paraOtro: pedidos.length ? pedidos.filter((p) => p.paraOtro).length / pedidos.length : 0,
      busquedas: busquedas.length,
      sinResultadoPct: busquedas.length ? sinResultado.length / busquedas.length : 0,
      topSinResultado: top(contar(sinResultado, (b) => b.consulta)),
      topBusquedas: top(contar(busquedas.filter((b) => b.resultados > 0), (b) => b.consulta)),
      topAgregados: top(
        agregados.reduce((m, a) => m.set(a.id, (m.get(a.id) ?? 0) + a.cantidad), new Map<string, number>()),
      ),
      topRecetas: top(contar(recetas, (r) => r.receta), 6),
      porSucursal: top(contar(pedidos, (p) => p.sucursal), 2),
      porDia: dias.map((d) => ({ dia: d, pedidos: porDia.get(d) ?? 0 })),
    };
  }, [eventos]);

  const catalogo = useMemo(() => {
    const ambas = productos.filter((p) => p.disponibleEn?.costazul && p.disponibleEn.sambil).length;
    const soloCostazul = productos.filter((p) => p.disponibleEn?.costazul && !p.disponibleEn.sambil).length;
    const soloSambil = productos.filter((p) => !p.disponibleEn?.costazul && p.disponibleEn?.sambil).length;
    const sinExistencia = productos.filter((p) => p.disponible === false).length;
    const sinFoto = productos.filter((p) => !p.imagen).length;
    const diferencias = productos
      .filter((p) => p.precioSambilUsd && p.precioSambilUsd !== p.precioUsd)
      .map((p) => ({ producto: p, diferencia: precioRegularEn(p, "sambil") - precioRegularEn(p, "costazul") }))
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));
    const porDepartamento = top(contar(productos.filter((p) => p.disponible !== false), (p) => nombreLegible(p.departamento ?? "Otros")), 10);
    return { ambas, soloCostazul, soloSambil, sinExistencia, sinFoto, diferencias, porDepartamento };
  }, [productos]);

  const porcentaje = (n: number) => `${Math.round(n * 100)}%`;
  const maximoDia = Math.max(1, ...metricas.porDia.map((d) => d.pedidos));

  return (
    <main id="contenido" className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-verde">Uso interno · prototipo</p>
          <h1 className="text-3xl font-black text-azul">Panel de la tienda SIGO</h1>
          <p className="max-w-2xl text-sm text-gris">
            Uso registrado en este dispositivo (búsquedas, carritos, pedidos y recetas) y datos reales del catálogo de Costazul y Sambil. En
            producción leería la analítica del e-commerce de todas las personas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={productos.length === 0}
            onClick={() => {
              const demo = crearDatosDemostracion(productos);
              guardarEventos([...leerEventos(), ...demo]);
              setEventos(leerEventos());
            }}
            className="min-h-11 rounded-full bg-azul px-4 text-sm font-extrabold text-white disabled:opacity-40"
          >
            Cargar 30 días de demostración
          </button>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("¿Borrar el uso registrado en este dispositivo?")) return;
              guardarEventos([]);
              setEventos([]);
            }}
            className="min-h-11 rounded-full px-4 text-sm font-extrabold text-azul ring-1 ring-azul/15"
          >
            Borrar datos
          </button>
          <Link href="/tienda/" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-extrabold text-verde ring-1 ring-verde/30">
            Ir a la tienda
          </Link>
        </div>
      </div>

      {listo && eventos.length === 0 && (
        <p className="mt-4 rounded-2xl bg-sol/30 p-3 text-sm font-bold text-azul">
          Aún no hay uso registrado. Navega la tienda, busca y haz un pedido de prueba, o carga 30 días de demostración.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Cifra etiqueta="Pedidos" valor={metricas.pedidos.toLocaleString("es-VE")} />
        <Cifra etiqueta="Ventas" valor={formatearUsd(metricas.ventas)} />
        <Cifra etiqueta="Ticket promedio" valor={formatearUsd(metricas.ticket)} />
        <Cifra etiqueta="Checkout → pedido" valor={porcentaje(metricas.conversion)} detalle="Del resto: carritos abandonados" />
        <Cifra etiqueta="Para otra persona" valor={porcentaje(metricas.paraOtro)} detalle="Compras de familia o del exterior" />
        <Cifra etiqueta="Búsquedas sin resultado" valor={porcentaje(metricas.sinResultadoPct)} detalle={`de ${metricas.busquedas.toLocaleString("es-VE")} búsquedas`} />
      </div>

      <section className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-azul/5" aria-labelledby="titulo-por-dia">
        <h2 id="titulo-por-dia" className="font-black text-azul">
          Pedidos por día · últimos 14 días
        </h2>
        <div className="mt-4 flex h-40 items-end gap-1.5" role="img" aria-label={`Pedidos por día: ${metricas.porDia.map((d) => `${d.dia.slice(5)} ${d.pedidos}`).join(", ")}`}>
          {metricas.porDia.map((d) => (
            <div key={d.dia} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.dia}: ${d.pedidos} pedidos`}>
              <div className="rounded-t-[4px] bg-verde transition group-hover:bg-verde-700" style={{ height: `${(d.pedidos / maximoDia) * 100}%`, minHeight: d.pedidos ? 4 : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1.5 text-[0.65rem] text-gris" aria-hidden>
          {metricas.porDia.map((d, i) => (
            <span key={d.dia} className="flex-1 text-center">
              {i % 2 === 0 ? d.dia.slice(8) : ""}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Ranking
          titulo="Buscado y no encontrado"
          filas={metricas.topSinResultado.map(([etiqueta, valor]) => ({ etiqueta, valor }))}
          vacio="Nada todavía: buen indicio."
        />
        <Ranking titulo="Lo más buscado" filas={metricas.topBusquedas.map(([etiqueta, valor]) => ({ etiqueta, valor }))} vacio="Sin búsquedas registradas." />
        <Ranking
          titulo="Lo más agregado al carrito"
          filas={metricas.topAgregados.map(([id, valor]) => ({ etiqueta: porId.get(id)?.nombre ?? `Producto ${id}`, valor }))}
          vacio="Sin productos agregados."
        />
        <Ranking
          titulo="Recetas que se convirtieron en carrito"
          filas={metricas.topRecetas.map(([id, valor]) => ({ etiqueta: RECETAS.find((r) => r.id === id)?.titulo ?? id, valor }))}
          vacio="Sin recetas usadas."
        />
        <Ranking
          titulo="Pedidos por tienda"
          filas={metricas.porSucursal.map(([clave, valor]) => ({ etiqueta: SUCURSALES_TIENDA[clave as keyof typeof SUCURSALES_TIENDA]?.corto ?? clave, valor }))}
          vacio="Sin pedidos."
        />
        <Ranking titulo="Productos con existencia por departamento" filas={catalogo.porDepartamento.map(([etiqueta, valor]) => ({ etiqueta, valor }))} vacio="Cargando catálogo…" />
      </div>

      <h2 className="mt-10 text-2xl font-black text-azul">Catálogo real</h2>
      <p className="text-sm text-gris">Extraído de costazul.sigo.com.ve y sambil.sigo.com.ve.</p>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Cifra etiqueta="Productos" valor={productos.length.toLocaleString("es-VE")} />
        <Cifra etiqueta="En ambas tiendas" valor={catalogo.ambas.toLocaleString("es-VE")} />
        <Cifra etiqueta="Solo Costazul" valor={catalogo.soloCostazul.toLocaleString("es-VE")} />
        <Cifra etiqueta="Solo Sambil" valor={catalogo.soloSambil.toLocaleString("es-VE")} />
        <Cifra etiqueta="Sin existencia" valor={catalogo.sinExistencia.toLocaleString("es-VE")} />
        <Cifra etiqueta="Sin foto" valor={catalogo.sinFoto.toLocaleString("es-VE")} detalle="Pendientes para el equipo de contenido" />
      </div>

      <section className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-azul/5" aria-labelledby="titulo-diferencias">
        <h2 id="titulo-diferencias" className="font-black text-azul">
          Mismo producto, distinto precio entre tiendas ({catalogo.diferencias.length})
        </h2>
        {/* Desplazable con teclado en pantallas angostas */}
        <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de precios por tienda, desplazable">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-gris">
              <tr>
                <th className="py-2 font-extrabold">Producto</th>
                <th className="py-2 text-right font-extrabold">Costazul</th>
                <th className="py-2 text-right font-extrabold">Sambil</th>
                <th className="py-2 text-right font-extrabold">Sambil vs Costazul</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-azul-100">
              {catalogo.diferencias.slice(0, 12).map(({ producto, diferencia }) => (
                <tr key={producto.id}>
                  <td className="py-2 pr-3">{producto.nombre}</td>
                  <td className="py-2 text-right font-semibold">{formatearUsd(precioRegularEn(producto, "costazul"))}</td>
                  <td className="py-2 text-right font-semibold">{formatearUsd(precioRegularEn(producto, "sambil"))}</td>
                  <td className="py-2 text-right font-black text-azul">
                    {diferencia > 0 ? "+" : "−"}
                    {formatearUsd(Math.abs(diferencia))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4">
        <GestorPromociones />
      </div>
    </main>
  );
}
