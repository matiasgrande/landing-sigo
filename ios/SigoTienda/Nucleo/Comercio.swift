import Foundation

/// USD -> céntimos enteros, para sumar y redondear sin errores de coma flotante
func aCentimos(_ usd: Double) -> Int { Int((usd * 100).rounded()) }
func desdeCentimos(_ centimos: Int) -> Double { Double(centimos) / 100 }

extension Producto {
    func precioRegular(en sucursal: Sucursal) -> Double {
        sucursal == .sambil ? precioSambil : precioCostazul
    }

    /// Precio que se cobra (con la promoción vigente, si la hay)
    func precio(en sucursal: Sucursal) -> Double {
        let regular = precioRegular(en: sucursal)
        guard descuento > 0 else { return regular }
        return (Double(aCentimos(regular)) * (1 - Double(descuento) / 100)).rounded() / 100
    }

    func ahorro(en sucursal: Sucursal) -> Double {
        desdeCentimos(aCentimos(precioRegular(en: sucursal)) - aCentimos(precio(en: sucursal)))
    }

    func disponible(en sucursal: Sucursal) -> Bool {
        sucursal == .sambil ? disponibleSambil : disponibleCostazul
    }

    var disponibleEnAlguna: Bool { disponibleCostazul || disponibleSambil }

    /// Dato real: cuesta al menos 3 % menos aquí que en la otra tienda
    func masBarato(en sucursal: Sucursal) -> Bool {
        disponible(en: sucursal) && disponible(en: sucursal.otra) && precioRegular(en: sucursal) < precioRegular(en: sucursal.otra) * 0.97
    }

    /// Precio por kg o por litro ("$2.40 /kg"); nada en farmacia, donde "1G" es la dosis
    func precioPorUnidad(en sucursal: Sucursal) -> String? {
        guard !"\(departamento) \(categoria)".lowercased().coincide("farmacia|salud|medic"),
              let contenido = Medidas.contenido(nombre), contenido.cantidad != 1, contenido.cantidad >= 0.01
        else { return nil }
        return "\(Formato.usd(precio(en: sucursal) / contenido.cantidad)) /\(contenido.unidad)"
    }
}

enum Medidas {
    private static func primeraCoincidencia(_ texto: String, _ patron: String) -> [String]? {
        guard let expresion = try? NSRegularExpression(pattern: patron, options: [.caseInsensitive]),
              let resultado = expresion.firstMatch(in: texto, range: NSRange(texto.startIndex..., in: texto))
        else { return nil }
        return (0..<resultado.numberOfRanges).map { indice in
            Range(resultado.range(at: indice), in: texto).map { String(texto[$0]) } ?? ""
        }
    }

    /// Contenido del envase: "Aceite 1 L." -> (1, "L"); "Arroz 800 Gr" -> (0,8, "kg")
    static func contenido(_ nombre: String) -> (cantidad: Double, unidad: String)? {
        guard let grupos = primeraCoincidencia(nombre, #"(\d+(?:[.,]\d+)?)\s*(kgs?|k|grs?|g|ml|lts?|l|cc)\b"#),
              let valor = Double(grupos[1].replacingOccurrences(of: ",", with: ".")), valor > 0
        else { return nil }
        let unidad = grupos[2].lowercased()
        if unidad.hasPrefix("k") { return (valor, "kg") }
        if unidad.hasPrefix("g") { return (valor / 1000, "kg") }
        if unidad == "ml" || unidad == "cc" { return (valor / 1000, "L") }
        return (valor, "L")
    }

    /// Gramos del paquete según su nombre: "Carne Molida 400 Gr" -> 400
    static func gramosDelPaquete(_ nombre: String) -> Double? {
        guard let contenido = contenido(nombre), contenido.unidad == "kg" else { return nil }
        return contenido.cantidad * 1000
    }

    /// Litros del envase: "Coca-Cola 2 L" -> 2; "Lata 355 Ml" -> 0,355
    static func litrosDelEnvase(_ nombre: String) -> Double? {
        guard let contenido = contenido(nombre), contenido.unidad == "L" else { return nil }
        return contenido.cantidad
    }

    /// Unidades de un multipack: "Huevos 15 Und" -> 15
    static func unidadesDelPack(_ nombre: String) -> Int? {
        guard let grupos = primeraCoincidencia(nombre, #"(\d+)\s*(?:unidades|und|unds|unid|pack|uds)\b"#),
              let unidades = Int(grupos[1]), unidades > 1
        else { return nil }
        return unidades
    }
}

/// Totales de un pedido en céntimos exactos
struct Totales: Equatable, Sendable {
    let subtotal: Double
    /// nil: municipio sin elegir
    let envio: Double?
    let igtf: Double
    let total: Double
    /// Lo que falta para la compra mínima (0 si ya se alcanzó)
    let faltante: Double

    init(lineas: [LineaCarrito], entrega: Entrega, conIgtf: Bool) {
        let centimos = lineas.filter(\.disponible).reduce(0) { $0 + aCentimos($1.subtotal) }
        subtotal = desdeCentimos(centimos)
        envio = Comercio.tarifa(entrega)
        let base = centimos + aCentimos(envio ?? 0)
        // IGTF al céntimo: 18,50 -> 0,56
        let igtfCentimos = conIgtf ? Int((Double(base * Datos.tasaIgtfPorcentaje) / 100).rounded()) : 0
        igtf = desdeCentimos(igtfCentimos)
        total = desdeCentimos(base + igtfCentimos)
        faltante = desdeCentimos(max(0, aCentimos(Datos.minimoCompraUsd) - centimos))
    }
}

enum Comercio {
    static func tarifa(_ entrega: Entrega) -> Double? {
        if entrega.modo == .retiro { return 0 }
        guard let municipio = entrega.municipio else { return nil }
        return Datos.tarifas.first { $0.municipio == municipio }?.tarifaUsd
    }

    /// Líneas del carrito con el precio y la existencia de la tienda que atiende
    static func lineas(cantidades: [Int: Int], productos: [Int: Producto], sucursal: Sucursal) -> [LineaCarrito] {
        cantidades.compactMap { id, cantidad in
            guard let producto = productos[id] else { return nil }
            let precio = producto.precio(en: sucursal)
            return LineaCarrito(
                producto: producto,
                cantidad: cantidad,
                precio: precio,
                subtotal: desdeCentimos(aCentimos(precio * Double(cantidad))),
                disponible: producto.disponible(en: sucursal)
            )
        }
        .sorted { $0.producto.nombre.localizedCompare($1.producto.nombre) == .orderedAscending }
    }

    struct TotalSucursal: Identifiable, Sendable {
        let sucursal: Sucursal
        let total: Double
        let faltantes: Int
        var id: Sucursal { sucursal }
    }

    /// El mismo carrito en cada tienda: precio y existencias reales
    static func comparar(cantidades: [Int: Int], productos: [Int: Producto]) -> [TotalSucursal] {
        Sucursal.allCases.map { sucursal in
            var centimos = 0, faltantes = 0
            for (id, cantidad) in cantidades {
                guard let producto = productos[id] else { continue }
                if producto.disponible(en: sucursal) {
                    centimos += aCentimos(producto.precio(en: sucursal) * Double(cantidad))
                } else {
                    faltantes += 1
                }
            }
            return TotalSucursal(sucursal: sucursal, total: desdeCentimos(centimos), faltantes: faltantes)
        }
    }

    /// Teléfono venezolano: móvil 04xx o fijo 02xx, con o sin +58
    static func esTelefonoVenezolano(_ texto: String) -> Bool {
        guard texto.coincide(#"^[+\d\s().-]+$"#) else { return false }
        var digitos = texto.filter(\.isNumber)
        if digitos.hasPrefix("58") { digitos = "0" + digitos.dropFirst(2) }
        return digitos.coincide(#"^0[24]\d{9}$"#) && !digitos.coincide(#"^0(\d)\1{9}$"#)
    }

    /// WhatsApp de cualquier país (quien compra puede estar fuera)
    static func esTelefonoInternacional(_ texto: String) -> Bool {
        if esTelefonoVenezolano(texto) { return true }
        guard texto.coincide(#"^\+[\d\s().-]+$"#) else { return false }
        let digitos = texto.filter(\.isNumber)
        return (8...15).contains(digitos.count) && !digitos.coincide(#"^(\d)\1+$"#)
    }

    /// "0412 123 4567" -> "584121234567" para wa.me
    static func numeroWhatsApp(_ texto: String) -> String {
        let digitos = texto.filter(\.isNumber)
        return digitos.hasPrefix("0") ? "58" + digitos.dropFirst() : digitos
    }

    /// Al menos `minimo` letras: descarta "123", "!!!" o "........"
    static func tieneLetras(_ texto: String, _ minimo: Int) -> Bool {
        texto.filter(\.isLetter).count >= minimo
    }

    static func enlaceWhatsApp(_ numero: String, _ mensaje: String) -> URL? {
        var componentes = URLComponents(string: "https://wa.me/\(numero)")
        componentes?.queryItems = [URLQueryItem(name: "text", value: mensaje)]
        return componentes?.url
    }

    /// Texto del pedido para WhatsApp: solo lo que tiene existencia, con desglose y sustitutos
    static func mensajePedido(
        lineas: [LineaCarrito],
        entrega: Entrega,
        totales: Totales,
        encabezado: String = "¡Hola Sigo! Quiero hacer este pedido:",
        sustitutos: [Int: PreferenciaSustituto]? = nil
    ) -> String {
        let destino = entrega.modo == .retiro
            ? "Retiro en \(entrega.sucursal.corto)"
            : "Delivery a \(entrega.municipio ?? "(municipio por confirmar)") desde \(entrega.sucursal.corto)"
        let envio = entrega.modo == .retiro ? "Retiro: gratis" : totales.envio.map { "Envío: \(Formato.usd($0))" } ?? "Envío: por confirmar"
        var partes = [encabezado, ""]
        partes += lineas.filter(\.disponible).map { linea in
            let sustituto = sustitutos.map { " · si no hay: \(($0[linea.producto.id] ?? .similar).texto.lowercased())" } ?? ""
            return "• \(linea.cantidad) × \(linea.producto.nombre) (\(Formato.usd(linea.subtotal)))\(sustituto)"
        }
        partes += ["", destino, "Productos: \(Formato.usd(totales.subtotal))", envio]
        if totales.igtf > 0 { partes.append("IGTF (3 %): \(Formato.usd(totales.igtf))") }
        partes.append("Total referencial: \(Formato.usd(totales.total))")
        return partes.joined(separator: "\n")
    }

    /// Número de pedido de demostración
    static func numeroPedido() -> String {
        String(format: "SG-%06d", Int.random(in: 0..<1_000_000))
    }
}

enum Formato {
    private static let usdFormato: NumberFormatter = {
        let formato = NumberFormatter()
        formato.locale = Locale(identifier: "en_US")
        formato.numberStyle = .decimal
        formato.minimumFractionDigits = 2
        formato.maximumFractionDigits = 2
        return formato
    }()

    private static let bsFormato: NumberFormatter = {
        let formato = NumberFormatter()
        formato.locale = Locale(identifier: "es_VE")
        formato.numberStyle = .decimal
        formato.groupingSeparator = "."
        formato.decimalSeparator = ","
        formato.minimumFractionDigits = 2
        formato.maximumFractionDigits = 2
        return formato
    }()

    /// "$1,234.56", como la web
    static func usd(_ monto: Double) -> String {
        "$" + (usdFormato.string(from: NSNumber(value: monto)) ?? String(format: "%.2f", monto))
    }

    /// "Bs. 1.234,56" a la tasa BCV
    static func bs(_ montoUsd: Double, tasa: Double) -> String {
        "Bs. " + (bsFormato.string(from: NSNumber(value: montoUsd * tasa)) ?? String(format: "%.2f", montoUsd * tasa))
    }

    /// "1 artículo", "3 artículos"
    static func plural(_ cantidad: Int, _ singular: String, _ varios: String? = nil) -> String {
        "\(cantidad) \(cantidad == 1 ? singular : (varios ?? singular + "s"))"
    }
}
