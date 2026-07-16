import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  ReportReservation,
  ChartDataNode,
  OccupancyNode,
  FilterPeriod,
  ReservaCancelada,
} from "../types/reports";

const API_BASE_URL = "http://localhost:8080/api";
const INTERNAL_FILTER_PREFIX = "INTERNO:";
const MAINTENANCE_DOC = "00000000";

// Control exacto de fechas locales para evitar desfases UTC en el hotel
const getFechaLocalPeruFormat = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDates = () => {
  const hoy = new Date();
  const inicio = new Date();
  inicio.setDate(hoy.getDate() - 29); // Rango de 30 días sugerido

  return {
    defaultDesde: getFechaLocalPeruFormat(inicio),
    defaultHasta: getFechaLocalPeruFormat(hoy),
  };
};

export function useIncomeReports() {
  const [loading, setLoading] = useState<boolean>(true);
  const [reservas, setReservas] = useState<ReportReservation[]>([]);
  const [reservasTodas, setReservasTodas] = useState<ReportReservation[]>([]);
  const [habitacionesCount, setHabitacionesCount] = useState<number>(0);
  const [filtroDias, setFiltroDias] = useState<FilterPeriod>("diario");

  // Declaración formal de fechas para evitar el error de variables no definidas
  const { defaultDesde, defaultHasta } = getDefaultDates();
  const [fechaInicio, setFechaInicio] = useState<string>(defaultDesde);
  const [fechaFin, setFechaFin] = useState<string>(defaultHasta);

  // 1. 🛡️ Helper seguro para cálculo de noches basado en ISO local
  const calcularNochesSeguras = (ingreso: string, salida: string): number => {
    if (!ingreso || !salida) return 1;
    const dateIn = parseISO(ingreso.slice(0, 10));
    const dateOut = parseISO(salida.slice(0, 10));
    const noches = differenceInDays(dateOut, dateIn);
    return noches <= 0 ? 1 : noches;
  };

  // 2. 🔥 Fetch Centralizado con Basic Auth en Base64
  const cargarDatosEstadisticos = useCallback(
    async (desde: string, hasta: string) => {
      setLoading(true);
      const credentials = localStorage.getItem("auth_token");

      if (!credentials) {
        toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.");
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

        // Consultas simultáneas eficientes a MySQL
        const [resReservas, resHabitaciones] = await Promise.all([
          axios.get<ReportReservation[]>(`${API_BASE_URL}/reservas`, {
            ...configHeaders,
            params: { desde, hasta },
          }),
          axios.get(`${API_BASE_URL}/habitaciones`, configHeaders),
        ]);

        const dataReservas = Array.isArray(resReservas.data)
          ? resReservas.data
          : [];
        setReservas(dataReservas);
        setHabitacionesCount(
          Array.isArray(resHabitaciones.data) ? resHabitaciones.data.length : 0,
        );
      } catch (error) {
        console.error("Error financiero de reportes:", error);
        toast.error("Error al sincronizar métricas con el servidor");
        setReservas([]);
        setHabitacionesCount(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 3. 🔀 Carga paralela del catálogo completo de auditoría
  const fetchReservasTodas = useCallback(async () => {
    const credentials = localStorage.getItem("auth_token");
    if (!credentials) return;

    try {
      const tokenBase64 = btoa(credentials);
      const response = await axios.get<ReportReservation[]>(
        `${API_BASE_URL}/reservas`,
        {
          headers: {
            Authorization: `Basic ${tokenBase64}`,
            "Content-Type": "application/json",
          },
        },
      );
      setReservasTodas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.warn("Auditoría pasiva fallida:", err);
      setReservasTodas([]);
    }
  }, []);

  // 4. 🔄 Efecto de ciclo de vida ordenado (Ambas funciones ya existen en el scope superior)
  useEffect(() => {
    cargarDatosEstadisticos(fechaInicio, fechaFin);
    fetchReservasTodas();
  }, [cargarDatosEstadisticos, fetchReservasTodas, fechaInicio, fechaFin]);

  // 🎛️ 5. El disparador manual del botón de filtros
  const aplicarFiltros = () => {
    cargarDatosEstadisticos(fechaInicio, fechaFin);
  };

  // 6. 📊 Filtros Memorizados y calculados de forma segura
  const reservasCanceladas = useMemo<ReservaCancelada[]>(() => {
    return reservas
      .filter((r) => r?.estado === "CANCELADA")
      .map((r) => ({
        id: r.id,
        nombreCliente: r.nombreCliente,
        fechaSalida: r.fechaSalida,
        motivoCancelacion: r.motivoCancelacion || "Anulación sin especificar",
        precioHabitacion:
          r.costo ??
          calcularNochesSeguras(r.fechaIngreso, r.fechaSalida) *
            (r.habitacion?.precio ?? 0),
      }));
  }, [reservas]);

  const totalActivas = useMemo(
    () =>
      reservas.filter(
        (r) => r?.estado === "ACTIVA" && r.numeroDocumento !== MAINTENANCE_DOC,
      ).length,
    [reservas],
  );

  // 7. 📈 Datos de Ocupación Estructural
  const occupancyData = useMemo<OccupancyNode[]>(() => {
    const porcentajeOcupadas =
      habitacionesCount > 0
        ? Math.round((totalActivas / habitacionesCount) * 100)
        : 0;
    const porcentajeDisponibles = 100 - porcentajeOcupadas;
    return [
      { name: "Ocupadas", value: porcentajeOcupadas },
      { name: "Disponibles", value: porcentajeDisponibles },
    ];
  }, [habitacionesCount, totalActivas]);

  // 8. 🧹 Filtrado estricto anti-dinero ficticio y bloqueos de mantenimiento
  const reservasValidadasFinancieras = useMemo(() => {
    return reservas.filter(
      (r) =>
        r &&
        r.estado !== "MANTENIMIENTO" &&
        r.numeroDocumento !== MAINTENANCE_DOC &&
        // Condición corregida: Excluye de forma segura si el nombre empieza con "INTERNO:"
        !r.nombreCliente?.toUpperCase().startsWith("INTERNO"),
    );
  }, [reservas]);

  // 9. 📉 Generación del Data-Source para Gráficos Dinámicos
  const revenueData = useMemo<ChartDataNode[]>(() => {
    if (filtroDias === "diario") {
      return [...reservasValidadasFinancieras]
        .sort((a, b) => b.id - a.id)
        .slice(0, 7)
        .reverse()
        .map((r) => {
          const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
          const primerNombre = r.nombreCliente
            ? r.nombreCliente.split(" ")[0]
            : `RES-${r.id}`;
          return {
            name: primerNombre.toUpperCase(),
            // Prioriza el costo neto de BD, si es nulo calcula noches * precio
            ingresos:
              r.costo && r.costo > 0
                ? r.costo
                : noches * (r.habitacion?.precio || 0),
          };
        });
    }

    const esSemanal = filtroDias === "7";
    const etiquetas = esSemanal
      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      : ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];

    return etiquetas.map((etiqueta, index) => {
      const ingresosBloque = reservasValidadasFinancieras
        .filter((r) => {
          const fechaSalida = parseISO(r.fechaSalida.slice(0, 10));
          if (esSemanal) {
            let diaIndex = fechaSalida.getDay();
            diaIndex = diaIndex === 0 ? 6 : diaIndex - 1;
            return diaIndex === index;
          } else {
            const diaDelMes = fechaSalida.getDate();
            const semanaIndex = Math.min(Math.floor((diaDelMes - 1) / 7), 3);
            return semanaIndex === index;
          }
        })
        .reduce((sum, r) => {
          const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
          const montoReserva =
            r.costo && r.costo > 0
              ? r.costo
              : noches * (r.habitacion?.precio || 0);
          return sum + montoReserva;
        }, 0);

      return { name: etiqueta, ingresos: ingresosBloque };
    });
  }, [filtroDias, reservasValidadasFinancieras]);

  // 10. 💵 Suma Acumulada del Dashboard
  const totalIngresosAcumulados = useMemo(
    () => revenueData.reduce((sum, item) => sum + item.ingresos, 0),
    [revenueData],
  );

  // 11. 🧾 Exportación Segura a CSV
  const exportarExcelCSV = useCallback(() => {
    if (reservas.length === 0) {
      toast.warning("No se encontraron registros financieros en este bloque.");
      return;
    }

    const encabezados = [
      "ID Reserva",
      "Cliente",
      "Documento",
      "Check-In",
      "Check-Out",
      "Estado",
      "Monto Total (S/.)",
    ];
    const filasCSV = reservas
      .filter(
        (r) =>
          r.numeroDocumento !== MAINTENANCE_DOC && r.estado !== "MANTENIMIENTO",
      )
      .map((r) => {
        const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
        const totalMonto = r.costo ?? noches * (r.habitacion?.precio || 0);
        return [
          `RES-${r.id}`,
          `"${r.nombreCliente.replace(/"/g, '""')}"`,
          r.numeroDocumento,
          r.fechaIngreso,
          r.fechaSalida,
          r.estado,
          totalMonto.toFixed(2),
        ].join(",");
      });

    const contenidoCSV = [encabezados.join(","), ...filasCSV].join("\n");
    const blob = new Blob(["\uFEFF" + contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Reporte_Financiero_PlazaAndino_${filtroDias}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Reporte financiero exportado con éxito.");
  }, [reservas, filtroDias]);

  return {
    loading,
    totalIngresosAcumulados,
    porcentajeOcupadas: occupancyData?.[0]?.value ?? 0, // Acceso indexado seguro a Recharts
    occupancyData,
    revenueData,
    reservasCanceladas,
    filtroDias,
    setFiltroDias,
    fechaInicio,
    fechaFin,
    setFechaInicio,
    setFechaFin,
    exportarExcelCSV,
    reservasTodas,
    // 🛡️ Retornamos de forma directa el estado de reservas para poblar las tablas visuales
    reservasDetalle: reservas,
    aplicarFiltros,
  };
}
