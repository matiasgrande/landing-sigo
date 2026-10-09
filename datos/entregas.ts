// Modalidades de entrega y tarifas publicadas en sigo.com.ve/como-comprar
export interface ModalidadEntrega {
  id: string;
  titulo: string;
  vehiculo: string;
  tiempo: string;
  horario: string;
  descripcion: string;
}

export const MODALIDADES_ENTREGA: readonly ModalidadEntrega[] = [
  {
    id: "retiro",
    titulo: "Retiro en tu vehículo",
    vehiculo: "Sin bajarte del carro",
    tiempo: "Tu pedido te espera 3 días",
    horario: "Todos los días · 10:00 a.m. a 9:00 p.m.",
    descripcion: "Compra online y te lo llevamos al carro en Sambil o Costazul, con estacionamiento preferencial.",
  },
  {
    id: "express",
    titulo: "Delivery Express",
    vehiculo: "En moto",
    tiempo: "De 2 a 4 horas",
    horario: "Todos los días · 10:00 a.m. a 8:00 p.m.",
    descripcion: "Para lo que necesitas hoy en Maneiro, Mariño, Arismendi y García.",
  },
  {
    id: "especial",
    titulo: "Delivery Especial",
    vehiculo: "En vehículo",
    tiempo: "Salida diaria 3:00 p.m.",
    horario: "Toda la isla",
    descripcion: "Mercados grandes a cualquier municipio de Margarita.",
  },
  {
    id: "programado",
    titulo: "Delivery Programado",
    vehiculo: "Tú eliges la hora",
    tiempo: "10:00 a.m. a 7:00 p.m.",
    horario: "Agenda tu entrega",
    descripcion: "Elige el bloque horario que mejor te convenga y recíbelo en casa.",
  },
];

export interface TarifaMunicipio {
  municipio: string;
  tarifaUsd: number;
  express: boolean;
}

export const TARIFAS_MUNICIPIO: readonly TarifaMunicipio[] = [
  { municipio: "Maneiro", tarifaUsd: 2.5, express: true },
  { municipio: "Mariño", tarifaUsd: 2.5, express: true },
  { municipio: "Arismendi", tarifaUsd: 3.5, express: true },
  { municipio: "García", tarifaUsd: 4.5, express: true },
  { municipio: "Gómez", tarifaUsd: 15, express: false },
  { municipio: "Antolín del Campo", tarifaUsd: 15, express: false },
  { municipio: "Díaz", tarifaUsd: 15, express: false },
  { municipio: "Marcano", tarifaUsd: 15, express: false },
  { municipio: "Tubores", tarifaUsd: 25, express: false },
  { municipio: "Península de Macanao", tarifaUsd: 30, express: false },
];
