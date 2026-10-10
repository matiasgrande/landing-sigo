import Foundation

struct IngredienteResuelto: Identifiable, Sendable {
    let ingrediente: Ingrediente
    /// Cantidad escalada a las porciones pedidas
    let cantidad: Double
    let producto: Producto?
    /// Unidades del producto que se agregan al carrito
    let unidades: Int
    var id: String { ingrediente.nombre }

    var textoCantidad: String {
        let numero = cantidad.rounded() == cantidad ? String(Int(cantidad)) : String(format: "%.2f", cantidad)
            .replacingOccurrences(of: #"0+$"#, with: "", options: .regularExpression)
            .replacingOccurrences(of: ".", with: ",")
        switch ingrediente.unidad {
        case .und: return numero
        case .g: return "\(numero) g"
        case .kg: return "\(numero) kg"
        case .l: return "\(numero) L"
        }
    }
}

enum ResolutorRecetas {
    /// Escala: unidades hacia arriba; kg y L en cuartos; gramos de 50 en 50
    static func escalar(_ ingrediente: Ingrediente, factor: Double) -> Double {
        let valor = ingrediente.cantidad * factor
        switch ingrediente.unidad {
        case .und: return max(1, (valor - 0.001).rounded(.up))
        case .g: return max(50, (valor / 50).rounded() * 50)
        case .kg, .l: return max(0.25, (valor * 4).rounded() / 4)
        }
    }

    /// Unidades del producto para cubrir la cantidad pedida (peso a paquetes, litros a envases, huevos a cartones)
    static func unidades(para ingrediente: Ingrediente, cantidad: Double, producto: Producto) -> Int {
        let resultado: Double
        switch ingrediente.unidad {
        case .g, .kg:
            let gramos = ingrediente.unidad == .kg ? cantidad * 1000 : cantidad
            resultado = Medidas.gramosDelPaquete(producto.nombre).map { (gramos / $0).rounded() } ?? 1
        case .l:
            resultado = Medidas.litrosDelEnvase(producto.nombre).map { (cantidad / $0).rounded() } ?? cantidad.rounded(.up)
        case .und:
            if let pack = Medidas.unidadesDelPack(producto.nombre), ingrediente.consulta.coincide("huevo|cerveza|malta|yogur|chorizo") {
                resultado = (cantidad / Double(pack)).rounded(.up)
            } else {
                resultado = cantidad
            }
        }
        return min(Datos.maximoPorProducto, max(1, Int(resultado)))
    }

    static func resolver(_ receta: Receta, porciones: Int, indice: IndiceCatalogo, disponible: (Producto) -> Bool) -> [IngredienteResuelto] {
        let factor = Double(porciones) / Double(receta.porciones)
        return receta.ingredientes.map { ingrediente in
            let cantidad = escalar(ingrediente, factor: factor)
            guard ingrediente.enLinea else { return IngredienteResuelto(ingrediente: ingrediente, cantidad: cantidad, producto: nil, unidades: 0) }
            var opciones = indice.mejorCoincidencia(palabrasClave(ingrediente.consulta), disponible: disponible).filter(disponible)
            // Para líquidos se prefiere el envase que divide exacto lo pedido ("Refresco 2 L" para 4 L)
            if ingrediente.unidad == .l {
                let exactos = opciones.filter { producto in
                    guard let litros = Medidas.litrosDelEnvase(producto.nombre), litros > 0 else { return false }
                    let envases = cantidad / litros
                    return litros >= 1 && abs(envases - envases.rounded()) < 0.01
                }
                if let mayor = exactos.max(by: { (Medidas.litrosDelEnvase($0.nombre) ?? 0) < (Medidas.litrosDelEnvase($1.nombre) ?? 0) }) {
                    opciones = [mayor]
                }
            }
            guard let producto = opciones.first else {
                return IngredienteResuelto(ingrediente: ingrediente, cantidad: cantidad, producto: nil, unidades: 0)
            }
            return IngredienteResuelto(ingrediente: ingrediente, cantidad: cantidad, producto: producto,
                                       unidades: unidades(para: ingrediente, cantidad: cantidad, producto: producto))
        }
    }
}
