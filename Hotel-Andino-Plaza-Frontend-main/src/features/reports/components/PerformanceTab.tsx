import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { OccupancyNode } from "../types/reports";

interface PerformanceTabProps {
  occupancyData: OccupancyNode[];
  tarifaPromedio: number;
  totalIngresos: number;
  habitacionesTotales: number;
  porcentajeOcupacion: number;
  formatCurrency: (value: number) => string;
}

const COLORS = ["#2563eb", "#10b981"]; // Azul para Ocupadas, Verde para Disponibles

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  occupancyData,
  tarifaPromedio,
  totalIngresos,
  habitacionesTotales,
  porcentajeOcupacion,
  formatCurrency,
}) => {
  // Cálculo seguro del ingreso promedio por día según las habitaciones del PMS
  const promedioIngresos = totalIngresos > 0 ? totalIngresos / 30 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* PANEL 1: TABLA DE INDICADORES CLAVE (KPIs) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Indicadores Clave (Métricas)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Métricas de rendimiento operativo promediadas.</p>
        </div>
        
        <div className="mt-6 space-y-4 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700/50 pb-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Ingreso diario estimado</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(promedioIngresos)}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700/50 pb-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Tarifa promedio por noche</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(tarifaPromedio)}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700/50 pb-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Porcentaje de ocupación</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{porcentajeOcupacion.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Capacidad de inventario</span>
            <span className="font-bold text-slate-900 dark:text-white">{habitacionesTotales} Habitaciones</span>
          </div>
        </div>
      </div>

      {/* PANEL 2: GRÁFICO CIRCULAR DE OCUPACIÓN REAL DE HABITACIONES */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 lg:col-span-2 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Disponibilidad de Inventario en Tiempo Real</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Relación porcentual entre habitaciones rentadas y libres.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 mt-4">
          {/* Contenedor del Gráfico */}
          <div className="h-48 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value: any) => [`${value}%`, "Proporción"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda Personalizada con Tailwind */}
          <div className="space-y-3 px-4">
            {occupancyData.map((node, index) => (
              <div key={node.name} className="flex items-center justify-between border-l-4 pl-3" style={{ borderColor: COLORS[index] }}>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{node.name}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{node.value}% del total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
