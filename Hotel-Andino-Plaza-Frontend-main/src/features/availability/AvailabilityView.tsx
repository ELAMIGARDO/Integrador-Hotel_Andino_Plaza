import { useAvailabilityView } from "./hooks/useAvailabilityView";
import { BookingModal } from "./components/BookingModal";
import { ReservationDetailModal } from "./components/ReservationDetailModal";
import { RoomModal } from "./components/RoomModal";
import { DeleteRoomModal } from "./components/DeleteRoomModal";
import { AvailabilityFilters } from "./components/AvailabilityFilters";
import { AvailabilityLegend } from "./components/AvailabilityLegend";
import { AvailabilityGanttRow } from "./components/AvailabilityGanttRow";
import { HabitacionesInactivasModal } from "./components/HabitacionesInactivasModal";
import { useState } from "react";
import { toast } from "sonner";

export function AvailabilityView() {
  const {
    roomType,
    setRoomType,
    roomStatus,
    setRoomStatus,
    loading,
    isModalOpen,
    setIsModalOpen,
    days,
    filteredRooms,
    calcularBloquesDeHabitacion,
    cargarDatosDelHotel,
    isDetailOpen,
    setIsDetailOpen,
    reservaSeleccionada,
    setReservaSeleccionada,
    isRoomModalOpen,
    setIsRoomModalOpen,
    handleGuardarHabitacion,
    handleEditarHabitacion,
    handleEliminarHabitacion,
    roomToEdit,
    setRoomToEdit,
    rooms,
    isInactiveModalOpen,
    setIsInactiveModalOpen,
    handleReactivarHabitacion,
  } = useAvailabilityView();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    id: number;
    numero: string;
  } | null>(null);

  // Manejador para el botón de Borrado Físico en el modal (Lanza un DELETE)
  const ejecutarBorradoFisico = async () => {
    if (!selectedRoom) return;

    // Validación crítica del Gantt: ¿Tiene reservas en la línea de tiempo?
    const bloquesDeReserva = calcularBloquesDeHabitacion(selectedRoom.id);
    if (bloquesDeReserva.length > 0) {
      toast.error(`No se puede eliminar la Hab. ${selectedRoom.numero}: Cuenta con un historial de reservas activo.`);
      setIsDeleteModalOpen(false);
      return;
    }

    await handleEliminarHabitacion(selectedRoom.id);
    setIsDeleteModalOpen(false);
  };

  // =========================================================
  // 2. MANEJADOR DE BORRADO LÓGICO (¡NUEVO CANDADO DE SEGURIDAD!)
  // =========================================================
  const ejecutarBorradoLogico = async () => {
    if (!selectedRoom) return;

    // 🔒 CANDADO: Evita ocultar la habitación si actualmente está ocupada o reservada
    const bloquesDeReserva = calcularBloquesDeHabitacion(selectedRoom.id);
    if (bloquesDeReserva.length > 0) {
      toast.error(`No se puede ocultar la Hab. ${selectedRoom.numero} porque tiene reservas activas en el Gantt.`);
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      const habitacionCompleta = rooms.find((r) => r && r.id === selectedRoom.id);
      
      if (!habitacionCompleta) {
        toast.error("No se encontró la información completa de la habitación.");
        setIsDeleteModalOpen(false);
        return;
      }

      // Si pasa la validación del Gantt, recién ejecuta el PUT de desactivación
      await handleEditarHabitacion({
        ...habitacionCompleta,
        activo: false 
      });

      toast.success(`Habitación ${selectedRoom.numero} trasladada a ocultas con éxito.`);
      
    } catch (error) {
      console.error("Error al ejecutar borrado lógico manual:", error);
      toast.error("Ocurrió un error al intentar ocultar la habitación.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Cargando mapa de ocupación real del hotel...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <AvailabilityFilters
        days={days}
        roomType={roomType}
        setRoomType={setRoomType}
        roomStatus={roomStatus}
        setRoomStatus={setRoomStatus}
      />

      <AvailabilityLegend
        setIsRoomModalOpen={setIsRoomModalOpen}
        setIsModalOpen={setIsModalOpen}
        setIsInactiveModalOpen={setIsInactiveModalOpen}
      />

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex-1 overflow-auto flex flex-col min-h-[500px]">
        {/* Cabecera de los Días del Calendario */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 shrink-0">
          <div className="w-48 shrink-0 border-r border-slate-200 dark:border-slate-700 p-4 flex items-center font-medium text-slate-700 dark:text-slate-300 text-sm">
            Habitación
          </div>
          <div className="flex-1 flex min-w-[800px]">
            {days.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[80px] border-r border-slate-200 dark:border-slate-700 p-4 text-center"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {day.split(" ")[0]}
                </span>
                <div className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {day.split(" ")[1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filas de Habitaciones Dinámicas */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className="flex border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 group"
              >
                {/* Lateral Izquierdo: Información y Acciones Rápidas */}
                <div className="w-48 shrink-0 border-r border-slate-200 dark:border-slate-700 p-4 z-10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Hab. {room.numero}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {room.tipo} • Activa
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => {
                        setRoomToEdit(room);
                        setIsRoomModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                      title="Editar Habitación"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoom({ id: room.id, numero: room.numero });
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                      title="Eliminar Habitación"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <AvailabilityGanttRow
                  days={days}
                  roomBlocks={calcularBloquesDeHabitacion(room.id)}
                  setIsModalOpen={setIsModalOpen}
                  setReservaSeleccionada={setReservaSeleccionada}
                  setIsDetailOpen={setIsDetailOpen}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No se encontraron habitaciones reales creadas en MySQL.
            </div>
          )}
        </div>

        {/* Modales Interactivos del Sistema */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={cargarDatosDelHotel}
        />

        <ReservationDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setReservaSeleccionada(null);
          }}
          reserva={reservaSeleccionada}
          onSuccessRefrescar={cargarDatosDelHotel}
        />

        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => {
            setIsRoomModalOpen(false);
            setRoomToEdit(null);
          }}
          onSave={roomToEdit ? handleEditarHabitacion : handleGuardarHabitacion}
          roomToEdit={roomToEdit}
        />

        <DeleteRoomModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleteLogico={ejecutarBorradoLogico}
          onDeleteFisico={ejecutarBorradoFisico}
          roomNumber={selectedRoom?.numero || ""}
        />

        <HabitacionesInactivasModal
          isOpen={isInactiveModalOpen}
          onClose={() => setIsInactiveModalOpen(false)}
          rooms={rooms}
          onReactivar={handleReactivarHabitacion}
        />
      </div>
    </div>
  );
}
