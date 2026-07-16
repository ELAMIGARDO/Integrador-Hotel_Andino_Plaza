import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ChartDataNode } from "../types/reports";

interface DateRevenueTabProps {
  revenueData: ChartDataNode[];
  formatCurrency: (value: number) => string;
}

export const DateRevenueTab: React.FC<DateRevenueTabProps> = ({
  revenueData,
  formatCurrency,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Flujo Macroeconómico de Caja</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolución e histórico de rendimiento financiero en base al período activo.</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 500 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 500 }} 
                tickFormatter={(val) => `S/.${val}`} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                formatter={(value: any) => [formatCurrency(Number(value)), "Ingresos Neto"]} 
              />
              <Bar dataKey="ingresos" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
