import React from "react";
import { ReservaCancelada } from "../types/reports";

interface CancellationsTabProps {
  cancelaciones: ReservaCancelada[];
  formatCurrency: (value: number) => string;
}

export const CancellationsTab: React.FC<CancellationsTabProps> = ({
  cancelaciones,
  formatCurrency,
}) => {
  // Calculamos la pérdida total acumulada para transparencia de auditoría
  const perdidaTotal = cancelaciones.reduce((sum, c) => sum + (c.precioHabitacion ?? 0), 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-700/60">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Mermas y Registros Eliminados</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Auditoría estricta de cancelaciones históricas y penalizaciones aplicadas por el counter.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4">ID Reserva</th>
              <th className="px-6 py-4">Cliente Pasajero</th>
              <th className="px-6 py-4">Fecha Cancelación</th>
              <th className="px-6 py-4">Motivo / Causa de Baja</th>
              <th className="px-6 py-4 text-right">Precio Hab. (Pérdida)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
            {cancelaciones.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">RES-{booking.id}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{booking.nombreCliente}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{booking.fechaSalida || "N/A"}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100/80 dark:border-red-900/30">
                    {booking.motivoCancelacion || "Anulación sin justification"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(booking.precioHabitacion ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {cancelaciones.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-medium">
          Operación Limpia: No se registran cancelaciones financieras en este periodo.
        </div>
      ) : (
        /* Seccion agregada para ver la pérdida total acumulada en la tabla */
        <div className="px-6 py-4 text-right text-sm font-bold bg-slate-50/30 dark:bg-slate-900/20 text-rose-600 dark:text-rose-400 border-t border-slate-100 dark:border-slate-700/40">
          Total Pérdidas por Anulación: {formatCurrency(perdidaTotal)}
        </div>
      )}
    </div>
  );
};
