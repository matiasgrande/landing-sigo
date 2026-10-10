// swift-tools-version: 5.10
// Paquete solo para probar el núcleo de la app (sin SwiftUI) fuera de Xcode, incluso en Linux:
//   swift test
import PackageDescription

let package = Package(
    name: "SigoNucleo",
    platforms: [.iOS(.v17), .macOS(.v14)],
    targets: [
        .target(name: "SigoNucleo", path: "SigoTienda/Nucleo"),
        .testTarget(name: "PruebasNucleo", dependencies: ["SigoNucleo"], path: "PruebasNucleo"),
    ]
)
