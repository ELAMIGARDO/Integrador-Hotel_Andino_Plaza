import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { parseISO, addDays, differenceInDays } from "date-fns";
import { useWebSocketAvailability } from "./useWebSocketAvailability";
import { toast } from "sonner"; 

export interface HabitacionReal {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  disponible: boolean;
  activo: boolean;
}

interface ReservaReal {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCliente: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: string;
  habitacion: {
    id: number;
    numero: string;
    tipo: string;
    precio: number;
    disponible: boolean;
  };
}

export function useAvailabilityView() {
  const [roomType, setRoomType] = useState("Todas");
  const [roomStatus, setRoomStatus] = useState("Todos");
  const [rooms, setRooms] = useState<HabitacionReal[]>([]);
  const [reservas, setReservas] = useState<ReservaReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [days, setDays] = useState<string[]>([]);
  const [fechasObjetos, setFechasObjetos] = useState<Date[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<any>(null);

  // Estados para la gestión y CRUD de habitaciones
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<any>(null);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);

  // 1. Función para consultar los datos del Backend (Spring Boot) en Base64
  const cargarDatosDelHotel = useCallback(async () => {
    const credentials = localStorage.getItem("auth_token");

    if (!credentials) {
      console.warn(
        "useAvailabilityView: No se encontraron credenciales válidas en localStorage.",
      );
      setLoading(false);
      return;
    }

    try {
      const tokenBase64 = btoa(credentials);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      const [resRooms, resReservas] = await Promise.all([
        axios.get("http://localhost:8080/api/habitaciones", configHeaders),
        axios.get("http://localhost:8080/api/reservas", configHeaders),
      ]);

      const dataRooms = Array.isArray(resRooms.data) ? resRooms.data : [];
      const dataReservas = Array.isArray(resReservas.data)
        ? resReservas.data
        : [];

      setRooms([...dataRooms]);
      setReservas([...dataReservas]);
    } catch (error) {
      console.error(
        "Error al sincronizar datos del Hotel Plaza Andino en Vista Disponibilidad:",
        error,
      );
      setRooms([]);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Función para guardar una nueva habitación (POST)
  const handleGuardarHabitacion = async (nuevaHabitacion: any) => {
    const credentials = localStorage.getItem("auth_token");
    if (!credentials) return;

    try {
      const tokenBase64 = btoa(credentials);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      const habitacionBody = {
        numero: nuevaHabitacion.numero,
        tipo: nuevaHabitacion.tipo,
        precio: nuevaHabitacion.precio,
        disponible: true,
        activo: true, // Enviamos 'activo: true' nativamente para MySQL
      };

      const response = await axios.post(
        "http://localhost:8080/api/habitaciones",
        habitacionBody,
        configHeaders,
      );

      if (response.status === 200 || response.status === 201) {
        await cargarDatosDelHotel();
      }
    } catch (error) {
      console.error("Error al guardar la habitación mediante el Hook:", error);
    }
  };

  // 3. Función para editar una habitación existente (PUT)
  const handleEditarHabitacion = async (habitacionEditada: any) => {
    const credentials = localStorage.getItem("auth_token");
    if (!credentials) return;

    try {
      const tokenBase64 = btoa(credentials);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.put(
        `http://localhost:8080/api/habitaciones/${habitacionEditada.id}`,
        habitacionEditada,
        configHeaders,
      );

      if (response.status === 200 || response.status === 201) {
        setRoomToEdit(null); // Limpiamos el formulario
        await cargarDatosDelHotel(); // Refrescamos el Gantt en tiempo real
      }
    } catch (error) {
      console.error("Error al editar la habitación desde el Hook:", error);
    }
  };

  // 4. Función completa de eliminación con captura de alertas y errores HTTP
  const handleEliminarHabitacion = async (id: number) => {
    const credentials = localStorage.getItem("auth_token");

    if (!credentials) {
      alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      return;
    }

    if (
      !window.confirm("¿Estás seguro de que deseas eliminar esta habitación?")
    ) {
      return;
    }

    try {
      const tokenBase64 = btoa(credentials);

      const response = await axios.delete(
        `http://localhost:8080/api/habitaciones/${id}`,
        {
          headers: {
            Authorization: `Basic ${tokenBase64}`,
            "Content-Type": "application/json",
          },
        },
      );

      alert(response.data);
      await cargarDatosDelHotel();
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        if (error.response.status === 400 || error.response.status === 409) {
          alert(
            error.response.data ||
              "No se puede eliminar la habitación porque tiene reservas registradas.",
          );
        } else if (error.response.status === 404) {
          alert("La habitación no existe.");
        } else {
          alert(
            error.response.data ||
              "Ocurrió un error al eliminar la habitación.",
          );
        }
      } else {
        alert("No fue posible conectarse con el servidor.");
      }
    }
  };

  // 5. Escucha activa de WebSocket en tiempo real
  useWebSocketAvailability({
    onUpdate: () => {
      const tokenActivo = localStorage.getItem("auth_token");
      if (tokenActivo) {
        cargarDatosDelHotel();
      }
    },
  });

  // 6. Inicialización de fechas del sistema para el Timeline
  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const listaFechas: Date[] = [];
    const listaHeaders: string[] = [];

    for (let i = 0; i < 10; i++) {
      const nuevaFecha = addDays(hoy, i);
      listaFechas.push(nuevaFecha);

      const nombreDia = nuevaFecha.toLocaleDateString("es-ES", {
        weekday: "short",
      });
      const numeroDia = nuevaFecha.getDate();
      const numeroFormateado = numeroDia < 10 ? `0${numeroDia}` : numeroDia;
      const nombreCapitalizado =
        nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1, 3);

      listaHeaders.push(`${nombreCapitalizado} ${numeroFormateado}`);
    }

    setFechasObjetos(listaFechas);
    setDays(listaHeaders);

    cargarDatosDelHotel();
  }, [cargarDatosDelHotel]);

  // 7. Lógica matemática de bloques flotantes del Gantt
  const calcularBloquesDeHabitacion = (habitacionId: number) => {
    if (fechasObjetos.length === 0) return [];
    const fechaInicioGantt = fechasObjetos[0];
    const seguroReservas = Array.isArray(reservas) ? reservas : [];

    const reservasHabitacion = seguroReservas.filter(
      (res) =>
        res &&
        res.habitacion &&
        res.habitacion.id === habitacionId &&
        res.estado !== "FINALIZADA" &&
        res.estado !== "CANCELADA",
    );

    return reservasHabitacion
      .map((res) => {
        const inicioReserva = parseISO(res.fechaIngreso);
        const finReserva = parseISO(res.fechaSalida);

        let startIdx = differenceInDays(inicioReserva, fechaInicioGantt);
        let duracion = differenceInDays(finReserva, inicioReserva) + 1;

        const esBloqueoOperativo =
          res.estado === "MANTENIMIENTO" || res.estado === "LIMPIEZA";

        if (esBloqueoOperativo && res.fechaIngreso === res.fechaSalida) {
          duracion = 1;
        }

        if (startIdx < 0) {
          duracion += startIdx;
          startIdx = 0;
        }

        if (startIdx + duracion > 10) {
          duracion = 10 - startIdx;
        }

        let clasesColor = "bg-red-500 hover:bg-red-600";

        if (res.estado === "MANTENIMIENTO") {
          clasesColor = "bg-slate-500 hover:bg-slate-600";
        } else if (res.estado === "LIMPIEZA") {
          clasesColor = "bg-amber-500 hover:bg-amber-600";
        }

        return {
          start: startIdx,
          duration: duracion,
          status: res.estado,
          colorTailwind: clasesColor,
          label:
            res.estado === "MANTENIMIENTO"
              ? "🛠️ MANTENIMIENTO"
              : res.estado === "LIMPIEZA"
                ? "🧹 LIMPIEZA"
                : res.nombreCliente
                  ? res.nombreCliente.split(" ")[0]
                  : "Ocupado",
          reservaOriginal: res,
        };
      })
      .filter((block) => block.duration > 0);
  };

  // 8. Filtrado reactivo de habitaciones (Oculta las lógicamente inactivas 'activo === false')
  const seguroRooms = Array.isArray(rooms) ? rooms : [];
  const filteredRooms = seguroRooms.filter((room) => {
    if (!room) return false;
    if (room.activo === false) return false;
    if (roomType !== "Todas" && room.tipo !== roomType) return false;
    if (roomStatus !== "Todos") {
      const bloques = calcularBloquesDeHabitacion(room.id);
      if (roomStatus === "Disponible" && bloques.length > 0) return false;
      if (roomStatus === "Ocupado" && bloques.length === 0) return false;
    }
    return true;
  });

  const handleReactivarHabitacion = async (
    roomId: number,
    numero: string,
    tipo: string,
    precio: number,
  ) => {
    const credentials = localStorage.getItem("auth_token");
    if (!credentials) return;

    try {
      const tokenBase64 = btoa(credentials);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      // Enviamos el PUT volviendo a poner 'activo: true'
      await axios.put(
        `http://localhost:8080/api/habitaciones/${roomId}`,
        { id: roomId, numero, tipo, precio, disponible: true, activo: true },
        configHeaders,
      );

      // 🍞 REEMPLAZADO: Alerta premium de éxito sin bloqueo de pantalla
      toast.success(`Habitación ${numero} reactivada con éxito.`);

      await cargarDatosDelHotel(); // Refresca el Gantt e introduce la habitación de nuevo
    } catch (error) {
      console.error("Error al reactivar la habitación:", error);

      // 🍞 REEMPLAZADO: Alerta premium de error estilizada
      toast.error("No se pudo reactivar la habitación. Inténtalo de nuevo.");
    }
  };

  return {
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
    handleEliminarHabitacion,
    handleEditarHabitacion,
    roomToEdit,
    setRoomToEdit,
    rooms,
    isInactiveModalOpen,
    setIsInactiveModalOpen,
    handleReactivarHabitacion,
  };
}
