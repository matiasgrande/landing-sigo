/** Lectura y escritura segura en localStorage (privado, bloqueado o lleno no rompe la tienda) */
export function leerAlmacen<T>(clave: string, respaldo: T, validar: (valor: unknown) => valor is T): T {
  try {
    const crudo = window.localStorage.getItem(clave);
    if (!crudo) return respaldo;
    const valor: unknown = JSON.parse(crudo);
    return validar(valor) ? valor : respaldo;
  } catch {
    return respaldo;
  }
}

export function guardarAlmacen(clave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento: el dato vive solo en esta visita
  }
}

export const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
