import Foundation

/// Valor de una fila del catálogo compacto (números, textos o null)
enum ValorJSON: Decodable, Sendable {
    case numero(Double)
    case texto(String)
    case nulo

    init(from decoder: Decoder) throws {
        let contenedor = try decoder.singleValueContainer()
        if contenedor.decodeNil() {
            self = .nulo
        } else if let numero = try? contenedor.decode(Double.self) {
            self = .numero(numero)
        } else {
            self = .texto(try contenedor.decode(String.self))
        }
    }

    var numero: Double? { if case let .numero(valor) = self { valor } else { nil } }
    var texto: String? { if case let .texto(valor) = self { valor } else { nil } }
}

/// Formato v2 generado por scripts/preparar-catalogo-asistente.mjs (el mismo que usa la web)
struct CatalogoCompacto: Decodable, Sendable {
    let extraidoEn: String
    let departamentos: [String]
    let categorias: [[ValorJSON]]
    let productos: [[ValorJSON]]
}

enum ErrorCatalogo: Error {
    case formatoInvalido
}

enum Catalogo {
    /// Decodifica y adapta el catálogo compacto. Lanza si el archivo no tiene el formato esperado.
    static func leer(_ datos: Data) throws -> (productos: [Producto], extraidoEn: String) {
        let compacto = try JSONDecoder().decode(CatalogoCompacto.self, from: datos)
        guard !compacto.productos.isEmpty else { throw ErrorCatalogo.formatoInvalido }

        let productos: [Producto] = compacto.productos.compactMap { fila in
            guard fila.count >= 7,
                  let id = fila[0].numero, let nombre = fila[1].texto,
                  let precio = fila[2].numero, let indiceCategoria = fila[3].numero,
                  let bits = fila[5].numero
            else { return nil }
            let categoria = compacto.categorias.indices.contains(Int(indiceCategoria)) ? compacto.categorias[Int(indiceCategoria)] : []
            let nombreCategoria = categoria.first?.texto ?? ""
            let indiceDepartamento = categoria.count > 1 ? Int(categoria[1].numero ?? -1) : -1
            let departamento = compacto.departamentos.indices.contains(indiceDepartamento) ? compacto.departamentos[indiceDepartamento] : "Otros"
            let grupo = categoria.count > 2 ? (categoria[2].texto ?? "") : ""
            let precioSambil = fila.count > 8 ? (fila[8].numero ?? 0) : 0
            let imagen = fila[4].texto.flatMap { URL(string: Datos.urlImagenes + $0) }
            let enlace = fila[6].texto.flatMap { texto -> URL? in
                guard let inicial = texto.first, let dominio = Datos.dominios[inicial] else { return nil }
                return URL(string: dominio + texto.dropFirst())
            }
            let disponibilidad = Int(bits)
            return Producto(
                id: Int(id),
                nombre: nombre,
                precioCostazul: precio,
                precioSambil: precioSambil > 0 ? precioSambil : precio,
                categoria: nombreCategoria,
                departamento: departamento,
                grupo: grupo,
                imagen: imagen,
                enlace: enlace,
                disponibleCostazul: disponibilidad & 1 == 1,
                disponibleSambil: disponibilidad & 2 == 2
            )
        }
        guard !productos.isEmpty else { throw ErrorCatalogo.formatoInvalido }
        return (productos, compacto.extraidoEn)
    }
}
