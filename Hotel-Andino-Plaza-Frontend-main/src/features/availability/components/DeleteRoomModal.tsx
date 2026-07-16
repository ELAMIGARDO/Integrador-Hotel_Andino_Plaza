import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteLogico: () => void;
  onDeleteFisico: () => void;
  roomNumber: string;
}

export function DeleteRoomModal({
  isOpen,
  onClose,
  onDeleteLogico,
  onDeleteFisico,
  roomNumber,
}: DeleteRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-colors duration-200">
        
        {/* Cabecera del Modal */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle size={18} />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Eliminar Habitación {roomNumber}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo / Opciones */}
        <div className="p-4 flex flex-col gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Selecciona el tipo de eliminación para este registro:
          </p>

          {/* Botón Opción Lógica */}
          <button
            onClick={onDeleteLogico}
            className="w-full text-left p-3 border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors group"
          >
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Eliminación Lógica
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Inactiva la habitación en la interfaz conservando su historial de reservas en la base de datos.
            </div>
          </button>

          {/* Botón Opción Física */}
          <button
            onClick={onDeleteFisico}
            className="w-full text-left p-3 border border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <div className="text-xs font-semibold text-red-600 dark:text-red-400">
              Eliminación Física
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Borra permanentemente el registro de la base de datos (Fallará si la habitación ya posee reservas).
            </div>
          </button>

          {/* Botón Cancelar */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors text-center"
          >
            Cancelar Operación
          </button>
        </div>
      </div>
    </div>
  );
}
