export interface ReportRoom {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
}

export interface ReportReservation {
  id: number;
  nombreCliente: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaIngreso: string; 
  fechaSalida: string;  
  estado: "ACTIVA" | "FINALIZADA" | "CANCELADA" | "MANTENIMIENTO";
  motivoCancelacion?: string;
  habitacion: ReportRoom;
  costo: number;
}

// 🛡️ INTERFAZ QUE FALTABA EXPORTAR
export interface ReservaCancelada {
  id: number;
  nombreCliente: string;
  fechaSalida: string;
  motivoCancelacion: string;
  precioHabitacion: number;
}

export interface ChartDataNode {
  name: string;
  ingresos: number;
}

export interface OccupancyNode {
  name: "Ocupadas" | "Disponibles";
  value: number;
}

export type FilterPeriod = "diario" | "7" | "30";
