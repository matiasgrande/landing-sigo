import SwiftUI

/// Pestañas con la barra Liquid Glass de iOS 26: se minimiza al bajar y deja ver el carrito
struct RaizView: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        @Bindable var tienda = tienda
        TabView(selection: $tienda.pestana) {
            Tab("Inicio", systemImage: "house.fill", value: Pestana.inicio) { InicioView() }
            Tab("Recetas", systemImage: "fork.knife", value: Pestana.recetas) { RecetasView() }
            Tab("Pedidos", systemImage: "bag.fill", value: Pestana.pedidos) { PedidosView() }
            Tab("Carrito", systemImage: "cart.fill", value: Pestana.carrito) { CarritoView() }
                .badge(tienda.totalArticulos)
            Tab(value: Pestana.buscar, role: .search) { BuscarView() }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
        .tabViewBottomAccessory { AccesorioEntrega() }
        .sheet(item: $tienda.productoAbierto) { producto in
            FichaProducto(producto: producto)
                .presentationDetents([.medium, .large])
                .presentationBackground(.thinMaterial)
        }
        .sheet(isPresented: $tienda.selectorEntregaAbierto) {
            SelectorEntrega().presentationDetents([.medium, .large])
        }
        .overlay {
            if tienda.estado == .error {
                ContentUnavailableView {
                    Label("No pudimos cargar el catálogo", systemImage: "wifi.exclamationmark")
                } description: {
                    Text("Revisa tu conexión. Tu carrito sigue guardado.")
                } actions: {
                    Button("Reintentar") { Task { await tienda.reintentar() } }.buttonStyle(.glassProminent)
                }
                .background(Color.sigoCrema)
            }
        }
    }
}

/// Accesorio sobre la barra de pestañas: dónde recibes y el total del carrito, siempre a mano
struct AccesorioEntrega: View {
    @Environment(Tienda.self) private var tienda
    @Environment(\.tabViewBottomAccessoryPlacement) private var ubicacion

    var body: some View {
        let totales = tienda.totales()
        HStack(spacing: 10) {
            Button {
                tienda.selectorEntregaAbierto = true
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: tienda.entrega.modo == .retiro ? "car.fill" : "mappin.circle.fill").foregroundStyle(Color.sigoVerde)
                    if ubicacion != .inline {
                        Text(textoEntrega).font(.footnote.weight(.bold)).lineLimit(1)
                    }
                }
            }
            .accessibilityLabel("Entrega: \(textoEntrega). Cambiar")
            Spacer(minLength: 0)
            if tienda.totalArticulos > 0 {
                Button {
                    tienda.pestana = .carrito
                } label: {
                    HStack(spacing: 6) {
                        if totales.faltante > 0, ubicacion != .inline {
                            Text("Faltan \(Formato.usd(totales.faltante))").font(.caption.weight(.bold)).foregroundStyle(Color.sigoGris)
                        }
                        Text(Formato.usd(totales.subtotal)).font(.subheadline.weight(.black)).foregroundStyle(Color.sigoAzul)
                    }
                }
                .accessibilityLabel("Carrito: \(Formato.usd(totales.subtotal))")
            }
        }
        .padding(.horizontal, 16)
    }

    private var textoEntrega: String {
        switch tienda.entrega.modo {
        case .retiro: "Retiro en \(tienda.sucursal.corto)"
        case .delivery: tienda.entrega.municipio.map { "Delivery a \($0)" } ?? "Elige dónde recibir"
        }
    }
}

/// Delivery por municipio o retiro en tienda, y la tienda que prepara el pedido
struct SelectorEntrega: View {
    @Environment(Tienda.self) private var tienda
    @Environment(\.dismiss) private var cerrar
    @State private var borrador = Entrega()

    var body: some View {
        NavigationStack {
            Form {
                Picker("Modalidad", selection: $borrador.modo) {
                    ForEach(ModoEntrega.allCases) { Text($0.titulo).tag($0) }
                }
                .pickerStyle(.segmented)
                .listRowBackground(Color.clear)

                if borrador.modo == .delivery {
                    Section {
                        Picker("Municipio", selection: $borrador.municipio) {
                            Text("Elige tu municipio").tag(String?.none)
                            ForEach(Datos.tarifas) { tarifa in
                                Text("\(tarifa.municipio) · \(Formato.usd(tarifa.tarifaUsd))").tag(Optional(tarifa.municipio))
                            }
                        }
                    } footer: {
                        if let tarifa = Datos.tarifas.first(where: { $0.municipio == borrador.municipio }) {
                            Text(tarifa.express ? "Express de 2 a 4 horas" : "Delivery especial, salida diaria 3:00 p.m.")
                        }
                    }
                }

                Section {
                    Picker(borrador.modo == .retiro ? "¿En cuál tienda retiras?" : "Tienda que prepara tu pedido", selection: $borrador.sucursal) {
                        ForEach(Sucursal.allCases) { Text($0.corto).tag($0) }
                    }
                    .pickerStyle(.inline)
                } footer: {
                    Text("Precios y existencias pueden variar entre tiendas.")
                }
            }
            .navigationTitle("¿Cómo recibes tu compra?")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar", systemImage: "xmark") { cerrar() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar", systemImage: "checkmark") {
                        tienda.entrega = borrador
                        cerrar()
                    }
                    .disabled(borrador.modo == .delivery && borrador.municipio == nil)
                }
            }
            .onAppear { borrador = tienda.entrega }
        }
    }
}
