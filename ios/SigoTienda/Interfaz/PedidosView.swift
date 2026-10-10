import SwiftUI

private func hace(_ fecha: Date) -> String {
    let dias = Calendar.current.dateComponents([.day], from: fecha, to: Date()).day ?? 0
    return dias <= 0 ? "hoy" : dias == 1 ? "ayer" : "hace \(dias) días"
}

/// Repetir un pedido: agrega lo que siga disponible y lo anuncia
private struct BotonRepetir: View {
    @Environment(Tienda.self) private var tienda
    let pedido: PedidoGuardado
    var principal = false
    @State private var resultado: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Button {
                let agregados = tienda.repetir(pedido)
                let faltan = pedido.lineas.count - agregados
                resultado = agregados == 0
                    ? "Ninguno de estos productos está disponible ahora."
                    : "Agregamos \(Formato.plural(agregados, "producto"))" + (faltan > 0 ? "; \(Formato.plural(faltan, "producto")) sin existencia." : ".")
            } label: {
                Label("Repetir pedido", systemImage: "arrow.clockwise").font(.subheadline.weight(.heavy))
            }
            .buttonStyle(.glassProminent)
            .tint(principal ? .sigoVerde : .sigoAzul)
            if let resultado {
                Text(resultado).font(.caption.weight(.bold)).foregroundStyle(Color.sigoGris)
            }
        }
        .sensoryFeedback(.success, trigger: resultado)
    }
}

/// Inicio: el último mercado a un toque, con recordatorio a los 14 días
struct ComprarDeNuevo: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        if let ultimo = tienda.pedidos.first {
            let dias = Calendar.current.dateComponents([.day], from: ultimo.fecha, to: Date()).day ?? 0
            VStack(alignment: .leading, spacing: 8) {
                Text(dias >= 14 ? "¿Ya toca reponer?" : "Comprar de nuevo").estiloEtiqueta()
                Text("Tu último mercado fue \(hace(ultimo.fecha))").font(.title3.weight(.black)).foregroundStyle(Color.sigoAzul)
                Text("\(Formato.plural(ultimo.lineas.count, "producto")) · \(Formato.usd(ultimo.total)) · \(ultimo.sucursal.corto)\(ultimo.paraOtro.map { " · para \($0)" } ?? "")")
                    .font(.subheadline).foregroundStyle(Color.sigoGris)
                Text(ultimo.lineas.map { "\($0.cantidad) × \($0.nombre)" }.joined(separator: " · ")).font(.footnote).lineLimit(2)
                BotonRepetir(pedido: ultimo, principal: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .tarjeta()
            .padding(.horizontal)
        }
    }
}

struct PedidosView: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        NavigationStack {
            Group {
                if tienda.pedidos.isEmpty {
                    ContentUnavailableView("Todavía no tienes pedidos", systemImage: "bag",
                                           description: Text("Cuando confirmes un pedido quedará aquí para repetirlo con un toque."))
                } else {
                    List(tienda.pedidos) { pedido in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(alignment: .firstTextBaseline) {
                                Text("Pedido \(pedido.numero)").font(.headline.weight(.black)).foregroundStyle(Color.sigoAzul)
                                Spacer()
                                Text(pedido.fecha.formatted(date: .abbreviated, time: .omitted)).font(.caption.weight(.bold)).foregroundStyle(Color.sigoGris)
                            }
                            Text("\(Formato.plural(pedido.lineas.count, "producto")) · \(Formato.usd(pedido.total)) · \(pedido.modo == .retiro ? "Retiro" : "Delivery") desde \(pedido.sucursal.corto)\(pedido.paraOtro.map { " · para \($0)" } ?? "")")
                                .font(.subheadline).foregroundStyle(Color.sigoGris)
                            DisclosureGroup("Ver productos") {
                                ForEach(pedido.lineas, id: \.id) { Text("\($0.cantidad) × \($0.nombre)").font(.footnote) }
                            }
                            .font(.subheadline.weight(.bold))
                            BotonRepetir(pedido: pedido)
                        }
                        .padding(.vertical, 6)
                    }
                }
            }
            .background(Color.sigoCrema)
            .navigationTitle("Mis pedidos")
        }
    }
}
