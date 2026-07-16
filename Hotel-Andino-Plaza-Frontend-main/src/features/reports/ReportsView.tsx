import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { useIncomeReports } from "./hooks/useIncomeReports";

// Subcomponentes Atómicos Modularizados
import { ReportKpiCards } from "./components/ReportKpiCards";
import { SalesControlTab } from "./components/SalesControlTab";
import { DateRevenueTab } from "./components/DateRevenueTab";
import { PerformanceTab } from "./components/PerformanceTab";
import { CancellationsTab } from "./components/CancellationsTab";
import { StockInventoryTab } from "./components/StockInventoryTab";

// 🚀 Importación del nuevo Servicio Desglosado de Impresión
import { exportReservationBoleta, handleExportPDF } from "./services/reportExportService";

const tabs = [
  { key: "ventas-control", label: "Ventas y Control" },
  { key: "por-fechas", label: "Por Fechas" },
  { key: "indicadores", label: "Indicadores" },
  { key: "cancelaciones", label: "Registros Eliminados" },
  { key: "ingresos-stock", label: "Ingresos y Stock" },
];

export function ReportsView() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  
  const {
    loading,
    totalIngresosAcumulados,
    porcentajeOcupadas,
    occupancyData,
    revenueData,
    reservasCanceladas,
    filtroDias,
    setFiltroDias,
    exportarExcelCSV,
    reservasTodas,
    reservasDetalle,
  } = useIncomeReports();

  const formatCurrency = (value: number) => `S/. ${value.toFixed(2)}`;
  const habitacionesTotales = 25; 
  const habitacionesOcupadas = Math.round((porcentajeOcupadas / 100) * habitacionesTotales);
  const tabLabel = tabs.find((tab) => tab.key === activeTab)?.label || "Reporte";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm font-medium text-slate-400">
        <div className="animate-pulse">Sincronizando balances contables del Hotel Andino Plaza...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50/40 dark:bg-slate-900/10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* BARRA SUPERIOR DE ACCIONES */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Módulo Financiero y Control de Reportes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cierre de cajas y auditoría interna.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={filtroDias}
              onChange={(e) => setFiltroDias(e.target.value as any)}
              className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm"
            >
              <option value="diario">Vista por Clientes</option>
              <option value="7">Últimos 7 Días (Semanal)</option>
              <option value="30">Últimos 30 Días (Mensual)</option>
            </select>
            <button
              onClick={exportarExcelCSV}
              className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={14} /> CSV Excel
            </button>
            <button
              onClick={() => handleExportPDF(activeTab, tabLabel, reservasTodas.length > 0 ? reservasTodas : reservasDetalle, reservasCanceladas)}
              disabled={activeTab === "indicadores" || activeTab === "ventas-control" || (reservasTodas.length === 0 && reservasDetalle.length === 0)}
              className="flex items-center gap-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-800 shadow-sm disabled:opacity-40"
            >
              <FileText size={14} /> Reporte PDF
            </button>
          </div>
        </div>

        {/* NAVEGADOR DE PESTAÑAS */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-1 shadow-sm">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === tab.key ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* DISTRIBUCIÓN MODULAR DE VISTAS */}
        {activeTab === "ventas-control" && (
          <div className="space-y-6">
            <ReportKpiCards 
              totalIngresos={totalIngresosAcumulados}
              totalReservas={reservasTodas.length || reservasDetalle.length}
              habitacionesDisponibles={Math.max(habitacionesTotales - habitacionesOcupadas, 0)}
              porcentajeOcupacion={porcentajeOcupadas}
              formatCurrency={formatCurrency}
            />
            <SalesControlTab 
              reservas={reservasTodas.length > 0 ? reservasTodas : reservasDetalle}
              formatCurrency={formatCurrency}
              onExportBoleta={exportReservationBoleta}
            />
          </div>
        )}

        {activeTab === "por-fechas" && (
          <DateRevenueTab revenueData={revenueData} formatCurrency={formatCurrency} />
        )}

        {activeTab === "indicadores" && (
          <PerformanceTab 
            occupancyData={occupancyData}
            tarifaPromedio={totalIngresosAcumulados / (reservasTodas.length || 1)}
            totalIngresos={totalIngresosAcumulados}
            habitacionesTotales={habitacionesTotales}
            porcentajeOcupacion={porcentajeOcupadas}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "cancelaciones" && (
          <CancellationsTab cancelaciones={reservasCanceladas} formatCurrency={formatCurrency} />
        )}

        {activeTab === "ingresos-stock" && (
          <StockInventoryTab 
            reservas={reservasTodas.length > 0 ? reservasTodas : reservasDetalle}
            habitacionesOcupadas={habitacionesOcupadas}
            habitacionesTotales={habitacionesTotales}
            totalIngresos={totalIngresosAcumulados}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}
