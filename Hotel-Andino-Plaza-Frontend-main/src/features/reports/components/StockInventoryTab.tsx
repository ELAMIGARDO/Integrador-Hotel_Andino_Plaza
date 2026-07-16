import React from "react";
import { ReportReservation } from "../types/reports";

interface StockInventoryTabProps {
  reservas: ReportReservation[];
  habitacionesOcupadas: number;
  habitacionesTotales: number;
  totalIngresos: number;
  formatCurrency: (value: number) => string;
}

// Helper contable para cálculo de noches locales
const calcularNochesSeguras = (ingreso: string, salida: string): number => {
  if (!ingreso || !salida) return 1;
  const fechaIn = new Date(ingreso);
  const fechaOut = new Date(salida);
  const diffTime = fechaOut.getTime() - fechaIn.getTime();
  const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return noches <= 0 ? 1 : noches;
};

export const StockInventoryTab: React.FC<StockInventoryTabProps> = ({
  reservas,
  habitacionesOcupadas,
  habitacionesTotales,
  totalIngresos,
  formatCurrency,
}) => {
  const totalRealLiquidado = reservas.reduce((sum, r) => {
    const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
    const precioHab = r.habitacion?.precio ?? 0;
    const monto = r.costo && r.costo > 0 ? r.costo : noches * precioHab;
    return sum + monto;
  }, 0);

  return (
    <div className="space-y-6">
      {/* SECCIÓN SUPERIOR DE TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Flujo Bruto Realizado
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(
              totalRealLiquidado > 0 ? totalRealLiquidado : totalIngresos,
            )}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Capacidad Máxima Física
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {habitacionesTotales} Habitaciones
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Habitaciones Ocupadas
          </p>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {habitacionesOcupadas} Activas
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Utilidad Neta Auditada
          </p>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(
              totalRealLiquidado > 0 ? totalRealLiquidado : totalIngresos,
            )}
          </p>
        </div>
      </div>

      {/* DETALLE DEL INVENTARIO DE HABITACIONES */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-700/60">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Ventas / Desglose del Stock Vendido
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lista detallada de habitaciones rentadas con sus respectivos costos
            liquidados en BD.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Cliente Huésped</th>
                <th className="px-6 py-3">Check-In</th>
                <th className="px-6 py-3">Check-Out</th>
                <th className="px-6 py-3">Nro. Habitación</th>
                <th className="px-6 py-3 text-center">Noches</th>
                {/* 🆕 1. AGREGAMOS EL ENCABEZADO DE TARIFA POR NOCHE */}
                <th className="px-6 py-3 text-right">Tarifa / Noche</th>
                <th className="px-6 py-3 text-right">Rendimiento Cobrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
              {reservas.map((r) => {
                const noches = calcularNochesSeguras(
                  r.fechaIngreso,
                  r.fechaSalida,
                );
                const precioHab = r.habitacion?.precio ?? 0;
                const montoReserva =
                  r.costo && r.costo > 0 ? r.costo : noches * precioHab;

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-3 font-semibold text-slate-500">
                      RES-{r.id}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {r.nombreCliente}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                      {r.fechaIngreso}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                      {r.fechaSalida}
                    </td>
                    <td className="px-6 py-3">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono text-xs text-slate-700 dark:text-slate-300">
                        Hab {r.habitacion?.numero || "S/N"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-xl text-xs border border-blue-100 dark:border-blue-900/30 tracking-wide shadow-sm">
                        {noches} {noches === 1 ? "noche" : "noches"}
                      </span>
                    </td> 
                    {/* 🆕 2. INYECTAMOS LA CELDA VISUAL DE LA TARIFA BASE UNITARIA */}
                    <td className="px-6 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                      {formatCurrency(precioHab)}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-slate-900 dark:text-slate-200">
                      {formatCurrency(montoReserva)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 text-right text-sm font-bold bg-slate-50/30 dark:bg-slate-900/20 text-slate-900 dark:text-slate-100 border-t border-slate-100 dark:border-slate-700/40">
          Total Liquidado en Rango: {formatCurrency(totalRealLiquidado)}
        </div>
      </div>
    </div>
  );
};
