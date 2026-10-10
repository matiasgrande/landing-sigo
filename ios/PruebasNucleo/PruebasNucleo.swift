import XCTest
@testable import SigoNucleo

final class PruebasNucleo: XCTestCase {
    /// El mismo catálogo que se empaqueta en la app
    static let indice: IndiceCatalogo = {
        let ruta = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("SigoTienda/Recursos/catalogo-asistente.json")
        let datos = try! Data(contentsOf: ruta)
        return IndiceCatalogo(productos: try! Catalogo.leer(datos).productos)
    }()

    var indice: IndiceCatalogo { Self.indice }
    let enCostazul: (Producto) -> Bool = { $0.disponible(en: .costazul) }

    func testCatalogoCompleto() {
        XCTAssertEqual(indice.productos.count, 5273)
        XCTAssertTrue(indice.productos.contains { $0.precioSambil != $0.precioCostazul })
        XCTAssertTrue(indice.productos.allSatisfy { $0.precioCostazul > 0 })
        let conEnlace = indice.productos.first { $0.enlace != nil }
        XCTAssertTrue(conEnlace?.enlace?.absoluteString.hasPrefix("https://") ?? false)
    }

    func testNormalizacion() {
        XCTAssertEqual(palabrasClave("Harina P.A.N. Ñame"), ["harina", "pan", "name"])
        XCTAssertEqual(palabrasClave("Arroz Mary 1 Kg."), ["arroz", "mary"])
        XCTAssertEqual(palabrasClave("7 Up 2L"), ["7up"])
        XCTAssertEqual(nombreLegible("FRUTAS Y VEGETALES"), "Frutas y Vegetales")
    }

    func testBusquedaTolerante() {
        let correcta = indice.buscar("harina", disponible: enCostazul)
        let conError = indice.buscar("hrina", disponible: enCostazul)
        XCTAssertFalse(correcta.productos.isEmpty)
        XCTAssertEqual(conError.correccion, "harina")
        XCTAssertEqual(correcta.productos.first?.id, conError.productos.first?.id)
        XCTAssertFalse(indice.buscar("caf", disponible: enCostazul).productos.isEmpty, "prefijo mientras se escribe")
        XCTAssertTrue(indice.buscar("7up", disponible: enCostazul).productos.first?.nombre.contains("7UP") ?? false)
        XCTAssertEqual(distancia("arros", "arroz", maximo: 1), 1)
        XCTAssertEqual(distancia("", "abc", maximo: 5), 3)
    }

    func testIgtfAlCentimo() {
        let producto = Producto(id: 1, nombre: "Prueba", precioCostazul: 18.5, precioSambil: 18.5, categoria: "", departamento: "", grupo: "",
                                imagen: nil, enlace: nil, disponibleCostazul: true, disponibleSambil: false)
        let lineas = Comercio.lineas(cantidades: [1: 1], productos: [1: producto], sucursal: .costazul)
        let totales = Totales(lineas: lineas, entrega: Entrega(modo: .retiro), conIgtf: true)
        XCTAssertEqual(totales.igtf, 0.56)
        XCTAssertEqual(totales.total, 19.06)
        XCTAssertEqual(totales.faltante, 0)
        // Sin existencia en Sambil: no se cobra
        let enSambil = Comercio.lineas(cantidades: [1: 1], productos: [1: producto], sucursal: .sambil)
        XCTAssertEqual(Totales(lineas: enSambil, entrega: Entrega(modo: .retiro), conIgtf: false).subtotal, 0)
        XCTAssertNil(Totales(lineas: lineas, entrega: Entrega(modo: .delivery, municipio: "Narnia"), conIgtf: false).envio)
    }

    func testPromocion() {
        var producto = indice.productos[0]
        producto.descuento = 10
        XCTAssertEqual(producto.precio(en: .costazul), (producto.precioCostazul * 90).rounded() / 100, accuracy: 0.011)
        XCTAssertGreaterThan(producto.ahorro(en: .costazul), 0)
        XCTAssertEqual(Promociones.deEjemplo(indice).count, 8)
    }

    func testTelefonos() {
        XCTAssertTrue(Comercio.esTelefonoVenezolano("0412 1234567"))
        XCTAssertTrue(Comercio.esTelefonoVenezolano("+58 (412) 123-4567"))
        XCTAssertFalse(Comercio.esTelefonoVenezolano("-----------"))
        XCTAssertFalse(Comercio.esTelefonoVenezolano("04444444444"))
        XCTAssertFalse(Comercio.esTelefonoVenezolano("1 2 3 4 5 6"))
        XCTAssertTrue(Comercio.esTelefonoInternacional("+1 305 555 0123"))
        XCTAssertEqual(Comercio.numeroWhatsApp("0414 765 4321"), "584147654321")
    }

    func testFormato() {
        XCTAssertEqual(Formato.usd(1234.5), "$1,234.50")
        XCTAssertEqual(Formato.bs(10, tasa: 875.65), "Bs. 8.756,50")
        XCTAssertEqual(Formato.plural(1, "artículo"), "1 artículo")
        XCTAssertEqual(TasaBcv(valor: 36.5, fecha: "2026-10-08T00:00:00Z").fechaCorta, "08/10")
    }

    func testCalendario() {
        XCTAssertEqual(Calendario.domingoDePascua(2026), "2026-04-05")
        XCTAssertEqual(Calendario.domingoDePascua(2027), "2027-03-28")
        XCTAssertEqual(Calendario.enesimoDomingo(2026, 5, 2), "2026-05-10")
        let octubre = Calendario.temporadas(en: "2026-10-10")
        XCTAssertTrue(octubre.activas.isEmpty)
        XCTAssertEqual(octubre.proxima?.temporada.id, "navidad")
        XCTAssertEqual(octubre.proxima?.faltan, 36)
        XCTAssertEqual(Set(Calendario.temporadas(en: "2026-09-05").activas.map(\.temporada.id)), ["virgen-del-valle", "clases"])
        for temporada in Calendario.temporadas {
            XCTAssertTrue(temporada.recetas.allSatisfy { Calendario.receta($0) != nil }, temporada.id)
        }
    }

    func testRecetasConProductosReales() {
        for receta in Calendario.recetas {
            let resueltos = ResolutorRecetas.resolver(receta, porciones: receta.porciones, indice: indice, disponible: enCostazul)
            let encontrados = resueltos.filter { $0.producto != nil }
            print("##", receta.titulo)
            for r in resueltos { print("   ", r.ingrediente.nombre, "->", r.producto.map { "\(r.unidades) × \($0.nombre)" } ?? "—") }
            XCTAssertGreaterThanOrEqual(encontrados.count, receta.ingredientes.filter(\.enLinea).count - 2, receta.titulo)
            XCTAssertTrue(resueltos.allSatisfy { $0.unidades <= 30 }, "\(receta.titulo): cantidades razonables")
        }
        // Escalar al doble duplica los paquetes por peso
        let pasticho = Calendario.receta("pasticho")!
        let doble = ResolutorRecetas.resolver(pasticho, porciones: 16, indice: indice, disponible: enCostazul)
        XCTAssertEqual(doble.first { $0.ingrediente.nombre == "Carne molida" }?.unidades, 6)
    }

    func testComparador() {
        let distintos = indice.productos.filter { $0.disponibleCostazul && $0.disponibleSambil && $0.precioSambil < $0.precioCostazul }.prefix(5)
        let cantidades = Dictionary(uniqueKeysWithValues: distintos.map { ($0.id, 2) })
        let porId = Dictionary(uniqueKeysWithValues: indice.productos.map { ($0.id, $0) })
        let comparacion = Comercio.comparar(cantidades: cantidades, productos: porId)
        let costazul = comparacion.first { $0.sucursal == .costazul }!, sambil = comparacion.first { $0.sucursal == .sambil }!
        XCTAssertLessThan(sambil.total, costazul.total)
        XCTAssertEqual(sambil.faltantes, 0)
    }
}
