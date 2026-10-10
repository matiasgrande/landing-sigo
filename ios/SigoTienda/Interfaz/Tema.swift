import SwiftUI

/// Colores de marca: los mismos tokens de la web (app/globals.css), extraídos del logo oficial
extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }

    static let sigoAzul = Color(hex: 0x001E63)
    static let sigoAzul900 = Color(hex: 0x00123D)
    static let sigoAzul700 = Color(hex: 0x0B2F86)
    static let sigoAzul100 = Color(hex: 0xE6ECF8)
    static let sigoVerde = Color(hex: 0x007E14)
    static let sigoVerde700 = Color(hex: 0x006410)
    static let sigoVerde100 = Color(hex: 0xE3F5E6)
    static let sigoGris = Color(hex: 0x666666)
    static let sigoTinta = Color(hex: 0x1B2333)
    static let sigoCrema = Color(hex: 0xF7F8FC)
    static let sigoSol = Color(hex: 0xFFC21A)
    /// Coral con texto blanco legible (5,2:1)
    static let sigoCoral = Color(hex: 0xC43D22)
    /// Rojo de error de la web (#b4371c)
    static let sigoError = Color(hex: 0xB4371C)
}

/// Tarjeta blanca con borde suave, como las tarjetas de la web (rounded-3xl + ring-azul/5)
struct EstiloTarjeta: ViewModifier {
    var radio: CGFloat = 24
    var relleno: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .padding(relleno)
            .background(.white, in: .rect(cornerRadius: radio))
            .overlay(RoundedRectangle(cornerRadius: radio).strokeBorder(Color.sigoAzul.opacity(0.06)))
    }
}

extension View {
    func tarjeta(radio: CGFloat = 24, relleno: CGFloat = 16) -> some View {
        modifier(EstiloTarjeta(radio: radio, relleno: relleno))
    }

    /// Etiqueta en mayúsculas con espaciado ("SE VIENE EN 36 DÍAS")
    func estiloEtiqueta(_ color: Color = .sigoVerde) -> some View {
        font(.caption.weight(.heavy)).tracking(1.6).textCase(.uppercase).foregroundStyle(color)
    }
}

/// Pastilla de vidrio Liquid Glass teñida (descuentos, "Mejor precio", "Prototipo")
struct Pastilla: View {
    let texto: String
    var color: Color = .sigoCoral

    var body: some View {
        Text(texto)
            .font(.caption.weight(.heavy))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .glassEffect(.regular.tint(color), in: .capsule)
    }
}
