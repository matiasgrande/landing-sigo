import SwiftUI

struct CarritoView: View {
    @Environment(Tienda.self) private var tienda
    @State private var confirmarVaciar = false

    var body: some View {
        let totales = tienda.totales()
        NavigationStack {
            Group {
                if tienda.lineas.isEmpty {
                    ContentUnavailableView {
                        Label("Tu carrito está vacío", systemImage: "cart")
                    } description: {
                        Text("Busca productos, repite un pedido o arma una receta.")
                    } actions: {
                        Button("Ver ofertas") { tienda.pestana = .inicio }.buttonStyle(.glassProminent)
                    }
                } else {
                    List {
                        Section {
                            ForEach(tienda.lineas) { linea in
                                FilaCarrito(linea: linea)
                            }
                            .onDelete { posiciones in
                                let lineas = tienda.lineas
                                posiciones.map { lineas[$0].producto }.forEach(tienda.quitar)
                            }
                        }
                        Section { ComparadorSucursales() }
                            .listRowBackground(Color.clear)
                            .listRowInsets(EdgeInsets())
                        Section {
                            ProgresoMinimo(totales: totales)
                            FilaTotal(titulo: "Subtotal", valor: Formato.usd(totales.subtotal))
                            FilaTotal(
                                titulo: tienda.entrega.modo == .retiro ? "Retiro en \(tienda.sucursal.corto)" : "Envío",
                                valor: totales.envio.map { $0 == 0 ? "Gratis" : Formato.usd($0) } ?? "Elige tu municipio"
                            )
                            FilaTotal(titulo: "Total", valor: Formato.usd(totales.total), destacado: true)
                            if let tasa = tienda.tasa {
                                Text(Formato.bs(totales.total, tasa: tasa.valor)).font(.footnote).foregroundStyle(Color.sigoGris)
                            }
                        } footer: {
                            Text("Pagos en divisas incluyen IGTF (3 %), que se calcula al elegir el método de pago.")
                        }
                        Section {
                            Button("Vaciar carrito", role: .destructive) { confirmarVaciar = true }
                        }
                    }
                    .safeAreaInset(edge: .bottom) {
                        NavigationLink {
                            CheckoutView()
                        } label: {
                            Text(totales.faltante > 0 ? "Agrega \(Formato.usd(totales.faltante)) para continuar" : "Continuar compra · \(Formato.usd(totales.total))")
                                .font(.headline.weight(.heavy))
                                .frame(maxWidth: .infinity, minHeight: 34)
                        }
                        .buttonStyle(.glassProminent)
                        .tint(.sigoVerde)
                        .disabled(totales.faltante > 0 || tienda.lineasCobrables.isEmpty)
                        .padding(.horizontal)
                        .padding(.bottom, 8)
                    }
                }
            }
            .background(Color.sigoCrema)
            .navigationTitle("Carrito")
            .confirmationDialog("¿Vaciar el carrito?", isPresented: $confirmarVaciar, titleVisibility: .visible) {
                Button("Vaciar", role: .destructive) { tienda.vaciar() }
            }
        }
    }
}

private struct FilaCarrito: View {
    @Environment(Tienda.self) private var tienda
    let linea: LineaCarrito

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Button {
                tienda.productoAbierto = linea.producto
            } label: {
                ImagenProducto(producto: linea.producto, radio: 14).frame(width: 64, height: 64)
            }
            // En filas de List, "borderless" evita que un toque active todos los botones de la fila
            .buttonStyle(.borderless)
            VStack(alignment: .leading, spacing: 6) {
                Text(linea.producto.nombre).font(.subheadline.weight(.bold)).lineLimit(2)
                Text("\(Formato.usd(linea.precio)) c/u").font(.caption).foregroundStyle(Color.sigoGris)
                if !linea.disponible {
                    Text("Sin existencia en \(tienda.sucursal.corto): no se cobra ni va en el pedido.")
                        .font(.caption.weight(.bold)).foregroundStyle(Color.sigoError)
                }
                ControlCantidad(producto: linea.producto).frame(maxWidth: 150)
                Menu {
                    Picker("Si no hay", selection: Binding(
                        get: { tienda.sustitutos[linea.producto.id] ?? .similar },
                        set: { tienda.sustitutos[linea.producto.id] = $0 }
                    )) {
                        ForEach(PreferenciaSustituto.allCases) { Text($0.texto).tag($0) }
                    }
                } label: {
                    Label("Si no hay: \((tienda.sustitutos[linea.producto.id] ?? .similar).texto.lowercased())", systemImage: "arrow.triangle.2.circlepath")
                        .font(.caption.weight(.bold))
                }
            }
            Spacer(minLength: 0)
            Text(Formato.usd(linea.subtotal))
                .font(.subheadline.weight(.black))
                .foregroundStyle(linea.disponible ? Color.sigoAzul : Color.sigoGris)
                .strikethrough(!linea.disponible)
        }
        .padding(.vertical, 4)
    }
}

struct FilaTotal: View {
    let titulo: String
    let valor: String
    var destacado = false

    var body: some View {
        HStack {
            Text(titulo).foregroundStyle(destacado ? Color.sigoAzul : Color.sigoGris)
            Spacer()
            Text(valor).foregroundStyle(destacado ? Color.sigoAzul : Color.sigoTinta)
        }
        .font(destacado ? .headline.weight(.black) : .subheadline.weight(.semibold))
    }
}

struct ProgresoMinimo: View {
    let totales: Totales

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            ProgressView(value: min(1, totales.subtotal / Datos.minimoCompraUsd)).tint(.sigoVerde)
            Text(totales.faltante > 0
                 ? "Agrega \(Formato.usd(totales.faltante)) más para la compra mínima de \(Formato.usd(Datos.minimoCompraUsd))"
                 : "Compra mínima alcanzada ✓")
                .font(.caption.weight(.bold)).foregroundStyle(Color.sigoGris)
        }
    }
}

/// El mismo carrito en Costazul y Sambil con precios y existencias reales; cambia de tienda en un toque
struct ComparadorSucursales: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        let comparacion = tienda.comparacion
        let actual = comparacion.first { $0.sucursal == tienda.sucursal }
        let otra = comparacion.first { $0.sucursal != tienda.sucursal }
        if let actual, let otra {
            let ahorro = desdeCentimos(aCentimos(actual.total) - aCentimos(otra.total))
            let conviene = ahorro >= 0.01 && otra.faltantes <= actual.faltantes
            VStack(alignment: .leading, spacing: 10) {
                Text("Tu carrito en cada tienda").estiloEtiqueta(.sigoGris)
                GlassEffectContainer(spacing: 10) {
                    HStack(spacing: 10) {
                        ForEach(comparacion) { item in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(item.sucursal.corto + (item.sucursal == tienda.sucursal ? " · te atiende" : ""))
                                    .font(.caption.weight(.bold)).foregroundStyle(Color.sigoGris)
                                Text(Formato.usd(item.total)).font(.title3.weight(.black))
                                    .foregroundStyle(conviene && item.sucursal == otra.sucursal ? Color.sigoVerde : Color.sigoAzul)
                                Text(item.faltantes > 0 ? "\(Formato.plural(item.faltantes, "producto")) sin existencia" : "Todo disponible")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(item.faltantes > 0 ? Color.sigoError : Color.sigoVerde)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .glassEffect(item.sucursal == tienda.sucursal ? .regular.tint(.sigoAzul100) : .regular, in: .rect(cornerRadius: 18))
                        }
                    }
                }
                if conviene {
                    Button {
                        withAnimation { tienda.entrega.sucursal = otra.sucursal }
                    } label: {
                        Text("Ahorra \(Formato.usd(ahorro)) pidiendo en \(otra.sucursal.corto)")
                            .font(.subheadline.weight(.heavy)).frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.glassProminent)
                    .tint(.sigoVerde)
                }
            }
            .padding(.vertical, 8)
        }
    }
}
