import SwiftUI

struct InicioView: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    Cabecera()
                    if tienda.indice == nil {
                        ProgressView("Cargando 5.000+ productos…").frame(maxWidth: .infinity).padding(.top, 40)
                    } else {
                        ComprarDeNuevo()
                        BannerTemporada()
                        Estante(titulo: "Ofertas de la semana", productos: tienda.ofertas) {
                            AnyView(ListadoView(titulo: "Ofertas y mejores precios", productos: tienda.ofertasYMejoresPrecios))
                        }
                        Estante(titulo: "Lo esencial de tu mercado", productos: tienda.esenciales)
                        Departamentos()
                    }
                }
                .padding(.bottom, 24)
            }
            .background(Color.sigoCrema)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Image("LogoSigo").resizable().scaledToFit().frame(height: 34).accessibilityLabel("SIGO")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Text("Prototipo").font(.caption.weight(.heavy)).foregroundStyle(Color.sigoAzul)
                        .padding(.horizontal, 10).padding(.vertical, 4)
                        .glassEffect(.regular.tint(.sigoSol), in: .capsule)
                }
            }
            .toolbarBackgroundVisibility(.hidden, for: .navigationBar)
            .refreshable { await tienda.cargar() }
        }
    }
}

/// Bloque azul de bienvenida con la tasa BCV y la entrega, como el inicio de la tienda web
private struct Cabecera: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Sirviendo con amor desde 1972").estiloEtiqueta(.sigoSol)
            Text("¿Qué necesitas hoy?").font(.largeTitle.weight(.black)).foregroundStyle(.white)
            Text("Más de 5.000 productos de Costazul y Sambil, delivery a toda la isla y retiro sin bajarte del carro.")
                .font(.subheadline).foregroundStyle(.white.opacity(0.9))
            GlassEffectContainer(spacing: 8) {
                HStack(spacing: 8) {
                    Button {
                        tienda.pestana = .buscar
                    } label: {
                        Label("Buscar productos", systemImage: "magnifyingglass").font(.subheadline.weight(.bold)).frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.glass)
                    Button {
                        tienda.selectorEntregaAbierto = true
                    } label: {
                        Label(tienda.entrega.modo == .retiro ? tienda.sucursal.corto : (tienda.entrega.municipio ?? "Entrega"),
                              systemImage: tienda.entrega.modo == .retiro ? "car.fill" : "mappin")
                            .font(.subheadline.weight(.bold))
                    }
                    .buttonStyle(.glass)
                }
            }
            if let tasa = tienda.tasa {
                Text("Tasa BCV del \(tasa.fechaCorta): Bs. \(tasa.valor.formatted(.number.precision(.fractionLength(2)).locale(Locale(identifier: "es_VE"))))")
                    .font(.caption.weight(.semibold)).foregroundStyle(.white.opacity(0.9))
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.sigoAzul, in: .rect(cornerRadius: 32))
        .padding(.horizontal)
    }
}

private struct Departamentos: View {
    @Environment(Tienda.self) private var tienda

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Departamentos").font(.title2.weight(.black)).foregroundStyle(Color.sigoAzul)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 12)], spacing: 12) {
                ForEach(tienda.departamentos, id: \.nombre) { departamento in
                    NavigationLink {
                        ListadoView(titulo: nombreLegible(departamento.nombre),
                                    productos: tienda.productos.filter { $0.departamento == departamento.nombre })
                    } label: {
                        HStack(spacing: 10) {
                            if let portada = departamento.portada {
                                ImagenProducto(producto: portada).frame(width: 48, height: 48)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text(nombreLegible(departamento.nombre)).font(.subheadline.weight(.heavy)).foregroundStyle(Color.sigoAzul)
                                    .multilineTextAlignment(.leading)
                                Text("\(departamento.cantidad) productos").font(.caption).foregroundStyle(Color.sigoGris)
                            }
                            Spacer(minLength: 0)
                        }
                        .tarjeta(relleno: 10)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal)
    }
}
