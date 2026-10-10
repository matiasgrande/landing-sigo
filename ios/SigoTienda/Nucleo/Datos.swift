import Foundation

/// Datos fijos compartidos con la web (datos/entregas.ts, datos/contacto.ts y el checkout)
enum Datos {
    static let tarifas: [TarifaMunicipio] = [
        .init(municipio: "Maneiro", tarifaUsd: 2.5, express: true),
        .init(municipio: "Mariño", tarifaUsd: 2.5, express: true),
        .init(municipio: "Arismendi", tarifaUsd: 3.5, express: true),
        .init(municipio: "García", tarifaUsd: 4.5, express: true),
        .init(municipio: "Gómez", tarifaUsd: 15, express: false),
        .init(municipio: "Antolín del Campo", tarifaUsd: 15, express: false),
        .init(municipio: "Díaz", tarifaUsd: 15, express: false),
        .init(municipio: "Marcano", tarifaUsd: 15, express: false),
        .init(municipio: "Tubores", tarifaUsd: 25, express: false),
        .init(municipio: "Península de Macanao", tarifaUsd: 30, express: false),
    ]

    static let metodosPago: [MetodoPago] = [
        .init(id: "pago-movil", nombre: "Pago Móvil", detalle: "En bolívares a la tasa BCV del día", confirmacion: "Confirmación inmediata", igtf: false, desdeElExterior: false),
        .init(id: "debito", nombre: "Tarjeta de débito", detalle: "Punto de venta al recibir o al retirar", confirmacion: "Al momento de la entrega", igtf: false, desdeElExterior: false),
        .init(id: "cashea", nombre: "Cashea", detalle: "Paga en cuotas con tu Línea Cotidiana", confirmacion: "Aprobación en la app de Cashea", igtf: false, desdeElExterior: false),
        .init(id: "zelle", nombre: "Zelle", detalle: "Te enviamos los datos al confirmar", confirmacion: "Verificación hasta 24 h", igtf: true, desdeElExterior: true),
        .init(id: "efectivo", nombre: "Efectivo en divisas", detalle: "Al recibir o al retirar", confirmacion: "Al momento de la entrega", igtf: true, desdeElExterior: false),
        .init(id: "paypal", nombre: "PayPal", detalle: "Se aplican las comisiones de PayPal", confirmacion: "Verificación hasta 24 h", igtf: true, desdeElExterior: true),
        .init(id: "sigo-creditos", nombre: "Sigo Créditos", detalle: "Saldo recargado por tu familia", confirmacion: "Confirmación inmediata", igtf: false, desdeElExterior: true),
    ]

    static let whatsappAtencion = "584125296412"
    static let whatsappPagos = "584128208843"

    /// Valores del prototipo: referenciales, a confirmar con SIGO
    static let minimoCompraUsd = 10.0
    static let tasaIgtfPorcentaje = 3
    static let maximoPorProducto = 99

    static let urlCatalogo = URL(string: "https://matiasgrande.github.io/landing-sigo/catalogo-asistente.json")!
    static let urlTasa = URL(string: "https://ve.dolarapi.com/v1/dolares/oficial")!
    static let urlImagenes = "https://costazul.sigo.com.ve/images/thumbs/"
    static let dominios: [Character: String] = ["c": "https://costazul.sigo.com.ve", "s": "https://sambil.sigo.com.ve"]
}
