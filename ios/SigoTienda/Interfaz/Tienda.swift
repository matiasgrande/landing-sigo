import SwiftUI
import Observation

enum Pestana: Hashable {
    case inicio, recetas, pedidos, carrito, buscar
}

/// Estado de la tienda: catálogo, carrito, entrega, pedidos y tasa. Lo que importa se guarda en el teléfono.
@MainActor
@Observable
final class Tienda {
    enum EstadoCatalogo: Equatable { case cargando, listo, error }

    private(set) var estado: EstadoCatalogo = .cargando
    private(set) var indice: IndiceCatalogo?
    private(set) var porId: [Int: Producto] = [:]
    private(set) var extraidoEn = ""
    private(set) var tasa: TasaBcv?
    private(set) var pedidos: [PedidoGuardado] = []

    var cantidades: [Int: Int] = [:] { didSet { guardar(cantidades, Clave.carrito) } }
    var entrega = Entrega() { didSet { guardar(entrega, Clave.entrega) } }
    var sustitutos: [Int: PreferenciaSustituto] = [:] { didSet { guardar(sustitutos, Clave.sustitutos) } }

    // Navegación compartida
    var pestana: Pestana = .inicio
    var productoAbierto: Producto?
    var selectorEntregaAbierto = false

    private enum Clave {
        static let carrito = "sigo.carrito"
        static let entrega = "sigo.entrega"
        static let sustitutos = "sigo.sustitutos"
        static let pedidos = "sigo.pedidos"
        static let tasa = "sigo.tasa"
    }

    init() {
        cantidades = leer([Int: Int].self, Clave.carrito) ?? [:]
        entrega = leer(Entrega.self, Clave.entrega) ?? Entrega()
        sustitutos = leer([Int: PreferenciaSustituto].self, Clave.sustitutos) ?? [:]
        pedidos = leer([PedidoGuardado].self, Clave.pedidos) ?? []
        tasa = leer(TasaBcv.self, Clave.tasa)
        // Un municipio que ya no existe en las tarifas se descarta
        if let municipio = entrega.municipio, !Datos.tarifas.contains(where: { $0.municipio == municipio }) {
            entrega.municipio = nil
        }
    }

    // MARK: Persistencia

    private func leer<T: Decodable>(_ tipo: T.Type, _ clave: String) -> T? {
        guard let datos = UserDefaults.standard.data(forKey: clave) else { return nil }
        return try? JSONDecoder().decode(tipo, from: datos)
    }

    private func guardar<T: Encodable>(_ valor: T, _ clave: String) {
        if let datos = try? JSONEncoder().encode(valor) { UserDefaults.standard.set(datos, forKey: clave) }
    }

    // MARK: Carga

    private static var urlCache: URL {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("catalogo-asistente.json")
    }

    /// Catálogo empaquetado (o el último descargado) al instante; luego intenta el más reciente de la web
    func cargar() async {
        if indice == nil {
            let local = (try? Data(contentsOf: Self.urlCache)) ?? Bundle.main.url(forResource: "catalogo-asistente", withExtension: "json").flatMap { try? Data(contentsOf: $0) }
            if let local { await aplicar(local) }
        }
        async let tasaNueva: Void = actualizarTasa()
        await actualizarCatalogo()
        _ = await tasaNueva
    }

    private func aplicar(_ datos: Data) async {
        let resultado = await Task.detached(priority: .userInitiated) { () -> (IndiceCatalogo, String)? in
            guard let leido = try? Catalogo.leer(datos) else { return nil }
            let productos = leido.productos, extraidoEn = leido.extraidoEn
            // Promociones de ejemplo (sigo.com.ve hoy no publica descuentos)
            let base = IndiceCatalogo(productos: productos)
            let conPromos = Promociones.aplicar(Promociones.deEjemplo(base), a: productos)
            return (IndiceCatalogo(productos: conPromos), extraidoEn)
        }.value
        guard let resultado else {
            if self.indice == nil { estado = .error }
            return
        }
        let (indice, extraidoEn) = resultado
        self.indice = indice
        self.extraidoEn = extraidoEn
        porId = Dictionary(uniqueKeysWithValues: indice.productos.map { ($0.id, $0) })
        estado = .listo
    }

    private func actualizarCatalogo() async {
        var peticion = URLRequest(url: Datos.urlCatalogo)
        peticion.timeoutInterval = 10
        guard let descarga = try? await URLSession.shared.data(for: peticion),
              (descarga.1 as? HTTPURLResponse)?.statusCode == 200,
              let leido = try? Catalogo.leer(descarga.0),
              leido.extraidoEn != extraidoEn
        else { return }
        let datos = descarga.0
        try? datos.write(to: Self.urlCache)
        await aplicar(datos)
    }

    func actualizarTasa() async {
        var peticion = URLRequest(url: Datos.urlTasa)
        peticion.timeoutInterval = 8
        guard let descarga = try? await URLSession.shared.data(for: peticion),
              let nueva = (try? JSONDecoder().decode(RespuestaDolarApi.self, from: descarga.0))?.tasa
        else { return }
        tasa = nueva
        guardar(nueva, Clave.tasa)
    }

    func reintentar() async {
        estado = indice == nil ? .cargando : estado
        await cargar()
        if indice == nil { estado = .error }
    }

    // MARK: Derivados

    var sucursal: Sucursal { entrega.sucursal }
    var productos: [Producto] { indice?.productos ?? [] }

    var lineas: [LineaCarrito] { Comercio.lineas(cantidades: cantidades, productos: porId, sucursal: sucursal) }
    var lineasCobrables: [LineaCarrito] { lineas.filter(\.disponible) }
    var totalArticulos: Int { cantidades.values.reduce(0, +) }
    func totales(conIgtf: Bool = false) -> Totales { Totales(lineas: lineas, entrega: entrega, conIgtf: conIgtf) }
    var comparacion: [Comercio.TotalSucursal] { Comercio.comparar(cantidades: cantidades, productos: porId) }

    func disponible(_ producto: Producto) -> Bool { producto.disponible(en: sucursal) }

    /// Departamentos con al menos 3 productos con existencia, de mayor a menor
    var departamentos: [(nombre: String, cantidad: Int, portada: Producto?)] {
        var conteo: [String: Int] = [:]
        var portadas: [String: Producto] = [:]
        for producto in productos where disponible(producto) {
            conteo[producto.departamento, default: 0] += 1
            if portadas[producto.departamento] == nil, producto.imagen != nil { portadas[producto.departamento] = producto }
        }
        return conteo.filter { $0.value >= 3 }.sorted { $0.value > $1.value }.map { ($0.key, $0.value, portadas[$0.key]) }
    }

    var ofertas: [Producto] {
        productos.filter { $0.descuento > 0 && disponible($0) }.sorted { $0.descuento > $1.descuento }
    }

    /// Promociones y lo que cuesta menos aquí que en la otra tienda (dato real)
    var ofertasYMejoresPrecios: [Producto] {
        productos.filter { ($0.descuento > 0 || $0.masBarato(en: sucursal)) && disponible($0) }.sorted { $0.descuento > $1.descuento }
    }

    var esenciales: [Producto] {
        guard let indice else { return [] }
        var vistos = Set<Int>()
        return ["harina maiz pan", "arroz", "aceite", "cafe", "azucar", "pasta", "leche polvo", "huevos", "mantequilla", "papel higienico"]
            .compactMap { consulta in
                let elegido = indice.buscar(consulta, esPrefijo: false, disponible: disponible).productos.first { disponible($0) && !vistos.contains($0.id) }
                if let elegido { vistos.insert(elegido.id) }
                return elegido
            }
    }

    func buscar(_ texto: String) -> ResultadoBusqueda {
        indice?.buscar(texto, disponible: disponible) ?? ResultadoBusqueda(productos: [], correccion: nil)
    }

    func similares(a producto: Producto) -> [Producto] {
        let precio = producto.precio(en: sucursal)
        return productos
            .filter { $0.id != producto.id && $0.categoria == producto.categoria && disponible($0) }
            .sorted { abs($0.precio(en: sucursal) - precio) < abs($1.precio(en: sucursal) - precio) }
            .prefix(8).map { $0 }
    }

    // MARK: Acciones del carrito

    func cantidad(de producto: Producto) -> Int { cantidades[producto.id] ?? 0 }

    func agregar(_ producto: Producto, _ delta: Int = 1) {
        let nueva = min(Datos.maximoPorProducto, max(0, cantidad(de: producto) + delta))
        cantidades[producto.id] = nueva == 0 ? nil : nueva
    }

    func quitar(_ producto: Producto) { cantidades[producto.id] = nil }
    func vaciar() { cantidades = [:] }

    /// Agrega lo que siga disponible de un pedido anterior; devuelve cuántos productos entraron
    @discardableResult
    func repetir(_ pedido: PedidoGuardado) -> Int {
        var agregados = 0
        for linea in pedido.lineas {
            guard let producto = porId[linea.id], disponible(producto) else { continue }
            agregar(producto, linea.cantidad)
            agregados += 1
        }
        return agregados
    }

    func registrar(_ pedido: PedidoGuardado) {
        pedidos = Array(([pedido] + pedidos.filter { $0.numero != pedido.numero }).prefix(20))
        guardar(pedidos, Clave.pedidos)
    }
}
