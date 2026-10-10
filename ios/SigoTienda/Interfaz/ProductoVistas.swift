import SwiftUI

/// Foto del producto (servida por sigo.com.ve) con la inicial como respaldo
struct ImagenProducto: View {
    let producto: Producto
    var radio: CGFloat = 16

    var body: some View {
        AsyncImage(url: producto.imagen) { fase in
            switch fase {
            case let .success(imagen):
                imagen.resizable().scaledToFit().padding(6)
            default:
                Text(String(producto.nombre.prefix(1)))
                    .font(.system(size: 34, weight: .black, design: .rounded))
                    .foregroundStyle(Color.sigoAzul.opacity(0.2))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.white, in: .rect(cornerRadius: radio))
        .accessibilityHidden(true)
    }
}

/// Precio en USD con su equivalente en Bs a la tasa BCV
struct PrecioVista: View {
    @Environment(Tienda.self) private var tienda
    let usd: Double
    var anterior: Double? = nil
    var grande = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(Formato.usd(usd))
                    .font(grande ? .largeTitle.weight(.black) : .headline.weight(.black))
                    .foregroundStyle(Color.sigoAzul)
                if let anterior, anterior > usd {
                    Text(Formato.usd(anterior)).font(.footnote.weight(.bold)).strikethrough().foregroundStyle(Color.sigoGris)
                }
            }
            if let tasa = tienda.tasa {
                Text(Formato.bs(usd, tasa: tasa.valor)).font(grande ? .subheadline : .caption).foregroundStyle(Color.sigoGris)
            }
        }
    }
}

/// "Agregar" que se transforma en contador dentro del mismo vidrio (Liquid Glass morph)
struct ControlCantidad: View {
    @Environment(Tienda.self) private var tienda
    @Namespace private var vidrio
    let producto: Producto
    var compacto = true

    var body: some View {
        let cantidad = tienda.cantidad(de: producto)
        GlassEffectContainer {
            if !tienda.disponible(producto) {
                Text("Sin existencia")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Color.sigoGris)
                    .frame(maxWidth: .infinity, minHeight: 44)
                    .glassEffect(.regular, in: .capsule)
            } else if cantidad == 0 {
                Button {
                    withAnimation(.bouncy) { tienda.agregar(producto) }
                } label: {
                    Label("Agregar", systemImage: "cart.badge.plus")
                        .font(compacto ? .subheadline.weight(.heavy) : .headline.weight(.heavy))
                        .frame(maxWidth: .infinity, minHeight: compacto ? 30 : 40)
                }
                .buttonStyle(.glassProminent)
                .tint(.sigoVerde)
                .glassEffectID("control", in: vidrio)
                .accessibilityLabel("Agregar \(producto.nombre) al carrito")
            } else {
                HStack {
                    Button {
                        withAnimation(.bouncy) { tienda.agregar(producto, -1) }
                    } label: {
                        Image(systemName: cantidad == 1 ? "trash" : "minus").frame(width: 44, height: 44)
                    }
                    .buttonStyle(.borderless)
                    .accessibilityLabel("Quitar uno de \(producto.nombre)")
                    Spacer(minLength: 0)
                    Text("\(cantidad)").font(.headline.weight(.black)).contentTransition(.numericText())
                    Spacer(minLength: 0)
                    Button {
                        withAnimation(.bouncy) { tienda.agregar(producto) }
                    } label: {
                        Image(systemName: "plus").frame(width: 44, height: 44)
                    }
                    .buttonStyle(.borderless)
                    .disabled(cantidad >= Datos.maximoPorProducto)
                    .accessibilityLabel("Agregar otro de \(producto.nombre)")
                }
                .foregroundStyle(.white)
                .glassEffect(.regular.tint(.sigoAzul).interactive(), in: .capsule)
                .glassEffectID("control", in: vidrio)
            }
        }
        .sensoryFeedback(.increase, trigger: cantidad)
    }
}

/// Tarjeta de producto para rejillas y estantes
struct TarjetaProducto: View {
    @Environment(Tienda.self) private var tienda
    let producto: Producto

    var body: some View {
        let sucursal = tienda.sucursal
        let ahorro = producto.ahorro(en: sucursal)
        VStack(alignment: .leading, spacing: 8) {
            Button {
                tienda.productoAbierto = producto
            } label: {
                ImagenProducto(producto: producto)
                    .aspectRatio(1, contentMode: .fit)
                    .overlay(alignment: .topLeading) {
                        if ahorro > 0 {
                            Pastilla(texto: "-\(producto.descuento)%", color: .sigoCoral).padding(6)
                        } else if producto.masBarato(en: sucursal) {
                            Pastilla(texto: "Mejor precio", color: .sigoVerde).padding(6)
                        }
                    }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Ver detalles de \(producto.nombre)")

            Text(producto.nombre)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Color.sigoTinta)
                .lineLimit(2, reservesSpace: true)
            Spacer(minLength: 0)
            PrecioVista(usd: producto.precio(en: sucursal), anterior: ahorro > 0 ? producto.precioRegular(en: sucursal) : nil)
            if let porUnidad = producto.precioPorUnidad(en: sucursal) {
                Text(porUnidad).font(.caption2).foregroundStyle(Color.sigoGris)
            }
            ControlCantidad(producto: producto)
        }
        .tarjeta(relleno: 12)
    }
}

/// Rejilla adaptable: 2 columnas en iPhone
struct RejillaProductos: View {
    let productos: [Producto]

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 158), spacing: 12)], spacing: 12) {
            ForEach(productos) { producto in
                TarjetaProducto(producto: producto)
            }
        }
    }
}

/// Estante horizontal (ofertas, lo esencial)
struct Estante: View {
    let titulo: String
    let productos: [Producto]
    var destino: (() -> AnyView)? = nil

    var body: some View {
        if !productos.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .firstTextBaseline) {
                    Text(titulo).font(.title2.weight(.black)).foregroundStyle(Color.sigoAzul)
                    Spacer()
                    if let destino {
                        NavigationLink("Ver todo") { destino() }.font(.subheadline.weight(.heavy))
                    }
                }
                .padding(.horizontal)
                ScrollView(.horizontal) {
                    LazyHStack(spacing: 12) {
                        ForEach(productos) { producto in
                            TarjetaProducto(producto: producto).frame(width: 168)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 4)
                }
                .scrollIndicators(.hidden)
            }
        }
    }
}

/// Ficha del producto: precio y existencia en cada tienda, similares y enlace a la tienda actual
struct FichaProducto: View {
    @Environment(Tienda.self) private var tienda
    @Environment(\.dismiss) private var cerrar
    let producto: Producto

    var body: some View {
        let sucursal = tienda.sucursal
        let ahorro = producto.ahorro(en: sucursal)
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ImagenProducto(producto: producto, radio: 28)
                        .frame(height: 260)
                        .overlay(RoundedRectangle(cornerRadius: 28).strokeBorder(Color.sigoAzul.opacity(0.06)))
                    Text("\(nombreLegible(producto.departamento)) › \(nombreLegible(producto.categoria))")
                        .font(.footnote.weight(.bold)).foregroundStyle(Color.sigoVerde)
                    Text(producto.nombre).font(.title2.weight(.black)).foregroundStyle(Color.sigoAzul)
                    if ahorro > 0 { Pastilla(texto: "Promoción -\(producto.descuento)%") }
                    PrecioVista(usd: producto.precio(en: sucursal), anterior: ahorro > 0 ? producto.precioRegular(en: sucursal) : nil, grande: true)
                    if let porUnidad = producto.precioPorUnidad(en: sucursal) {
                        Text(porUnidad).font(.footnote).foregroundStyle(Color.sigoGris)
                    }
                    ControlCantidad(producto: producto, compacto: false)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("En cada tienda").estiloEtiqueta(.sigoGris)
                        ForEach(Sucursal.allCases) { clave in
                            HStack {
                                Text(clave.corto + (clave == sucursal ? " (te atiende)" : ""))
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(clave == sucursal ? Color.sigoAzul : Color.sigoTinta)
                                Spacer()
                                Text(Formato.usd(producto.precio(en: clave))).font(.subheadline.weight(.bold))
                                Text(producto.disponible(en: clave) ? "Disponible" : "Sin existencia")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(producto.disponible(en: clave) ? Color.sigoVerde : Color.sigoGris)
                            }
                        }
                    }
                    .padding()
                    .background(Color.sigoCrema, in: .rect(cornerRadius: 20))

                    if let enlace = producto.enlace {
                        Link("Ver en la tienda actual de sigo.com.ve", destination: enlace).font(.footnote.weight(.bold))
                    }

                    let similares = tienda.similares(a: producto)
                    if !similares.isEmpty {
                        Text("Similares disponibles").font(.headline.weight(.black)).foregroundStyle(Color.sigoAzul)
                        ScrollView(.horizontal) {
                            HStack(spacing: 12) {
                                ForEach(similares) { similar in
                                    Button {
                                        tienda.productoAbierto = similar
                                    } label: {
                                        VStack(alignment: .leading, spacing: 4) {
                                            ImagenProducto(producto: similar).frame(width: 120, height: 120)
                                            Text(similar.nombre).font(.caption.weight(.bold)).lineLimit(2).foregroundStyle(Color.sigoTinta)
                                            Text(Formato.usd(similar.precio(en: sucursal))).font(.subheadline.weight(.black)).foregroundStyle(Color.sigoAzul)
                                        }
                                        .frame(width: 120)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .scrollIndicators(.hidden)
                    }
                }
                .padding()
            }
            .background(Color.sigoCrema.opacity(0.5))
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cerrar", systemImage: "xmark") { cerrar() }
                }
            }
        }
    }
}
