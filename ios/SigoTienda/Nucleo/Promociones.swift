import Foundation

/// Promoción del prototipo: sigo.com.ve no publica descuentos, así que se muestran unas de ejemplo
struct Promocion: Codable, Hashable, Sendable {
    let id: Int
    let descuento: Int
    /// Último día vigente (AAAA-MM-DD, hora de Margarita)
    let hasta: String
}

enum Promociones {
    private static let semillas: [(consulta: String, descuento: Int)] = [
        ("harina maiz pan", 10), ("cafe", 15), ("aceite", 10), ("queso blanco", 12),
        ("pasta", 10), ("detergente", 20), ("papel higienico", 15), ("cerveza polar", 8),
    ]

    /// Hoy en Margarita, AAAA-MM-DD
    static func hoy(_ fecha: Date = Date()) -> String {
        let formato = DateFormatter()
        formato.calendar = Calendar(identifier: .gregorian)
        formato.locale = Locale(identifier: "en_US_POSIX")
        formato.timeZone = TimeZone(identifier: "America/Caracas")
        formato.dateFormat = "yyyy-MM-dd"
        return formato.string(from: fecha)
    }

    /// Último día del mes en curso
    static func finDeMes(_ fecha: Date = Date()) -> String {
        var calendario = Calendar(identifier: .gregorian)
        calendario.timeZone = TimeZone(identifier: "America/Caracas") ?? .current
        guard let rango = calendario.range(of: .day, in: .month, for: fecha) else { return hoy(fecha) }
        let partes = hoy(fecha).split(separator: "-")
        return "\(partes[0])-\(partes[1])-\(String(format: "%02d", rango.count))"
    }

    /// Promociones de ejemplo resueltas contra el catálogo real (primer resultado con existencia y foto)
    static func deEjemplo(_ indice: IndiceCatalogo) -> [Promocion] {
        var vistos = Set<Int>()
        let hasta = finDeMes()
        return semillas.compactMap { semilla in
            let producto = indice.buscar(semilla.consulta, esPrefijo: false, disponible: \.disponibleEnAlguna).productos
                .first { $0.disponibleEnAlguna && $0.imagen != nil && !vistos.contains($0.id) }
            guard let producto else { return nil }
            vistos.insert(producto.id)
            return Promocion(id: producto.id, descuento: semilla.descuento, hasta: hasta)
        }
    }

    static func aplicar(_ promociones: [Promocion], a productos: [Producto], hoy: String = hoy()) -> [Producto] {
        let vigentes = Dictionary(promociones.filter { $0.hasta >= hoy }.map { ($0.id, $0.descuento) }, uniquingKeysWith: max)
        guard !vigentes.isEmpty else { return productos }
        return productos.map { producto in
            var copia = producto
            copia.descuento = vigentes[producto.id] ?? 0
            return copia
        }
    }
}

/// Respuesta de ve.dolarapi.com
struct RespuestaDolarApi: Decodable {
    let promedio: Double?
    let fechaActualizacion: String

    /// Descarta valores absurdos (0, negativos o fuera de escala)
    var tasa: TasaBcv? {
        guard let promedio, promedio > 1, promedio < 1_000_000 else { return nil }
        return TasaBcv(valor: promedio, fecha: fechaActualizacion)
    }
}

extension TasaBcv {
    /// "2026-10-08T00:00:00Z" -> "08/10" (medianoche UTC es un día de calendario, no se corre al anterior)
    var fechaCorta: String {
        let partes = fecha.prefix(10).split(separator: "-")
        guard partes.count == 3 else { return "" }
        return "\(partes[2])/\(partes[1])"
    }
}
