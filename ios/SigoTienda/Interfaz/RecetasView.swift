import SwiftUI

/// Temporada activa o la próxima (hasta 45 días antes), en el inicio
struct BannerTemporada: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        let temporadas = Calendario.temporadas(en: Promociones.hoy())
        let actual = temporadas.activas.first
        if let destacada = actual ?? temporadas.proxima.flatMap({ $0.faltan <= 45 ? $0 : nil }) {
            VStack(alignment: .leading, spacing: 8) {
                Text(actual != nil ? "Temporada" : "Se viene en \(Formato.plural(destacada.faltan, "día"))").estiloEtiqueta(.white.opacity(0.9))
                Text(destacada.temporada.nombre).font(.title.weight(.black)).foregroundStyle(.white)
                Text(destacada.temporada.mensaje).font(.subheadline).foregroundStyle(.white.opacity(0.9))
                Button {
                    tienda.pestana = .recetas
                } label: {
                    Text("Ver recetas y kits").font(.subheadline.weight(.heavy)).foregroundStyle(Color.sigoCoral)
                }
                .buttonStyle(.glass)
                .padding(.top, 4)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(20)
            .background(Color.sigoCoral, in: .rect(cornerRadius: 28))
            .padding(.horizontal)
        }
    }
}

struct RecetasView: View {
    var body: some View {
        let temporadas = Calendario.temporadas(en: Promociones.hoy())
        let enTemporada = Set(temporadas.activas.flatMap(\.temporada.recetas))
        let proxima = temporadas.activas.isEmpty ? temporadas.proxima : nil
        let deProxima = Set(proxima?.temporada.recetas ?? [])
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 18) {
                    Text("Elige para cuántos cocinas y agregamos los ingredientes con los productos reales de tu tienda. Lo fresco de carnicería y pescadería lo consigues en tu tienda Sigo.")
                        .font(.subheadline).foregroundStyle(Color.sigoGris)
                    ForEach(temporadas.activas) { activa in
                        SeccionRecetas(titulo: activa.temporada.nombre, subtitulo: activa.temporada.mensaje, ids: activa.temporada.recetas, color: .sigoCoral)
                    }
                    if let proxima {
                        SeccionRecetas(titulo: "\(proxima.temporada.nombre) · en \(Formato.plural(proxima.faltan, "día"))",
                                       subtitulo: "\(proxima.temporada.mensaje) Adelanta tu lista.", ids: proxima.temporada.recetas, color: .sigoCoral)
                    }
                    SeccionRecetas(titulo: "De todo el año", subtitulo: nil,
                                   ids: Calendario.recetasDeSiempre.filter { !enTemporada.contains($0) && !deProxima.contains($0) }, color: .sigoAzul)
                }
                .padding()
            }
            .background(Color.sigoCrema)
            .navigationTitle("Recetas y temporada")
        }
    }
}

private struct SeccionRecetas: View {
    let titulo: String
    let subtitulo: String?
    let ids: [String]
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(titulo).font(.title2.weight(.black)).foregroundStyle(color)
            if let subtitulo { Text(subtitulo).font(.subheadline).foregroundStyle(Color.sigoGris) }
            ForEach(ids.compactMap(Calendario.receta)) { receta in
                TarjetaReceta(receta: receta)
            }
        }
    }
}

private struct TarjetaReceta: View {
    @Environment(Tienda.self) private var tienda
    let receta: Receta
    @State private var porciones: Int
    @State private var resultado: String?

    init(receta: Receta) {
        self.receta = receta
        _porciones = State(initialValue: receta.porciones)
    }

    var body: some View {
        let paso = receta.porciones >= 10 ? 5 : 1
        let ingredientes = tienda.indice.map {
            ResolutorRecetas.resolver(receta, porciones: porciones, indice: $0, disponible: tienda.disponible)
        } ?? []
        let conProducto = ingredientes.compactMap { item in item.producto.map { (item, $0) } }
        let total = desdeCentimos(conProducto.reduce(0) { $0 + aCentimos($1.1.precio(en: tienda.sucursal) * Double($1.0.unidades)) })

        VStack(alignment: .leading, spacing: 12) {
            Text(receta.titulo).font(.title3.weight(.black)).foregroundStyle(Color.sigoAzul)
            Text(receta.descripcion).font(.subheadline).foregroundStyle(Color.sigoGris)

            HStack {
                Button { porciones = max(paso, porciones - paso) } label: { Image(systemName: "minus").frame(width: 40, height: 40) }
                    .disabled(porciones <= paso)
                    .accessibilityLabel("Menos \(receta.unidadPorciones)")
                Spacer()
                Text("Para \(porciones) \(receta.unidadPorciones)").font(.subheadline.weight(.heavy)).foregroundStyle(Color.sigoAzul)
                    .contentTransition(.numericText())
                Spacer()
                Button { porciones = min(receta.porciones * 6, porciones + paso) } label: { Image(systemName: "plus").frame(width: 40, height: 40) }
                    .accessibilityLabel("Más \(receta.unidadPorciones)")
            }
            .glassEffect(.regular.interactive(), in: .capsule)
            .animation(.snappy, value: porciones)

            ForEach(ingredientes) { item in
                HStack(spacing: 10) {
                    if let producto = item.producto {
                        ImagenProducto(producto: producto, radio: 10).frame(width: 40, height: 40)
                    } else {
                        Image(systemName: "storefront").frame(width: 40, height: 40).foregroundStyle(Color.sigoGris)
                            .background(Color.sigoCrema, in: .rect(cornerRadius: 10))
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(item.ingrediente.nombre) · \(item.textoCantidad)").font(.subheadline.weight(.bold))
                        Text(item.producto.map { "\(item.unidades) × \($0.nombre)" }
                             ?? (item.ingrediente.enLinea ? "Sin existencia en \(tienda.sucursal.corto)" : "Consíguelo en tu tienda Sigo (no se vende en línea)"))
                            .font(.caption).foregroundStyle(Color.sigoGris).lineLimit(1)
                    }
                    Spacer(minLength: 0)
                    if let producto = item.producto {
                        Text(Formato.usd(producto.precio(en: tienda.sucursal) * Double(item.unidades))).font(.subheadline.weight(.black)).foregroundStyle(Color.sigoAzul)
                    }
                }
            }

            Button {
                for (item, producto) in conProducto { tienda.agregar(producto, item.unidades) }
                let faltan = ingredientes.count - conProducto.count
                resultado = "Agregamos \(Formato.plural(conProducto.count, "producto"))" + (faltan > 0 ? "; \(Formato.plural(faltan, "ingrediente")) lo consigues en tu tienda Sigo." : ".")
            } label: {
                Text("Agregar \(Formato.plural(conProducto.count, "producto")) · \(Formato.usd(total))")
                    .font(.headline.weight(.heavy)).frame(maxWidth: .infinity, minHeight: 34)
            }
            .buttonStyle(.glassProminent)
            .tint(.sigoVerde)
            .disabled(conProducto.isEmpty)
            if let resultado {
                Text(resultado).font(.caption.weight(.bold)).foregroundStyle(Color.sigoGris)
            }
        }
        .tarjeta()
        .sensoryFeedback(.success, trigger: resultado)
    }
}
