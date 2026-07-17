// reports/services/reportExportService.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportReservation, ReservaCancelada } from "../types/reports";

// Configuración limpia de estilos corporativos con strings hexadecimales
const tableStyles: any = {
  headStyles: {
    fillColor: "#1e293b",
    textColor: "#ffffff",
    fontStyle: "bold",
  },
  alternateRowStyles: {
    fillColor: "#f8fafc",
  },
  styles: {
    fontSize: 9,
    cellPadding: 5,
  },
};

const formatCurrency = (value: number) => `S/. ${value.toFixed(2)}`;

// --- DISEÑO DE ENCABEZADO CORPORATIVO EN LÍNEA ---
const drawHeader = (doc: jsPDF, subtitle: string) => {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 612, 75, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("HOTEL ANDINO PLAZA", 40, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitle, 40, 52);

  doc.setFontSize(8);
  doc.text(`Impreso: ${new Date().toLocaleDateString()}`, 572, 52, {
    align: "right",
  });
};

// --- HELPER CONTABLE DE NOCHES LOCALES ---
const calcularNochesSeguras = (ingreso: string, salida: string): number => {
  if (!ingreso || !salida) return 1;
  const noches = Math.ceil(
    (new Date(salida).getTime() - new Date(ingreso).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return noches <= 0 ? 1 : noches;
};

// 🧾 A) EXPORTACIÓN DE BOLETA ÚNICA POR RESERVA
export const exportReservationBoleta = (reserva: ReportReservation) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawHeader(doc, `BOLETA DE RESERVA # ${reserva.id}`);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN GENERAL", 40, 110);
  doc.setDrawColor(226, 232, 240);
  doc.line(40, 116, 572, 116);

  doc.setFont("helvetica", "normal");
  doc.setTextColor("#1e293b");
  doc.text(`Cliente:`, 40, 135);
  doc.text(`${reserva.nombreCliente || "-"}`, 160, 135);
  doc.text(`Documento:`, 40, 153);
  doc.text(
    `${`${reserva.tipoDocumento || ""} ${reserva.numeroDocumento || ""}`.trim() || "-"}`,
    160,
    153,
  );
  doc.text(`Fecha de ingreso:`, 40, 171);
  doc.text(`${reserva.fechaIngreso}`, 160, 171);
  doc.text(`Fecha de salida:`, 40, 189);
  doc.text(`${reserva.fechaSalida}`, 160, 189);
  doc.text(`Estado:`, 40, 207);
  doc.text(`${reserva.estado || "-"}`, 160, 207);

  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DEL SERVICIO", 40, 240);
  doc.line(40, 246, 572, 246);

  const noches = calcularNochesSeguras(
    reserva.fechaIngreso,
    reserva.fechaSalida,
  );
  const precioUnitario = reserva.habitacion?.precio ?? 0;

  autoTable(doc as any, {
    startY: 260,
    head: [
      [
        "Habitación",
        "Tipo",
        "Noches Hospedadas",
        "Precio / Noche",
        "Total Cobrado",
      ],
    ],
    body: [
      [
        reserva.habitacion?.numero || "-",
        reserva.habitacion?.tipo || "-",
        `${noches} ${noches === 1 ? "noche" : "noches"}`,
        formatCurrency(precioUnitario),
        formatCurrency(
          reserva.costo && reserva.costo > 0
            ? reserva.costo
            : noches * precioUnitario,
        ),
      ],
    ],
    ...tableStyles,
  });

  doc.save(
    `boleta_reserva_${reserva.id}_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
};

// 📊 B) EXPORTACIÓN DE REPORTES TABULARES COMPLETOS (CON TOTALES)
export const handleExportPDF = (
  activeTab: string,
  tabLabel: string,
  reservasTodas: ReportReservation[],
  reservasCanceladas: ReservaCancelada[],
) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawHeader(doc, `REPORTE: ${tabLabel.toUpperCase()}`);

  if (
    activeTab === "ventas-control" || // 👈 AGREGADO: Permite descargar en la pestaña principal
    activeTab === "registros-eliminados" || // 👈 AGREGADO: Permite descargar las cancelaciones
    activeTab === "por-fechas" ||
    activeTab === "ingresos-stock" ||
    activeTab === "max-min-medio" ||
    activeTab === "indicadores"
  ) {
    const preciosArray = reservasTodas
      .map((r) => {
        if (r.estado === "CANCELADA") return 0; // Ignorar canceladas en la suma

        const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
        const precioPorNoche = r.habitacion?.precio ?? 0;
        return r.costo && r.costo > 0 ? r.costo : noches * precioPorNoche;
      })
      .filter((precio) => precio > 0);

    const kpiMax = preciosArray.length > 0 ? Math.max(...preciosArray) : 0;
    const kpiMin = preciosArray.length > 0 ? Math.min(...preciosArray) : 0;
    const kpiAvg =
      preciosArray.length > 0
        ? preciosArray.reduce((a, b) => a + b, 0) / preciosArray.length
        : 0;
    const sumatoriaTotalGeneral = preciosArray.reduce(
      (acc, curr) => acc + curr,
      0,
    );

    let startTableY = 130;

    if (activeTab === "max-min-medio") {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#0f172a");
      doc.text("BALANCES Y CONTABILIDAD DE INDICADORES", 40, 105);
      doc.setDrawColor(226, 232, 240);
      doc.line(40, 110, 572, 110);

      autoTable(doc as any, {
        startY: 120,
        head: [["Métrica Financiera", "Monto Liquidado Auditado"]],
        body: [
          ["Máximo Ingreso Diario Registrado", formatCurrency(kpiMax)],
          ["Mínimo Ingreso Diario Registrado", formatCurrency(kpiMin)],
          ["Promedio de Ingreso Diario General", formatCurrency(kpiAvg)],
        ],
        ...tableStyles,
      });

      startTableY = (doc as any).lastAutoTable.finalY + 30;
    }

    const bodyRows: any[] = reservasTodas.map((r) => {
      const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
      const precioUnitario = r.habitacion?.precio ?? 0;
      const totalFila =
        r.costo && r.costo > 0 ? r.costo : noches * precioUnitario;

      return [
        String(r.id),
        r.fechaIngreso,
        r.nombreCliente || "-",
        `Hab ${r.habitacion?.numero || "S/N"} (${r.habitacion?.tipo || "-"})`,
        `${noches} ${noches === 1 ? "noche" : "noches"}`,
        formatCurrency(precioUnitario),
        formatCurrency(totalFila),
      ];
    });

    const footRow = [
      {
        content: "TOTAL GENERAL LIQUIDADO EN CAJA",
        colSpan: 6,
        styles: { halign: "right", fontStyle: "bold" },
      },
      {
        content: formatCurrency(sumatoriaTotalGeneral),
        styles: { fontStyle: "bold" },
      },
    ];

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#0f172a");
    doc.text(
      `Detalle de auditoría contable — Registros: ${reservasTodas.length}`,
      40,
      startTableY - 15,
    );

    autoTable(doc as any, {
      startY: startTableY,
      head: [
        [
          "ID",
          "Check-In",
          "Cliente Huésped",
          "Habitación",
          "Noches",
          "Tarifa Base",
          "Monto Liquidado",
        ],
      ],
      body: bodyRows,
      foot: [footRow],
      footStyles: {
        fillColor: "#0f172a",
        textColor: "#ffffff",
        fontSize: 9,
      },
      ...tableStyles,
    });

    doc.save(
      `reporte_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    return;
  }

  if (activeTab === "cancelaciones") {
    const totalPerdidas = reservasCanceladas.reduce(
      (acc, curr) => acc + (curr.precioHabitacion ?? 0),
      0,
    );

    const bodyRows = reservasCanceladas.map((r) => [
      String(r.id),
      r.nombreCliente,
      r.fechaSalida || "-",
      r.motivoCancelacion || "Sin justificar",
      formatCurrency(r.precioHabitacion ?? 0),
    ]);

    const footRow = [
      {
        content: "TOTAL DE PÉRDIDAS ACUMULADAS",
        colSpan: 4,
        styles: { halign: "right", fontStyle: "bold" },
      },
      { content: formatCurrency(totalPerdidas), styles: { fontStyle: "bold" } },
    ];

    autoTable(doc as any, {
      startY: 110,
      head: [
        [
          "ID Reserva",
          "Cliente Pasajero",
          "Fecha de Salida",
          "Motivo de Anulación",
          "Pérdida (S/.)",
        ],
      ],
      body: bodyRows,
      foot: [footRow],
      footStyles: {
        fillColor: "#0f172a",
        textColor: "#ffffff",
        fontSize: 9,
      },
      ...tableStyles,
    });
    doc.save(
      `reporte_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    return;
  }
};
