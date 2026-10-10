import SwiftUI

@main
struct SigoTiendaApp: App {
    @State private var tienda = Tienda()

    var body: some Scene {
        WindowGroup {
            RaizView()
                .environment(tienda)
                .tint(.sigoVerde)
                // Nunito en la web; en iOS la redondeada del sistema mantiene el mismo carácter
                .fontDesign(.rounded)
                // La identidad de la web es clara; el prototipo la respeta también en modo oscuro
                .preferredColorScheme(.light)
                .task { await tienda.cargar() }
        }
    }
}
