import Foundation

private func conVariantes(_ palabras: [String]) -> Set<String> {
    Set(palabras.flatMap(variantes))
}

/// Índice de búsqueda: el mismo esquema de la web (sustantivo principal, nombre y categoría)
struct IndiceCatalogo: Sendable {
    struct Entrada: Sendable {
        let posicion: Int
        let principal: Set<String>
        let nombre: Set<String>
        let categoria: Set<String>
        let totalPalabras: Int
    }

    let productos: [Producto]
    let entradas: [Entrada]
    /// Palabras del catálogo (más de 2 letras) para corregir errores de tipeo
    let vocabulario: [String]
    let conjunto: Set<String>
    /// Forma normalizada -> como se escribe en el catálogo ("panales" -> "pañales")
    let visibles: [String: String]

    init(productos: [Producto]) {
        self.productos = productos
        var conjunto = Set<String>()
        var visibles: [String: String] = [:]
        entradas = productos.enumerated().map { posicion, producto in
            let claves = palabrasClave(producto.nombre)
            let entrada = Entrada(
                posicion: posicion,
                principal: conVariantes(Array(claves.prefix(1))),
                nombre: conVariantes(claves),
                categoria: conVariantes(palabrasClave(producto.categoria)),
                totalPalabras: max(1, claves.count)
            )
            conjunto.formUnion(entrada.nombre)
            conjunto.formUnion(entrada.categoria)
            for original in producto.nombre.lowercased().split(whereSeparator: { !$0.isLetter && !$0.isNumber }) {
                let normalizada = normalizarParaBuscar(String(original)).trimmingCharacters(in: .whitespaces)
                if !normalizada.isEmpty, visibles[normalizada] == nil { visibles[normalizada] = String(original) }
            }
            return entrada
        }
        self.conjunto = conjunto
        self.visibles = visibles
        vocabulario = conjunto.filter { $0.count > 2 }.sorted()
    }
}

/// Distancia de edición con corte temprano (devuelve máximo + 1 si se pasa)
func distancia(_ a: String, _ b: String, maximo: Int) -> Int {
    let x = Array(a), y = Array(b)
    if abs(x.count - y.count) > maximo { return maximo + 1 }
    if x.isEmpty { return y.count }
    if y.isEmpty { return x.count }
    var anterior = Array(0...y.count)
    for i in 1...x.count {
        var actual = [i]
        var minimoFila = i
        for j in 1...y.count {
            let costo = x[i - 1] == y[j - 1] ? 0 : 1
            let valor = min(anterior[j] + 1, actual[j - 1] + 1, anterior[j - 1] + costo)
            actual.append(valor)
            minimoFila = min(minimoFila, valor)
        }
        if minimoFila > maximo { return maximo + 1 }
        anterior = actual
    }
    return anterior[y.count]
}

struct ResultadoBusqueda: Sendable {
    let productos: [Producto]
    /// Palabras corregidas cuando hubo errores de tipeo ("hrina" -> "harina")
    let correccion: String?
}

extension IndiceCatalogo {
    /// Palabra del usuario -> palabras del catálogo: exacta, prefijo (si se está escribiendo) o la más parecida
    func resolver(_ palabra: String, esPrefijo: Bool) -> [String] {
        let exactas = variantes(palabra).filter { conjunto.contains($0) }
        if !exactas.isEmpty { return exactas }
        if esPrefijo, palabra.count >= 2 {
            let prefijos = vocabulario.filter { $0.hasPrefix(palabra) }.prefix(8)
            if !prefijos.isEmpty { return Array(prefijos) }
        }
        guard palabra.count >= 4 else { return [] }
        let tolerancia = palabra.count >= 7 ? 2 : 1
        var mejores: [String] = []
        var mejorDistancia = tolerancia + 1
        for candidata in vocabulario {
            let d = distancia(palabra, candidata, maximo: tolerancia)
            if d < mejorDistancia {
                mejorDistancia = d
                mejores = [candidata]
            } else if d == mejorDistancia, d <= tolerancia {
                mejores.append(candidata)
            }
        }
        return Array(mejores.prefix(4))
    }

    /// Búsqueda de la tienda: todas las palabras deben coincidir; si no hay resultados, cualquiera
    func buscar(_ texto: String, esPrefijo: Bool = true, disponible: (Producto) -> Bool) -> ResultadoBusqueda {
        let palabras = palabrasClave(texto)
        guard !palabras.isEmpty else { return ResultadoBusqueda(productos: [], correccion: nil) }
        let resueltas = palabras.enumerated().map { indice, palabra in
            resolver(palabra, esPrefijo: esPrefijo && indice == palabras.count - 1)
        }
        let corregidas = zip(palabras, resueltas).map { palabra, opciones -> String in
            guard let primera = opciones.first,
                  !variantes(palabra).contains(where: opciones.contains),
                  !opciones.contains(where: { $0.hasPrefix(palabra) })
            else { return palabra }
            return primera
        }
        let correccion = corregidas == palabras ? nil : corregidas.map { visibles[$0] ?? $0 }.joined(separator: " ")

        func puntuar(exigirTodas: Bool) -> [(Producto, Double)] {
            entradas.compactMap { entrada in
                var puntaje = 0.0
                var coincidencias = 0
                for opciones in resueltas {
                    if opciones.contains(where: entrada.principal.contains) {
                        puntaje += 3; coincidencias += 1
                    } else if opciones.contains(where: entrada.nombre.contains) {
                        puntaje += 2; coincidencias += 1
                    } else if opciones.contains(where: entrada.categoria.contains) {
                        puntaje += 1; coincidencias += 1
                    }
                }
                if coincidencias == 0 || (exigirTodas && coincidencias < resueltas.count) { return nil }
                return (productos[entrada.posicion], puntaje - Double(entrada.totalPalabras) * 0.05)
            }
        }

        var resultados = puntuar(exigirTodas: true)
        if resultados.isEmpty { resultados = puntuar(exigirTodas: false) }
        resultados.sort { a, b in
            if a.1 != b.1 { return a.1 > b.1 }
            let da = disponible(a.0), db = disponible(b.0)
            if da != db { return da }
            return a.0.precioCostazul < b.0.precioCostazul
        }
        return ResultadoBusqueda(productos: resultados.map(\.0), correccion: correccion)
    }

    /// El producto que mejor representa una descripción ("queso blanco", "harina pan"), para recetas.
    /// Puntaje: sustantivo principal 3 (+1 si es la primera palabra, +0,5 si también nombra su categoría),
    /// nombre 2, categoría 1. Desempate: disponible, más específico y más económico.
    func mejorCoincidencia(_ palabras: [String], disponible: (Producto) -> Bool) -> [Producto] {
        guard !palabras.isEmpty else { return [] }
        let variantesPorPalabra = palabras.map(variantes)
        struct Candidato { let entrada: Entrada; let puntaje: Double; let enNombre: Int; let conPrincipal: Bool }
        var candidatos: [Candidato] = []
        for entrada in entradas {
            var puntaje = 0.0, enNombre = 0, conPrincipal = false
            for (posicion, opciones) in variantesPorPalabra.enumerated() {
                if opciones.contains(where: entrada.principal.contains) {
                    puntaje += (posicion == 0 ? 4 : 3) + (opciones.contains(where: entrada.categoria.contains) ? 0.5 : 0)
                    enNombre += 1; conPrincipal = true
                } else if opciones.contains(where: entrada.nombre.contains) {
                    puntaje += 2; enNombre += 1
                    if opciones.contains(where: entrada.categoria.contains) { conPrincipal = true }
                } else if opciones.contains(where: entrada.categoria.contains) {
                    puntaje += 1
                }
            }
            if puntaje > 0 { candidatos.append(Candidato(entrada: entrada, puntaje: puntaje, enNombre: enNombre, conPrincipal: conPrincipal)) }
        }
        candidatos.sort { a, b in
            if a.conPrincipal != b.conPrincipal { return a.conPrincipal }
            if a.puntaje != b.puntaje { return a.puntaje > b.puntaje }
            let da = disponible(productos[a.entrada.posicion]), db = disponible(productos[b.entrada.posicion])
            if da != db { return da }
            let ea = Double(a.enNombre) / Double(a.entrada.totalPalabras), eb = Double(b.enNombre) / Double(b.entrada.totalPalabras)
            if ea != eb { return ea > eb }
            return productos[a.entrada.posicion].precioCostazul < productos[b.entrada.posicion].precioCostazul
        }
        guard let mejor = candidatos.first, mejor.conPrincipal || mejor.enNombre == palabras.count else { return [] }
        return candidatos.prefix(12).filter { $0.puntaje == mejor.puntaje }.map { productos[$0.entrada.posicion] }
    }
}
