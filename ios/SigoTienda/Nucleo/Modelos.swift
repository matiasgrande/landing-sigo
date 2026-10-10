import Foundation

/// Tiendas con venta en línea (las mismas del e-commerce actual)
enum Sucursal: String, Codable, CaseIterable, Identifiable, Sendable {
    case costazul, sambil

    var id: String { rawValue }
    var nombre: String { self == .costazul ? "Sigo Supermarket Costazul" : "Sigo Supermarket Sambil" }
    var corto: String { self == .costazul ? "Costazul" : "Sambil" }
    var otra: Sucursal { self == .costazul ? .sambil : .costazul }
}

/// Producto real de sigo.com.ve con precio y existencia por tienda
struct Producto: Identifiable, Hashable, Sendable {
    let id: Int
    let nombre: String
    let precioCostazul: Double
    let precioSambil: Double
    let categoria: String
    let departamento: String
    let grupo: String
    let imagen: URL?
    let enlace: URL?
    let disponibleCostazul: Bool
    let disponibleSambil: Bool
    /// Promoción vigente en % (0 si no hay)
    var descuento: Int = 0
}

enum ModoEntrega: String, Codable, CaseIterable, Identifiable, Sendable {
    case delivery, retiro
    var id: String { rawValue }
    var titulo: String { self == .delivery ? "Delivery" : "Retiro en tienda" }
}

struct Entrega: Codable, Equatable, Sendable {
    var modo: ModoEntrega = .delivery
    /// Municipio de destino (solo delivery)
    var municipio: String? = nil
    var sucursal: Sucursal = .costazul
}

/// Qué hacer si un producto no está al preparar el pedido
enum PreferenciaSustituto: String, Codable, CaseIterable, Identifiable, Sendable {
    case similar, llamar, ninguno
    var id: String { rawValue }
    var texto: String {
        switch self {
        case .similar: "Cámbialo por uno similar"
        case .llamar: "Llámame antes"
        case .ninguno: "No lo sustituyas"
        }
    }
}

/// Línea del carrito con el precio de la tienda que atiende
struct LineaCarrito: Identifiable, Hashable, Sendable {
    let producto: Producto
    let cantidad: Int
    let precio: Double
    let subtotal: Double
    /// Con existencia en la tienda: solo estas se cobran
    let disponible: Bool
    var id: Int { producto.id }
}

/// Pedido confirmado, guardado en el teléfono para "Comprar de nuevo"
struct PedidoGuardado: Codable, Identifiable, Hashable, Sendable {
    struct Linea: Codable, Hashable, Sendable {
        let id: Int
        let cantidad: Int
        let nombre: String
    }

    let numero: String
    let fecha: Date
    let sucursal: Sucursal
    let modo: ModoEntrega
    let lineas: [Linea]
    let total: Double
    /// Nombre de quien recibe, si fue una compra para otra persona
    let paraOtro: String?
    var id: String { numero }
}

struct TarifaMunicipio: Identifiable, Hashable, Sendable {
    let municipio: String
    let tarifaUsd: Double
    let express: Bool
    var id: String { municipio }
}

struct MetodoPago: Identifiable, Hashable, Sendable {
    let id: String
    let nombre: String
    let detalle: String
    let confirmacion: String
    /// Pago en divisas: aplica IGTF
    let igtf: Bool
    /// Cómodo para pagar desde fuera de Venezuela
    let desdeElExterior: Bool
}

struct TasaBcv: Codable, Equatable, Sendable {
    let valor: Double
    let fecha: String
}
