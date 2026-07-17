// reports/components/MinMaxAverageTab.tsx
import React from "react";

interface MinMaxAverageTabProps {
  reservas: any[];
  kpiMax: number;
  kpiMin: number;
  kpiAvg: number;
  formatCurrency: (value: number) => string;
}

const calcularNochesSeguras = (ingreso: string, salida: string): number => {
  if (!ingreso || !salida) return 1;
  const fechaIn = new Date(ingreso);
  const fechaOut = new Date(salida);
  const diffTime = fechaOut.getTime() - fechaIn.getTime();
  const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return noches <= 0 ? 1 : noches;
};

export function MinMaxAverageTab({
  reservas = [],
  kpiMax,         // ✅ Recibido correctamente
  kpiMin,         // ✅ Recibido correctamente
  kpiAvg,         // ✅ Recibido correctamente
  formatCurrency,
}: MinMaxAverageTabProps) {
  return (
    <div className="space-y-6">
      {/* TARJETAS KPI SUPERIORES (Se mantienen intactas con tus valores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Máximo ingreso diario</h3>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(kpiMax)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mínimo ingreso diario</h3>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(kpiMin)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio ingreso diario</h3>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-2">
            {formatCurrency(kpiAvg)}
          </p>
        </div>
      </div>

      {/* LISTA DETALLADA INFERIOR */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
          Ventas por día (detalle transaccional)
        </h2>
        
        {reservas.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            No se encontraron registros de ventas para el período seleccionado.
          </div>
        ) : (
          <div className="space-y-3">
            {reservas
              .filter((r) => r && r.estado !== "CANCELADA") // 🛡️ Evita duplicar cancelados aquí abajo
              .map((reserva: any, idx: number) => {
                const fechaStr = reserva.fechaIngreso || "Fecha no registrada";
                const clienteStr = reserva.nombreCliente || "CLIENTE GENERAL";
                
                const noches = calcularNochesSeguras(reserva.fechaIngreso, reserva.fechaSalida);
                const precioPorNoche = reserva.habitacion?.precio ?? 0;
                const montoFinal = reserva.costo && reserva.costo > 0 
                  ? reserva.costo 
                  : noches * precioPorNoche;

                const numHab = reserva.habitacion?.numero || "";
                const tipoHab = reserva.habitacion?.tipo || "";
                const habitacionDetalle = `Hab ${numHab} ${tipoHab ? `(${tipoHab})` : ""}`;

                return (
                  <div 
                    key={reserva.id || idx} 
                    className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-400">{fechaStr}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                        {clienteStr}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{habitacionDetalle}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400">{noches} {noches === 1 ? 'Noche' : 'Noches'}</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {formatCurrency(montoFinal)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
