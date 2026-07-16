import { X, RefreshCw } from "lucide-react";

interface HabitacionReal {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  activo: boolean;
}

interface InactiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: HabitacionReal[];
  onReactivar: (id: number, numero: string, tipo: string, precio: number) => Promise<void>;
}

export function HabitacionesInactivasModal({ isOpen, onClose, rooms, onReactivar }: InactiveModalProps) {
  if (!isOpen) return null;

  // Filtramos en tiempo real del array original solo las que tengan activo === false
  const habitacionesInactivas = rooms.filter((room) => room && room.activo === false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col max-h-[85vh] transition-all">
        
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Habitaciones Ocultas (Desactivadas)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lista de habitaciones retiradas del mapa de ocupación actual.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido / Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {habitacionesInactivas.length > 0 ? (
            habitacionesInactivas.map((room) => (
              <div 
                key={room.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 rounded-lg hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Habitación {room.numero}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {room.tipo} • S/. {room.precio}
                  </div>
                </div>

                <button
                  onClick={() => onReactivar(room.id, room.numero, room.tipo, room.precio)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/80 text-xs font-semibold rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30"
                  title="Restaurar habitación al Gantt"
                >
                  <RefreshCw size={12} />
                  Reactivar
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              No hay ninguna habitación desactivada lógicamente.
            </div>
          )}
        </div>

        {/* Pie de Modal */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
