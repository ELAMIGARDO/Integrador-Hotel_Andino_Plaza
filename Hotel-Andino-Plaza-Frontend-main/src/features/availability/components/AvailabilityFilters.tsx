import { CalendarIcon, ChevronDown } from "lucide-react";

interface FiltersProps {
  days: string[];
  roomType: string;
  setRoomType: (value: string) => void;
  roomStatus: string;
  setRoomStatus: (value: string) => void;
}

export function AvailabilityFilters({ days, roomType, setRoomType, roomStatus, setRoomStatus }: FiltersProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap items-end gap-4 shrink-0 transition-colors duration-200">
      <div className="flex-1 min-w-[320px]">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Rango de Fechas del Sistema (Tiempo Real)
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              readOnly
              value={days[0] ? `Desde ${days[0]}` : ""}
              className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
          <span className="text-slate-400 dark:text-slate-500">-</span>
          <div className="relative flex-1">
            <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              readOnly
              value={days[9] ? `Hasta ${days[9]}` : ""}
              className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="w-48 flex-shrink-0">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Tipo de Habitación
        </label>
        <div className="relative">
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 appearance-none pr-10"
          >
            <option value="Todas">Todas</option>
            <option value="Estándar">Estándar</option>
            <option value="Doble">Doble</option>
            <option value="Suite">Suite</option>
            <option value="Penthouse">Penthouse</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="w-48 flex-shrink-0">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Estado
        </label>
        <div className="relative">
          <select
            value={roomStatus}
            onChange={(e) => setRoomStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 appearance-none pr-10"
          >
            <option value="Todos">Todos</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
