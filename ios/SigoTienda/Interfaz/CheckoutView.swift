import SwiftUI

/// Checkout en 3 pasos (Entrega, Pago, Confirmar), sin cuenta, con compra para otra persona
struct CheckoutView: View {
    @Environment(Tienda.self) private var tienda
    @State private var paso = 1
    @State private var nombre = ""
    @State private var telefono = ""
    @State private var direccion = ""
    @State private var referencia = ""
    @State private var franja = ""
    @State private var metodoId = "pago-movil"
    @State private var paraOtro = false
    @State private var receptorNombre = ""
    @State private var receptorTelefono = ""
    @State private var errores: [String: String] = [:]
    @State private var confirmado: Confirmacion?
    @FocusState private var foco: Campo?

    enum Campo: Hashable { case receptorNombre, receptorTelefono, nombre, telefono, direccion }

    struct Confirmacion: Identifiable {
        let numero: String
        let mensaje: String
        let aPagos: Bool
        let aviso: (nombre: String, enlace: URL)?
        var id: String { numero }
    }

    private var metodo: MetodoPago { Datos.metodosPago.first { $0.id == metodoId } ?? Datos.metodosPago[0] }
    private var totales: Totales { tienda.totales(conIgtf: metodo.igtf) }

    /// "Hoy" solo si falta al menos una hora para que empiece la franja (hora de Margarita)
    private var horarios: [String] {
        var calendario = Calendar(identifier: .gregorian)
        calendario.timeZone = TimeZone(identifier: "America/Caracas") ?? .current
        let hora = calendario.component(.hour, from: Date())
        let franjas: [(String, Int)] = [("10:00 a.m. – 12:00 m.", 10), ("12:00 m. – 2:00 p.m.", 12), ("2:00 p.m. – 4:00 p.m.", 14), ("4:00 p.m. – 7:00 p.m.", 16)]
        return franjas.filter { hora < $0.1 - 1 }.map { "Hoy · \($0.0)" } + franjas.map { "Mañana · \($0.0)" }
    }

    var body: some View {
        Form {
            Section {
                Picker("Paso", selection: .constant(paso)) {
                    Text("1. Entrega").tag(1)
                    Text("2. Pago").tag(2)
                    Text("3. Confirmar").tag(3)
                }
                .pickerStyle(.segmented)
                .disabled(true)
                .accessibilityLabel("Paso \(paso) de 3")
            }
            .listRowBackground(Color.clear)

            if !errores.isEmpty {
                Section {
                    Label("Revisa \(Formato.plural(errores.count, "campo")) para continuar.", systemImage: "exclamationmark.triangle.fill")
                        .foregroundStyle(Color.sigoError).font(.subheadline.weight(.bold))
                }
            }

            switch paso {
            case 1: pasoEntrega
            case 2: pasoPago
            default: pasoConfirmar
            }

            Section("Resumen") {
                FilaTotal(titulo: "Productos (\(tienda.lineasCobrables.reduce(0) { $0 + $1.cantidad }))", valor: Formato.usd(totales.subtotal))
                FilaTotal(titulo: tienda.entrega.modo == .retiro ? "Retiro" : "Envío",
                          valor: tienda.entrega.modo == .retiro ? "Gratis" : (totales.envio.map(Formato.usd) ?? "—"))
                if totales.igtf > 0 { FilaTotal(titulo: "IGTF (3 %)", valor: Formato.usd(totales.igtf)) }
                FilaTotal(titulo: "Total", valor: Formato.usd(totales.total), destacado: true)
                if let tasa = tienda.tasa {
                    Text(Formato.bs(totales.total, tasa: tasa.valor)).font(.footnote).foregroundStyle(Color.sigoGris)
                }
            }
        }
        .navigationTitle(["¿Cómo y dónde lo recibes?", "¿Cómo pagas?", "Revisa y confirma"][paso - 1])
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(paso > 1)
        .toolbar {
            if paso > 1 {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Atrás", systemImage: "chevron.left") { withAnimation { paso -= 1 } }
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            Button(action: continuar) {
                Text(paso == 3 ? "Confirmar pedido · \(Formato.usd(totales.total))" : "Continuar")
                    .font(.headline.weight(.heavy)).frame(maxWidth: .infinity, minHeight: 34)
            }
            .buttonStyle(.glassProminent)
            .tint(.sigoVerde)
            .disabled(totales.faltante > 0 || tienda.lineasCobrables.isEmpty)
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .onAppear { if franja.isEmpty { franja = horarios.first ?? "" } }
        .fullScreenCover(item: $confirmado) { confirmacion in
            ConfirmacionView(confirmacion: confirmacion)
        }
    }

    // MARK: Pasos

    @ViewBuilder private var pasoEntrega: some View {
        @Bindable var tienda = tienda
        Section {
            Picker("Modalidad", selection: $tienda.entrega.modo) {
                ForEach(ModoEntrega.allCases) { Text($0.titulo).tag($0) }
            }
            .pickerStyle(.segmented)
            if tienda.entrega.modo == .delivery {
                Picker("Municipio", selection: $tienda.entrega.municipio) {
                    Text("Elige tu municipio").tag(String?.none)
                    ForEach(Datos.tarifas) { Text("\($0.municipio) · envío \(Formato.usd($0.tarifaUsd))").tag(Optional($0.municipio)) }
                }
                error("municipio")
                TextField("Dirección: urbanización, calle, casa", text: $direccion, axis: .vertical)
                    .textContentType(.fullStreetAddress).focused($foco, equals: .direccion)
                error("direccion")
                TextField("Punto de referencia (opcional)", text: $referencia)
            } else {
                Picker("Tienda de retiro", selection: $tienda.entrega.sucursal) {
                    ForEach(Sucursal.allCases) { Text($0.corto).tag($0) }
                }
            }
            Picker(tienda.entrega.modo == .delivery ? "Horario de entrega" : "Horario de retiro", selection: $franja) {
                ForEach(horarios, id: \.self) { Text($0).tag($0) }
            }
        }

        Section {
            Toggle(isOn: $paraOtro.animation()) {
                VStack(alignment: .leading) {
                    Text("Es para otra persona").font(.headline.weight(.heavy))
                    Text("Ideal si estás fuera de Venezuela: pagas tú y tu familia en Margarita lo recibe.").font(.caption).foregroundStyle(Color.sigoGris)
                }
            }
            .tint(.sigoVerde)
            if paraOtro {
                TextField("Nombre de quien recibe", text: $receptorNombre).textContentType(.name).focused($foco, equals: .receptorNombre)
                error("receptorNombre")
                TextField("Su teléfono en Venezuela (0412 1234567)", text: $receptorTelefono).keyboardType(.phonePad).focused($foco, equals: .receptorTelefono)
                error("receptorTelefono")
            }
        }

        Section {
            TextField(paraOtro ? "Tu nombre y apellido" : "Nombre y apellido", text: $nombre).textContentType(.name).focused($foco, equals: .nombre)
            error("nombre")
            TextField(paraOtro ? "Tu WhatsApp (+1 305 555 0123)" : "Teléfono (0412 1234567)", text: $telefono)
                .keyboardType(.phonePad).textContentType(.telephoneNumber).focused($foco, equals: .telefono)
            error("telefono")
        } footer: {
            Text("No necesitas crear una cuenta para comprar.")
        }
    }

    @ViewBuilder private var pasoPago: some View {
        Section {
            ForEach(Datos.metodosPago) { opcion in
                Button {
                    metodoId = opcion.id
                } label: {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: metodoId == opcion.id ? "largecircle.fill.circle" : "circle")
                            .foregroundStyle(Color.sigoAzul).font(.title3)
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Text(opcion.nombre).font(.headline.weight(.heavy)).foregroundStyle(Color.sigoAzul)
                                if opcion.igtf { Pastilla(texto: "+ IGTF 3 %", color: .sigoSol) }
                                if paraOtro && opcion.desdeElExterior { Pastilla(texto: "Ideal desde el exterior", color: .sigoVerde) }
                            }
                            Text("\(opcion.detalle) · \(opcion.confirmacion)").font(.caption).foregroundStyle(Color.sigoGris)
                        }
                    }
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(metodoId == opcion.id ? .isSelected : [])
            }
        }
    }

    @ViewBuilder private var pasoConfirmar: some View {
        Section("Entrega") {
            Text(tienda.entrega.modo == .retiro
                 ? "Retiro en \(tienda.sucursal.nombre)"
                 : "Delivery a \(tienda.entrega.municipio ?? ""): \(direccion)\(referencia.isEmpty ? "" : " (\(referencia))")")
            Text(franja).foregroundStyle(Color.sigoGris)
        }
        Section(paraOtro ? "Compra y paga" : "Contacto") { Text("\(nombre) · \(telefono)") }
        if paraOtro { Section("Recibe") { Text("\(receptorNombre) · \(receptorTelefono)") } }
        Section("Pago") { Text("\(metodo.nombre) · \(metodo.confirmacion)") }
        Section {
            ForEach(tienda.lineasCobrables) { linea in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("\(linea.cantidad) × \(linea.producto.nombre)").font(.subheadline)
                        Spacer()
                        Text(Formato.usd(linea.subtotal)).font(.subheadline.weight(.bold))
                    }
                    Picker("Si no hay", selection: Binding(
                        get: { tienda.sustitutos[linea.producto.id] ?? .similar },
                        set: { tienda.sustitutos[linea.producto.id] = $0 }
                    )) {
                        ForEach(PreferenciaSustituto.allCases) { Text($0.texto).tag($0) }
                    }
                    .font(.caption)
                }
            }
        } header: {
            Text("Si algo no está al preparar tu pedido")
        }
    }

    @ViewBuilder private func error(_ campo: String) -> some View {
        if let mensaje = errores[campo] {
            Text(mensaje).font(.caption.weight(.bold)).foregroundStyle(Color.sigoError)
        }
    }

    // MARK: Validación y confirmación

    private func validar() -> [String: String] {
        var nuevos: [String: String] = [:]
        if paraOtro {
            if !Comercio.tieneLetras(receptorNombre, 3) { nuevos["receptorNombre"] = "Escribe el nombre de quien recibe." }
            if !Comercio.esTelefonoVenezolano(receptorTelefono.trimmingCharacters(in: .whitespaces)) {
                nuevos["receptorTelefono"] = "Escribe un teléfono venezolano, por ejemplo 0412 1234567."
            }
            if !Comercio.esTelefonoInternacional(telefono.trimmingCharacters(in: .whitespaces)) {
                nuevos["telefono"] = "Escribe tu WhatsApp con código de país, por ejemplo +1 305 555 0123."
            }
        } else if !Comercio.esTelefonoVenezolano(telefono.trimmingCharacters(in: .whitespaces)) {
            nuevos["telefono"] = "Escribe un teléfono válido, por ejemplo 0412 1234567."
        }
        if !Comercio.tieneLetras(nombre, 3) { nuevos["nombre"] = "Escribe tu nombre y apellido." }
        if tienda.entrega.modo == .delivery {
            if Comercio.tarifa(tienda.entrega) == nil { nuevos["municipio"] = "Elige el municipio de entrega." }
            if !Comercio.tieneLetras(direccion, 5) { nuevos["direccion"] = "Escribe la dirección (urbanización, calle, casa)." }
        }
        return nuevos
    }

    private func continuar() {
        if paso == 1 {
            errores = validar()
            // El foco va al primer campo con error, en el orden en que aparecen
            let orden: [(String, Campo)] = [("direccion", .direccion), ("receptorNombre", .receptorNombre), ("receptorTelefono", .receptorTelefono), ("nombre", .nombre), ("telefono", .telefono)]
            if !errores.isEmpty {
                foco = orden.first { errores[$0.0] != nil }?.1
                return
            }
        }
        if paso < 3 {
            withAnimation { paso += 1 }
            return
        }
        confirmar()
    }

    private func confirmar() {
        let numero = Comercio.numeroPedido()
        let entrega = tienda.entrega
        var partes = [
            Comercio.mensajePedido(lineas: tienda.lineas, entrega: entrega, totales: totales,
                                   encabezado: "¡Hola Sigo! Confirmo mi pedido \(numero):", sustitutos: tienda.sustitutos),
            "Pago: \(metodo.nombre)",
        ]
        if entrega.modo == .delivery { partes.append("Dirección: \(direccion)\(referencia.isEmpty ? "" : " (\(referencia))")") }
        partes.append("Horario: \(franja)")
        if paraOtro { partes.append("Recibe: \(receptorNombre) · \(receptorTelefono)") }
        partes.append("\(paraOtro ? "Compra y paga" : "A nombre de"): \(nombre) · \(telefono)")

        var aviso: (nombre: String, enlace: URL)?
        if paraOtro {
            let lugar = entrega.modo == .retiro ? "para retirar en \(entrega.sucursal.nombre)" : "a \(direccion)"
            let texto = "¡Hola \(receptorNombre)! Te envié un mercado de SIGO (pedido \(numero)) \(lugar), \(franja). Un abrazo, \(nombre)."
            if let enlace = Comercio.enlaceWhatsApp(Comercio.numeroWhatsApp(receptorTelefono), texto) { aviso = (receptorNombre, enlace) }
        }

        tienda.registrar(PedidoGuardado(
            numero: numero, fecha: Date(), sucursal: entrega.sucursal, modo: entrega.modo,
            lineas: tienda.lineasCobrables.map { .init(id: $0.producto.id, cantidad: $0.cantidad, nombre: $0.producto.nombre) },
            total: totales.total, paraOtro: paraOtro ? receptorNombre : nil
        ))
        confirmado = Confirmacion(numero: numero, mensaje: partes.joined(separator: "\n"), aPagos: metodo.igtf || metodo.id == "pago-movil", aviso: aviso)
        // El pedido queda confirmado: el carrito se vacía (no se puede repetir por error)
        tienda.vaciar()
    }
}

private struct ConfirmacionView: View {
    @Environment(Tienda.self) private var tienda
    @Environment(\.dismiss) private var cerrar
    let confirmacion: CheckoutView.Confirmacion

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Image(systemName: "checkmark.seal.fill").font(.system(size: 72)).foregroundStyle(Color.sigoVerde).symbolEffect(.bounce, value: confirmacion.numero)
            Text("¡Pedido \(confirmacion.numero) listo!").font(.largeTitle.weight(.black)).foregroundStyle(Color.sigoAzul).multilineTextAlignment(.center)
            Text("Este es un prototipo: el pedido no se registró en la tienda. Para hacerlo real, envíalo por WhatsApp y un asesor lo confirma.")
                .multilineTextAlignment(.center).foregroundStyle(Color.sigoGris)
            Spacer()
            GlassEffectContainer(spacing: 12) {
                VStack(spacing: 12) {
                    if let enlace = Comercio.enlaceWhatsApp(confirmacion.aPagos ? Datos.whatsappPagos : Datos.whatsappAtencion, confirmacion.mensaje) {
                        Link(destination: enlace) {
                            Label("Enviar pedido por WhatsApp", systemImage: "paperplane.fill").font(.headline.weight(.heavy)).frame(maxWidth: .infinity, minHeight: 34)
                        }
                        .buttonStyle(.glassProminent).tint(.sigoVerde)
                    }
                    if let aviso = confirmacion.aviso {
                        Link(destination: aviso.enlace) {
                            Label("Avisarle a \(aviso.nombre)", systemImage: "heart.fill").font(.headline.weight(.heavy)).frame(maxWidth: .infinity, minHeight: 34)
                        }
                        .buttonStyle(.glassProminent).tint(.sigoAzul)
                    }
                    Button {
                        cerrar()
                        tienda.pestana = .inicio
                    } label: {
                        Text("Volver a la tienda").font(.headline.weight(.heavy)).frame(maxWidth: .infinity, minHeight: 34)
                    }
                    .buttonStyle(.glass)
                }
            }
        }
        .padding(24)
        .background(Color.sigoCrema)
    }
}
