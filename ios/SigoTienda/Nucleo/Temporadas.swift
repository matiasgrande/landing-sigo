import Foundation

// Calendario venezolano (y margariteño): el mismo de la web (datos/temporadas.ts)

enum UnidadIngrediente: Sendable { case kg, g, und, l }

struct Ingrediente: Hashable, Sendable {
    let nombre: String
    let cantidad: Double
    let unidad: UnidadIngrediente
    /// Cómo se busca en el catálogo
    let consulta: String
    /// false: no se vende en línea (fresco de carnicería o pescadería)
    var enLinea = true
}

struct Receta: Identifiable, Hashable, Sendable {
    let id: String
    let titulo: String
    let descripcion: String
    let porciones: Int
    let unidadPorciones: String
    let ingredientes: [Ingrediente]
}

struct Temporada: Identifiable, Sendable {
    let id: String
    let nombre: String
    let mensaje: String
    let recetas: [String]
    /// Inicio y fin (AAAA-MM-DD) en un año dado
    let ventana: @Sendable (Int) -> (inicio: String, fin: String)
}

struct TemporadaEnFecha: Identifiable, Sendable {
    let temporada: Temporada
    let inicio: String
    let fin: String
    /// Días que faltan para que empiece (0 si ya está activa)
    let faltan: Int
    var id: String { "\(temporada.id)-\(inicio)" }
}

private func i(_ nombre: String, _ cantidad: Double, _ unidad: UnidadIngrediente, _ consulta: String, enLinea: Bool = true) -> Ingrediente {
    Ingrediente(nombre: nombre, cantidad: cantidad, unidad: unidad, consulta: consulta, enLinea: enLinea)
}

enum Calendario {
    static let recetas: [Receta] = [
        Receta(id: "arepas", titulo: "Arepas rellenas", descripcion: "El desayuno de siempre: reina pepiada, jamón y queso.", porciones: 6, unidadPorciones: "personas", ingredientes: [
            i("Harina de maíz P.A.N.", 2, .und, "harina pan"), i("Queso blanco", 500, .g, "queso blanco"), i("Jamón", 500, .g, "jamon"),
            i("Mantequilla", 1, .und, "mantequilla"), i("Aguacate", 1, .und, "aguacate"),
        ]),
        Receta(id: "pabellon", titulo: "Pabellón criollo", descripcion: "Caraotas, arroz, tajadas y queso rallado.", porciones: 4, unidadPorciones: "personas", ingredientes: [
            i("Carne para mechar", 1, .kg, "carne para mechar", enLinea: false), i("Caraotas negras", 2, .und, "caraota negra"), i("Arroz", 1, .kg, "arroz"),
            i("Plátano", 2, .kg, "platano"), i("Queso blanco", 500, .g, "queso blanco"), i("Cebolla", 500, .g, "cebolla blanca"), i("Pimentón", 500, .g, "pimenton"),
        ]),
        Receta(id: "desayuno", titulo: "Desayuno criollo", descripcion: "Arepas, perico, caraotas, queso y natilla.", porciones: 4, unidadPorciones: "personas", ingredientes: [
            i("Harina de maíz P.A.N.", 1, .und, "harina pan"), i("Huevos", 12, .und, "huevos"), i("Caraotas negras", 1, .und, "caraota negra"),
            i("Queso blanco", 500, .g, "queso blanco"), i("Natilla", 1, .und, "natilla"), i("Café", 1, .und, "cafe"),
        ]),
        Receta(id: "sancocho", titulo: "Sancocho de pollo", descripcion: "Para compartir en familia el domingo o en las fiestas del Valle.", porciones: 8, unidadPorciones: "personas", ingredientes: [
            i("Muslos de pollo", 2, .kg, "muslo pollo"), i("Auyama", 1, .kg, "auyama"), i("Ocumo", 1, .kg, "ocumo"), i("Jojotos", 4, .und, "jojoto"),
            i("Papa", 1, .kg, "papa amarilla"), i("Zanahoria", 500, .g, "zanahoria"), i("Cilantro", 1, .und, "cilantro"), i("Yuca fresca", 1, .kg, "yuca", enLinea: false),
        ]),
        Receta(id: "pasticho", titulo: "Pasticho", descripcion: "El almuerzo del domingo, con bechamel y bastante queso.", porciones: 8, unidadPorciones: "personas", ingredientes: [
            i("Pasta para lasaña", 2, .und, "lasana"), i("Carne molida", 1.2, .kg, "carne molida"), i("Salsa de tomate", 2, .und, "passata tomate"),
            i("Bechamel", 1, .und, "bechamel"), i("Queso amarillo", 500, .g, "queso amarillo"), i("Cebolla", 500, .g, "cebolla blanca"),
        ]),
        Receta(id: "parrillada", titulo: "Parrillada", descripcion: "Chorizos, pollo, guasacaca y bien fría la bebida.", porciones: 10, unidadPorciones: "invitados", ingredientes: [
            i("Carne para asar", 3, .kg, "carne para asar", enLinea: false), i("Chorizos", 20, .und, "chorizo cocido"), i("Muslos de pollo", 3, .kg, "muslo pollo"),
            i("Carbón", 2, .und, "carbon"), i("Cervezas", 24, .und, "cerveza lata"), i("Refrescos de 2 L", 6, .l, "refresco"), i("Aguacate (guasacaca)", 2, .und, "aguacate"),
            i("Cilantro", 1, .und, "cilantro"),
        ]),
        Receta(id: "hallacas", titulo: "Hallacas", descripcion: "La receta de diciembre para hacer en familia.", porciones: 25, unidadPorciones: "hallacas", ingredientes: [
            i("Harina de maíz P.A.N.", 3, .und, "harina pan"), i("Hojas de hallaca", 1, .und, "hoja hallaca"), i("Onoto", 1, .und, "onoto"),
            i("Pollo", 1, .kg, "antemuslo pollo"), i("Tocino de cerdo", 600, .g, "tocino cerdo"), i("Carne de res", 1, .kg, "carne de res", enLinea: false),
            i("Aceitunas", 1, .und, "aceituna"), i("Papelón", 1, .und, "papelon"), i("Cebolla", 1, .kg, "cebolla blanca"), i("Pimentón", 1, .kg, "pimenton"),
            i("Ajo porro", 500, .g, "ajo porro"),
        ]),
        Receta(id: "ensalada-gallina", titulo: "Ensalada de gallina", descripcion: "La compañera de la hallaca y el pan de jamón.", porciones: 10, unidadPorciones: "personas", ingredientes: [
            i("Papa", 2, .kg, "papa amarilla"), i("Zanahoria", 1, .kg, "zanahoria"), i("Pollo", 1, .kg, "antemuslo pollo"), i("Mayonesa", 1, .und, "mayonesa"),
            i("Pan de jamón Sigo", 1, .und, "pan jamon"),
        ]),
        Receta(id: "empanadas", titulo: "Empanadas margariteñas", descripcion: "Las de la playa: de cazón, queso o carne molida.", porciones: 20, unidadPorciones: "empanadas", ingredientes: [
            i("Harina de maíz P.A.N.", 2, .und, "harina pan"), i("Cazón", 1, .kg, "cazon", enLinea: false), i("Queso blanco", 500, .g, "queso blanco"),
            i("Carne molida", 400, .g, "carne molida"), i("Aceite", 1, .und, "aceite soya"), i("Ají dulce y cebollín", 1, .und, "aji dulce", enLinea: false),
        ]),
        Receta(id: "torta", titulo: "Torta casera", descripcion: "Para celebrar a mamá (o a quien sea).", porciones: 12, unidadPorciones: "porciones", ingredientes: [
            i("Harina de trigo leudante", 1, .und, "harina trigo leudante"), i("Azúcar", 1, .und, "azucar"), i("Huevos", 6, .und, "huevos"),
            i("Mantequilla", 1, .und, "mantequilla"), i("Leche", 1, .l, "leche"),
        ]),
        Receta(id: "lonchera", titulo: "Lonchera de la semana", descripcion: "Sándwich, jugo y merienda para cinco días de clases.", porciones: 1, unidadPorciones: "niños", ingredientes: [
            i("Pan de sándwich", 1, .und, "pan sandwich"), i("Jamón", 250, .g, "jamon"), i("Queso amarillo", 250, .g, "queso amarillo"),
            i("Jugos pequeños", 5, .und, "jugo"), i("Galletas", 1, .und, "galleta"),
        ]),
        Receta(id: "playa", titulo: "Kit de playa", descripcion: "Para El Agua, Playa Parguito o Juan Griego: todo frío y a la cava.", porciones: 6, unidadPorciones: "personas", ingredientes: [
            i("Agua de 5 L", 10, .l, "agua"), i("Cervezas", 24, .und, "cerveza lata"), i("Refrescos de 2 L", 4, .l, "refresco"), i("Tequeños", 1, .und, "tequeno"),
            i("Papitas", 3, .und, "papas fritas"), i("Protector solar", 1, .und, "protector solar"), i("Hielo", 2, .und, "hielo", enLinea: false),
        ]),
    ]

    static let recetasDeSiempre = ["arepas", "pabellon", "desayuno", "sancocho", "pasticho", "parrillada"]

    static func receta(_ id: String) -> Receta? { recetas.first { $0.id == id } }

    /// Domingo de Pascua (algoritmo de Meeus/Jones/Butcher)
    static func domingoDePascua(_ anio: Int) -> String {
        let a = anio % 19, b = anio / 100, c = anio % 100, d = b / 4, e = b % 4
        let f = (b + 8) / 25, g = (b - f + 1) / 3, h = (19 * a + b - d - g + 15) % 30
        let i = c / 4, k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = (a + 11 * h + 22 * l) / 451
        let mes = (h + l - 7 * m + 114) / 31, dia = (h + l - 7 * m + 114) % 31 + 1
        return String(format: "%04d-%02d-%02d", anio, mes, dia)
    }

    private static let utc: Calendar = {
        var calendario = Calendar(identifier: .gregorian)
        calendario.timeZone = TimeZone(identifier: "UTC") ?? .current
        return calendario
    }()

    static func fecha(_ texto: String) -> Date {
        let partes = texto.split(separator: "-").compactMap { Int($0) }
        return utc.date(from: DateComponents(year: partes[0], month: partes[1], day: partes[2])) ?? Date()
    }

    static func texto(_ fecha: Date) -> String {
        let c = utc.dateComponents([.year, .month, .day], from: fecha)
        return String(format: "%04d-%02d-%02d", c.year ?? 2026, c.month ?? 1, c.day ?? 1)
    }

    static func sumarDias(_ texto: String, _ dias: Int) -> String {
        Self.texto(utc.date(byAdding: .day, value: dias, to: fecha(texto)) ?? fecha(texto))
    }

    /// N-ésimo domingo de un mes
    static func enesimoDomingo(_ anio: Int, _ mes: Int, _ n: Int) -> String {
        let primero = fecha(String(format: "%04d-%02d-01", anio, mes))
        let diaSemana = utc.component(.weekday, from: primero) // 1 = domingo
        let desplazamiento = (8 - diaSemana) % 7
        return sumarDias(texto(primero), desplazamiento + (n - 1) * 7)
    }

    static let temporadas: [Temporada] = [
        Temporada(id: "navidad", nombre: "Navidad y fin de año", mensaje: "Hallacas, ensalada de gallina y pan de jamón: todo para la mesa de diciembre.",
                  recetas: ["hallacas", "ensalada-gallina", "pasticho"]) { ("\($0)-11-15", "\($0)-12-31") },
        Temporada(id: "reyes", nombre: "Año nuevo y Reyes", mensaje: "Lo que quedó de diciembre y la parrilla del primero de año.",
                  recetas: ["parrillada", "ensalada-gallina"]) { ("\($0)-01-01", "\($0)-01-06") },
        Temporada(id: "carnaval", nombre: "Carnaval", mensaje: "Cuatro días de playa en la isla: arma tu cava sin bajarte del carro.",
                  recetas: ["playa", "parrillada", "empanadas"]) { anio in
            let pascua = domingoDePascua(anio)
            return (sumarDias(pascua, -60), sumarDias(pascua, -46))
        },
        Temporada(id: "semana-santa", nombre: "Semana Santa", mensaje: "Margarita se llena: empanadas, playa y la mesa del Jueves y Viernes Santo.",
                  recetas: ["empanadas", "playa", "arepas"]) { anio in
            let pascua = domingoDePascua(anio)
            return (sumarDias(pascua, -12), sumarDias(pascua, 1))
        },
        Temporada(id: "madres", nombre: "Día de las Madres", mensaje: "Desayuno en la cama y torta casera para mamá.",
                  recetas: ["desayuno", "torta", "pasticho"]) { anio in
            let dia = enesimoDomingo(anio, 5, 2)
            return (sumarDias(dia, -10), dia)
        },
        Temporada(id: "padres", nombre: "Día del Padre", mensaje: "Parrilla para papá, con la cerveza bien fría.",
                  recetas: ["parrillada", "pabellon"]) { anio in
            let dia = enesimoDomingo(anio, 6, 3)
            return (sumarDias(dia, -10), dia)
        },
        Temporada(id: "vacaciones", nombre: "Vacaciones en la isla", mensaje: "¿Llegas a Margarita? Programa tu mercado y que te espere en la posada.",
                  recetas: ["playa", "desayuno", "arepas"]) { ("\($0)-07-15", "\($0)-08-31") },
        Temporada(id: "virgen-del-valle", nombre: "Fiestas de la Virgen del Valle", mensaje: "La patrona de Oriente se celebra el 8 de septiembre: sancocho para compartir.",
                  recetas: ["sancocho", "empanadas"]) { ("\($0)-09-01", "\($0)-09-08") },
        Temporada(id: "clases", nombre: "Regreso a clases", mensaje: "Loncheras listas para toda la semana.",
                  recetas: ["lonchera", "desayuno"]) { ("\($0)-09-01", "\($0)-09-30") },
    ]

    /// Temporadas activas en una fecha (AAAA-MM-DD) y la próxima que viene
    static func temporadas(en hoy: String) -> (activas: [TemporadaEnFecha], proxima: TemporadaEnFecha?) {
        let anio = Int(hoy.prefix(4)) ?? 2026
        let candidatas = temporadas.flatMap { temporada in
            [anio, anio + 1].map { a -> TemporadaEnFecha in
                let (inicio, fin) = temporada.ventana(a)
                let dias = utc.dateComponents([.day], from: fecha(hoy), to: fecha(inicio)).day ?? 0
                return TemporadaEnFecha(temporada: temporada, inicio: inicio, fin: fin, faltan: max(0, dias))
            }
        }
        let activas = candidatas.filter { $0.inicio <= hoy && hoy <= $0.fin }
        let proxima = candidatas.filter { $0.inicio > hoy }.min { $0.inicio < $1.inicio }
        return (activas, proxima)
    }
}
