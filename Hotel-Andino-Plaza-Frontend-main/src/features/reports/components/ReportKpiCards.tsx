import React from "react";

interface ReportKpiCardsProps {
  totalIngresos: number;
  totalReservas: number;
  habitacionesDisponibles: number;
  porcentajeOcupacion: number;
  formatCurrency: (value: number) => string;
}

export const ReportKpiCards: React.FC<ReportKpiCardsProps> = ({
  totalIngresos,
  totalReservas,
  habitacionesDisponibles,
  porcentajeOcupacion,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 transition-all hover:shadow-md">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ingresos totales</p>
        <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalIngresos)}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 transition-all hover:shadow-md">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reservas totales</p>
        <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{totalReservas}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 transition-all hover:shadow-md">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Habitaciones disponibles</p>
        <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{habitacionesDisponibles}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 transition-all hover:shadow-md">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ocupación hoy</p>
        <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{porcentajeOcupacion.toFixed(0)}%</p>
      </div>
    </div>
  );
};
