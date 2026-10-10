import SwiftUI

enum OrdenListado: String, CaseIterable, Identifiable {
    case relevancia = "Relevancia"
    case menorPrecio = "Menor precio"
    case mayorPrecio = "Mayor precio"
    case nombre = "Nombre (A-Z)"
    var id: String { rawValue }
}

/// Departamento, ofertas o resultados: chips de categoría, solo disponibles y orden
struct ListadoView: View {
    @Environment(Tienda.self) private var tienda
    let titulo: String
    let productos: [Producto]
    @State private var categoria: String?
    @State private var soloDisponibles = true
    @State private var orden = OrdenListado.relevancia

    private var base: [Producto] {
        soloDisponibles ? productos.filter(tienda.disponible) : productos
    }

    private var categorias: [(nombre: String, cantidad: Int)] {
        Dictionary(grouping: base, by: \.categoria).map { ($0.key, $0.value.count) }.sorted { $0.1 > $1.1 }
    }

    private var visibles: [Producto] {
        let filtrados = categoria.map { nombre in base.filter { $0.categoria == nombre } } ?? base
        let sucursal = tienda.sucursal
        switch orden {
        case .relevancia: return filtrados
        case .menorPrecio: return filtrados.sorted { $0.precio(en: sucursal) < $1.precio(en: sucursal) }
        case .mayorPrecio: return filtrados.sorted { $0.precio(en: sucursal) > $1.precio(en: sucursal) }
        case .nombre: return filtrados.sorted { $0.nombre.localizedCompare($1.nombre) == .orderedAscending }
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                if categorias.count > 1 {
                    ScrollView(.horizontal) {
                        GlassEffectContainer(spacing: 8) {
                            HStack(spacing: 8) {
                                Chip(texto: "Todo", activo: categoria == nil) { categoria = nil }
                                ForEach(categorias, id: \.nombre) { item in
                                    Chip(texto: "\(nombreLegible(item.nombre)) \(item.cantidad)", activo: categoria == item.nombre) {
                                        categoria = item.nombre
                                    }
                                }
                            }
                            .padding(.horizontal)
                            .padding(.vertical, 4)
                        }
                    }
                    .scrollIndicators(.hidden)
                }
                Text(Formato.plural(visibles.count, "producto")).font(.footnote.weight(.semibold)).foregroundStyle(Color.sigoGris).padding(.horizontal)
                if visibles.isEmpty {
                    ContentUnavailableView(
                        soloDisponibles ? "Nada disponible en \(tienda.sucursal.corto)" : "No hay productos",
                        systemImage: "basket",
                        description: Text(soloDisponibles ? "Prueba a ver también los que no tienen existencia." : "")
                    )
                } else {
                    RejillaProductos(productos: visibles).padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .background(Color.sigoCrema)
        .navigationTitle(titulo)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Toggle("Solo disponibles en \(tienda.sucursal.corto)", isOn: $soloDisponibles)
                    Picker("Ordenar por", selection: $orden) {
                        ForEach(OrdenListado.allCases) { Text($0.rawValue).tag($0) }
                    }
                } label: {
                    Label("Filtros", systemImage: "line.3.horizontal.decrease")
                }
            }
        }
        .onChange(of: soloDisponibles) { categoria = nil }
    }
}

/// Chip de vidrio; el activo se tiñe de verde
struct Chip: View {
    let texto: String
    let activo: Bool
    let accion: () -> Void

    var body: some View {
        Button(action: accion) {
            Text(texto)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(activo ? .white : Color.sigoAzul)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
        .glassEffect(activo ? .regular.tint(.sigoVerde).interactive() : .regular.interactive(), in: .capsule)
        .accessibilityAddTraits(activo ? .isSelected : [])
    }
}

/// Búsqueda tolerante a errores, integrada en la barra de pestañas de iOS 26
struct BuscarView: View {
    @Environment(Tienda.self) private var tienda
    @State private var texto = ""
    @State private var resultado = ResultadoBusqueda(productos: [], correccion: nil)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    if texto.trimmingCharacters(in: .whitespaces).count < 2 {
                        Sugerencias(texto: $texto)
                    } else {
                        if let correccion = resultado.correccion {
                            Text("Mostrando resultados de **\(correccion)**").font(.subheadline).foregroundStyle(Color.sigoGris)
                        }
                        let disponibles = resultado.productos.filter(tienda.disponible)
                        Text(Formato.plural(disponibles.count, "producto")).font(.footnote.weight(.semibold)).foregroundStyle(Color.sigoGris)
                        if disponibles.isEmpty {
                            ContentUnavailableView.search(text: texto)
                        } else {
                            RejillaProductos(productos: Array(disponibles.prefix(60)))
                        }
                    }
                }
                .padding()
            }
            .background(Color.sigoCrema)
            .navigationTitle("Buscar")
            .searchable(text: $texto, prompt: "Busca entre 5.000+ productos")
            .task(id: texto) {
                // Pequeña espera para no recalcular en cada tecla
                try? await Task.sleep(for: .milliseconds(150))
                guard !Task.isCancelled else { return }
                resultado = tienda.buscar(texto)
            }
        }
    }
}

private struct Sugerencias: View {
    @Binding var texto: String
    private let frecuentes = ["Harina P.A.N.", "Arroz", "Café", "Queso blanco", "Aceite", "Pañales", "Cerveza", "Detergente"]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Lo más buscado").font(.headline.weight(.black)).foregroundStyle(Color.sigoAzul)
            Text("Escribe aunque sea con errores: «hrina», «arros» o «cafe» también funcionan.")
                .font(.subheadline).foregroundStyle(Color.sigoGris)
            FlowChips(textos: frecuentes) { texto = $0 }
        }
    }
}

/// Chips que pasan a la línea siguiente cuando no caben
private struct FlowChips: View {
    let textos: [String]
    let alElegir: (String) -> Void

    var body: some View {
        GlassEffectContainer(spacing: 8) {
            FlujoHorizontal(espacio: 8) {
                ForEach(textos, id: \.self) { texto in
                    Chip(texto: texto, activo: false) { alElegir(texto) }
                }
            }
        }
    }
}

/// Distribución en filas que se ajustan al ancho disponible
struct FlujoHorizontal: Layout {
    var espacio: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let ancho = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, alto: CGFloat = 0, maximo: CGFloat = 0
        for vista in subviews {
            let tamano = vista.sizeThatFits(.unspecified)
            if x + tamano.width > ancho, x > 0 { x = 0; y += alto + espacio; alto = 0 }
            x += tamano.width + espacio
            alto = max(alto, tamano.height)
            maximo = max(maximo, x - espacio)
        }
        return CGSize(width: min(maximo, ancho), height: y + alto)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, alto: CGFloat = 0
        for vista in subviews {
            let tamano = vista.sizeThatFits(.unspecified)
            if x + tamano.width > bounds.maxX, x > bounds.minX { x = bounds.minX; y += alto + espacio; alto = 0 }
            vista.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(tamano))
            x += tamano.width + espacio
            alto = max(alto, tamano.height)
        }
    }
}
