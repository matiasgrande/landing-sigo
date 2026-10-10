import Foundation

/// Palabras que no identifican un producto (artículos, unidades, presentaciones)
private let palabrasSinPeso: Set<String> = [
    "de", "del", "la", "el", "los", "las", "lo", "y", "con", "sin", "en", "para", "al", "a", "x", "o",
    "kg", "kgs", "gr", "grs", "g", "gramos", "ml", "lt", "lts", "l", "litro", "litros", "cc", "oz",
    "und", "unds", "un", "unid", "unidad", "unidades", "pza", "pzas", "paq", "paquete", "pack", "cm", "mts", "m",
]

extension String {
    /// Reemplazo con expresión regular (ICU, igual en iOS y Linux)
    func reemplazando(_ patron: String, por reemplazo: String) -> String {
        replacingOccurrences(of: patron, with: reemplazo, options: .regularExpression)
    }

    func coincide(_ patron: String) -> Bool {
        range(of: patron, options: .regularExpression) != nil
    }
}

/// Minúsculas, sin acentos, "P.A.N." -> "pan", solo letras y números
func normalizarParaBuscar(_ texto: String) -> String {
    texto
        .lowercased()
        .folding(options: .diacriticInsensitive, locale: Locale(identifier: "es"))
        .reemplazando(#"([a-z])\.(?=[a-z])"#, por: "$1")
        .reemplazando(#"[^a-z0-9\s]"#, por: " ")
        .reemplazando(#"\b7\s+up\b"#, por: "7up")
        .reemplazando(#"\bcocacola\b"#, por: "coca cola")
}

/// Cantidades y medidas sueltas ("2", "1.5", "500g") que no describen el producto
func esMedida(_ palabra: String) -> Bool {
    palabra.coincide(#"^\d+([.,]\d+)?(kgs?|k|grs?|g|ml|lts?|l|cc|oz|und|unds|x)?$"#)
}

/// Variantes singulares simples: "tomates" -> "tomate", "limones" -> "limon"
func variantes(_ palabra: String) -> [String] {
    var resultado = [palabra]
    if palabra.count > 3, palabra.hasSuffix("es") { resultado.append(String(palabra.dropLast(2))) }
    if palabra.count > 2, palabra.hasSuffix("s") { resultado.append(String(palabra.dropLast())) }
    return resultado
}

/// Palabras significativas de un texto (sin números ni unidades)
func palabrasClave(_ texto: String) -> [String] {
    normalizarParaBuscar(texto)
        .split(whereSeparator: \.isWhitespace)
        .map(String.init)
        .filter { $0.count > 1 && !esMedida($0) && !palabrasSinPeso.contains($0) }
}

/// "VÍVERES" -> "Víveres"; respeta nombres ya capitalizados
func nombreLegible(_ texto: String) -> String {
    guard texto == texto.uppercased() else { return texto }
    let menores: Set<String> = ["y", "de", "del", "la", "el", "en"]
    return texto.lowercased().split(separator: " ").enumerated().map { indice, palabra in
        indice > 0 && menores.contains(String(palabra)) ? String(palabra) : palabra.prefix(1).uppercased() + palabra.dropFirst()
    }.joined(separator: " ")
}
