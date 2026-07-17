import React from "react";
import { ReportReservation } from "../types/reports";

interface SalesControlTabProps {
  reservas: ReportReservation[];
  formatCurrency: (value: number) => string;
  onExportBoleta: (reserva: ReportReservation) => void;
}

const calcularNochesSeguras = (ingreso: string, salida: string): number => {
  if (!ingreso || !salida) return 1;
  const fechaIn = new Date(ingreso);
  const fechaOut = new Date(salida);
  const diffTime = fechaOut.getTime() - fechaIn.getTime();
  const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return noches <= 0 ? 1 : noches;
};

export const SalesControlTab: React.FC<SalesControlTabProps> = ({
  reservas,
  formatCurrency,
  onExportBoleta,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-700/60">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Auditoría General de Reservas</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Catálogo completo del hotel. Descargue el comprobante de auditoría por cada celda operativa.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-3.5">ID</th>
              <th className="px-6 py-3.5">Cliente</th>
              <th className="px-6 py-3.5">Documento</th>
              <th className="px-6 py-3.5">Check-In</th>
              <th className="px-6 py-3.5">Check-Out</th>
              <th className="px-6 py-3.5">Habitación</th>
              <th className="px-6 py-3.5">Estado</th>
              <th className="px-6 py-3.5 text-right">Monto</th>
              <th className="px-6 py-3.5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-sm">
            {reservas.map((reserva) => {
              const noches = calcularNochesSeguras(reserva.fechaIngreso, reserva.fechaSalida);
              const precioPorNoche = reserva.habitacion?.precio ?? 0;
              
              const montoFinal = reserva.costo && reserva.costo > 0 
                ? reserva.costo 
                : noches * precioPorNoche;

              const estadoUpper = reserva.estado?.toUpperCase() || "ACTIVA";

              return (
                <tr key={reserva.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-slate-200">RES-{reserva.id}</td>
                  <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 font-medium ">{reserva.nombreCliente}</td>
                  <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{`${reserva.tipoDocumento || ""} ${reserva.numeroDocumento || ""}`.trim()}</td>
                  <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{reserva.fechaIngreso}</td>
                  <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{reserva.fechaSalida}</td>
                  <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Hab {reserva.habitacion?.numero}</span> ({reserva.habitacion?.tipo})
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide
                      ${estadoUpper === 'ACTIVA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40' : ''}
                      ${estadoUpper === 'FINALIZADA' ? 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40' : ''}
                      ${estadoUpper === 'CANCELADA' ? 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40' : ''}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                        ${estadoUpper === 'ACTIVA' ? 'bg-emerald-500' : ''}
                        ${estadoUpper === 'FINALIZADA' ? 'bg-blue-500' : ''}
                        ${estadoUpper === 'CANCELADA' ? 'bg-rose-500' : ''}
                      `} />
                      {estadoUpper}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-slate-900 dark:text-slate-200">
                    {formatCurrency(montoFinal)}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onExportBoleta(reserva)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/80 px-3 py-1.5 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-600 transition-all shadow-sm"
                    >
                      Boleta PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
