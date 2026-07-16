import { useState, useEffect } from "react";
import axios from "axios";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface UseReservationDetailProps {
  reserva: any;
  onSuccessRefrescar?: () => void;
  onClose: () => void;
}

export function useReservationDetail({
  reserva,
  onSuccessRefrescar,
  onClose,
}: UseReservationDetailProps) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarCampoCancelar, setMostrarCampoCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  // 🌟 NUEVOS ESTADOS INDEPENDIENTES: Controlan los inputs de fecha en el modal
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [isSubmittingFechas, setIsSubmittingFechas] = useState(false);

  // 🌟 EFECTO NUEVO: Sincroniza los inputs con la reserva original cada vez que se selecciona una
  useEffect(() => {
    if (reserva) {
      setFechaIngreso(reserva.fechaIngreso || "");
      setFechaSalida(reserva.fechaSalida || "");
    }
  }, [reserva]);

  // 1. Cálculo exacto del modelo hotelero por NOCHES de estadía
  const totalNoches = reserva
    ? differenceInCalendarDays(
        parseISO(reserva.fechaSalida),
        parseISO(reserva.fechaIngreso),
      )
    : 0;

  // 2. Multiplicación correcta del total a pagar en base a las noches calculadas
  const totalPagar = totalNoches * (reserva?.habitacion?.precio || 0);

  // 3. Petición HTTP PUT para liberar la habitación - MANTENIDO INTACTO
  const gestionarLiberacion = async () => {
    if (!reserva) return;

    const credentials = localStorage.getItem("auth_token");
    if (!credentials) {
      toast.error("Sesión expirada. Por favor, vuelve a iniciar sesión.");
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

      await axios.put(
        `http://localhost:8080/api/reservas/${reserva.id}/finalizar`,
        {},
        configHeaders,
      );

      toast.success("Habitación liberada correctamente", {
        style: { background: "#059669", color: "white", border: "none" },
      });

      if (onSuccessRefrescar) onSuccessRefrescar();
      setMostrarConfirmacion(false);
      onClose();
    } catch (error) {
      console.error("Error al liberar habitación:", error);
      toast.error("No se pudo liberar la habitación. Inténtalo de nuevo.");
    }
  };

  // 4. PETICIÓN HTTP PUT PARA CANCELAR - MANTENIDO INTACTO
  const gestionarCancelacion = async () => {
    if (!reserva) return;

    const motivoLimpio = motivoCancelacion.trim();
    if (!motivoLimpio) {
      toast.error(
        "Por favor, escribe un motivo para proceder con la cancelación.",
      );
      return;
    }

    const cantidadPalabras = motivoLimpio.split(/\s+/).filter(Boolean).length;
    if (cantidadPalabras > 10) {
      toast.error(
        `El motivo es demasiado largo (${cantidadPalabras} palabras). Por favor, escribe un resumen breve de máximo 10 palabras.`,
      );
      return;
    }

    const credentials = localStorage.getItem("auth_token");
    if (!credentials) {
      toast.error("Sesión expirada. Por favor, vuelve a iniciar sesión.");
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

      await axios.put(
        `http://localhost:8080/api/reservas/${reserva.id}/cancelar`,
        { motivo: motivoLimpio },
        configHeaders,
      );

      toast.success("Reserva cancelada y registrada correctamente", {
        style: { background: "#dc2626", color: "white", border: "none" },
      });

      if (onSuccessRefrescar) onSuccessRefrescar();
      setMostrarCampoCancelar(false);
      setMotivoCancelacion("");
      onClose();
    } catch (error) {
      console.error("Error al cancelar la reserva desde React:", error);
      toast.error("No se pudo registrar la cancelación. Inténtalo de nuevo.");
    }
  };

  // 🌟 5. FUNCIÓN NUEVA AGREGADA: Guarda los cambios de fecha enviando un PUT al endpoint base
  const gestionarModificacionFechas = async () => {
    if (!reserva) return;

    // ⏳ OBTENEMOS LA FECHA DE HOY EN FORMATO PLANO LOCAL SIN HORA
    const hoyLocal = new Date();
    hoyLocal.setHours(0, 0, 0, 0);

    // 🛠️ CORRECCIÓN DE ZONA HORARIA PERÚ: Forzamos el parseo con la hora local interna del navegador
    // Reemplazamos los guiones por diagonales para que JavaScript lo procese en hora local y no en UTC
    const fechaIngresoPlana = new Date(fechaIngreso.replace(/-/g, "\/"));
    const fechaSalidaPlana = new Date(fechaSalida.replace(/-/g, "\/"));

    fechaIngresoPlana.setHours(0, 0, 0, 0);
    fechaSalidaPlana.setHours(0, 0, 0, 0);

    // --- 🔒 REGLA DE SEGURIDAD 1: Bloquea modificaciones a fechas pasadas reales del sistema ---
    if (fechaIngresoPlana < hoyLocal) {
      toast.error(
        "Operación rechazada: No se pueden arrastrar o modificar reservas a fechas pasadas del sistema.",
        {
          style: { background: "#DC2626", color: "white", border: "none" },
        },
      );
      return;
    }

    // --- 🔒 REGLA DE SEGURIDAD 2: Evita que la salida sea anterior al ingreso ---
    if (fechaSalidaPlana < fechaIngresoPlana) {
      toast.error(
        "La fecha de Check-Out no puede ser anterior a la fecha de Check-In.",
        {
          style: { background: "#DC2626", color: "white", border: "none" },
        },
      );
      return;
    }

    // --- 🔒 REGLA DE SEGURIDAD 3: Regla hotelera para Huéspedes (Mínimo 1 noche) ---
    const esReservaNormal = reserva.estado === "ACTIVA";
    if (esReservaNormal && fechaSalida === fechaIngreso) {
      toast.error(
        "Para reservas de huéspedes, la fecha de salida debe ser por lo menos un día posterior al ingreso (mínimo 1 noche).",
        {
          style: { background: "#DC2626", color: "white", border: "none" },
        },
      );
      return;
    }

    const credentials = localStorage.getItem("auth_token");
    if (!credentials) {
      toast.error("Sesión expirada. Por favor, vuelve a iniciar sesión.");
      return;
    }

    setIsSubmittingFechas(true);
    try {
      const tokenBase64 = btoa(credentials);
      const configHeaders = {
        headers: {
          Authorization: `Basic ${tokenBase64}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(
        `http://localhost:8080/api/reservas/${reserva.id}`,
        {
          fechaIngreso: fechaIngreso,
          fechaSalida: fechaSalida,
        },
        configHeaders,
      );

      toast.success("Fechas de hospedaje actualizadas con éxito en MySQL.", {
        style: { background: "#0284c7", color: "white", border: "none" },
      });

      if (onSuccessRefrescar) onSuccessRefrescar();
      onClose();
    } catch (error: any) {
      console.error("Error al modificar fechas:", error);
      if (error.response && error.response.status === 409) {
        toast.error(
          error.response.data ||
            "Las nuevas fechas chocan con otra reserva activa.",
        );
      } else {
        toast.error("No se pudieron actualizar las fechas de la habitación.");
      }
    } finally {
      setIsSubmittingFechas(false);
    }
  };

  // Exponemos las variables originales intactas más las nuevas incorporaciones hacia el Modal
  return {
    mostrarConfirmacion,
    setMostrarConfirmacion,
    mostrarCampoCancelar,
    setMostrarCampoCancelar,
    motivoCancelacion,
    setMotivoCancelacion,
    totalNoches,
    totalPagar,
    gestionarLiberacion,
    gestionarCancelacion,
    // --- NUEVOS RETORNOS EXPUESTOS ---
    fechaIngreso,
    setFechaIngreso,
    fechaSalida,
    setFechaSalida,
    isSubmittingFechas,
    gestionarModificacionFechas,
  };
}
