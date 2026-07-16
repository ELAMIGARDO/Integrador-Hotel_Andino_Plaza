interface LegendProps {
  setIsRoomModalOpen: (open: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsInactiveModalOpen: (open: boolean) => void; // Propiedad agregada
}

export function AvailabilityLegend({
  setIsRoomModalOpen,
  setIsModalOpen,
  setIsInactiveModalOpen, // 🌟 Destructuramos la propiedad aquí
}: LegendProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-2 shrink-0 text-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800"></div>
          <span className="text-slate-600 dark:text-slate-400">
            Disponible (Haz clic en el fondo para reservar)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Reserva
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Mantenimiento
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Limpieza
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 🌟 CONECTADO: Al hacer clic abre el modal de inactivas */}
        <button
          onClick={() => setIsInactiveModalOpen(true)}
          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-xs font-semibold rounded-lg shadow-sm transition-colors border border-amber-200 dark:border-amber-900/30"
        >
          Ver Habitaciones Ocultas
        </button>
        
        {/* 🌟 CORREGIDO: Reincorporamos la función para abrir el formulario */}
        <button
          onClick={() => setIsRoomModalOpen(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors border border-slate-200 dark:border-slate-600"
        >
          + Agregar Habitación
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          + Nueva Reserva
        </button>
      </div>
    </div>
  );
}
