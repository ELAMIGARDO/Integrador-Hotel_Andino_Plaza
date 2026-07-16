import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportReservation, ReservaCancelada } from "../types/reports";

// Configuración limpia de estilos corporativos para jsPDF
const tableStyles: any = {
  headStyles: {
    fillColor: new Array(30, 41, 59),
    textColor: new Array(255, 255, 255),
    fontStyle: "bold",
  },
  alternateRowStyles: {
    fillColor: new Array(248, 250, 252),
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
  doc.setTextColor(51, 65, 85);
};

// --- HELPER CONTABLE DE NOCHES LOCALES ---
const calcularNochesSeguras = (ingreso: string, salida: string): number => {
  if (!ingreso || !salida) return 1;
  const noches = Math.ceil((new Date(salida).getTime() - new Date(ingreso).getTime()) / (1000 * 60 * 60 * 24));
  return noches <= 0 ? 1 : noches;
};

// 🧾 A) EXPORTACIÓN DE BOLETA ÚNICA POR RESERVA (ACTUALIZADO CON NOCHES)
export const exportReservationBoleta = (reserva: ReportReservation) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawHeader(doc, `BOLETA DE RESERVA # ${reserva.id}`);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN GENERAL", 40, 110);
  doc.setDrawColor(226, 232, 240);
  doc.line(40, 116, 572, 116);

  doc.setFont("helvetica", "normal");
  doc.text(`Cliente:`, 40, 135); doc.text(`${reserva.nombreCliente || "-"}`, 160, 135);
  doc.text(`Documento:`, 40, 153); doc.text(`${`${reserva.tipoDocumento || ""} ${reserva.numeroDocumento || ""}`.trim() || "-"}`, 160, 153);
  doc.text(`Fecha de ingreso:`, 40, 171); doc.text(`${reserva.fechaIngreso}`, 160, 171);
  doc.text(`Fecha de salida:`, 40, 189); doc.text(`${reserva.fechaSalida}`, 160, 189);
  doc.text(`Estado:`, 40, 207); doc.text(`${reserva.estado || "-"}`, 160, 207);

  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DEL SERVICIO", 40, 240);
  doc.line(40, 246, 572, 246);

  // Calculamos las noches para inyectarlas en el desglose de la boleta impresa
  const noches = calcularNochesSeguras(reserva.fechaIngreso, reserva.fechaSalida);
  const precioUnitario = reserva.habitacion?.precio ?? 0;

  autoTable(doc as any, {
    startY: 260,
    head: [["Habitación", "Tipo", "Noches Hospedadas", "Precio / Noche", "Total Cobrado"]], // 🆕 Columnas reestructuradas
    body: [[
      reserva.habitacion?.numero || "-",
      reserva.habitacion?.tipo || "-",
      `${noches} ${noches === 1 ? 'noche' : 'noches'}`, // 🆕 Campo inyectado
      formatCurrency(precioUnitario), // 🆕 Tarifa base
      formatCurrency(
        reserva.costo && reserva.costo > 0 
          ? reserva.costo 
          : noches * precioUnitario
      )
    ]],
    ...tableStyles,
  });

  doc.save(`boleta_reserva_${reserva.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// 📊 B) EXPORTACIÓN DE REPORTES TABULARES COMPLETOS (ACTUALIZADO CON NOCHES)
export const handleExportPDF = (activeTab: string, tabLabel: string, reservasTodas: ReportReservation[], reservasCanceladas: ReservaCancelada[]) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawHeader(doc, `REPORTE: ${tabLabel.toUpperCase()}`);

  if (activeTab === "por-fechas" || activeTab === "ingresos-stock") {
    const bodyRows = reservasTodas.map((r) => {
      const noches = calcularNochesSeguras(r.fechaIngreso, r.fechaSalida);
      const precioUnitario = r.habitacion?.precio ?? 0;
      return [
        String(r.id),
        r.fechaIngreso,
        r.nombreCliente || "-",
        `Hab ${r.habitacion?.numero || "S/N"}`,
        `${noches} ${noches === 1 ? 'noche' : 'noches'}`, // 🆕 Columna inyectada
        formatCurrency(precioUnitario), // 🆕 Columna inyectada
        formatCurrency(r.costo && r.costo > 0 ? r.costo : noches * precioUnitario)
      ];
    });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Total registros auditados en rango: ${reservasTodas.length}`, 40, 110);
    
    autoTable(doc as any, {
      startY: 130,
      head: [["ID", "Check-In", "Cliente Huésped", "Habitación", "Noches", "Tarifa Base", "Monto Liquidado"]], // 🆕 Cabecera mapeada
      body: bodyRows,
      ...tableStyles,
    });
    doc.save(`reporte_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  if (activeTab === "cancelaciones") {
    autoTable(doc as any, {
      startY: 110,
      head: [["ID Reserva", "Cliente Pasajero", "Fecha de Salida", "Motivo de Anulación", "Pérdida (S/.)"]],
      body: reservasCanceladas.map((r) => [
        String(r.id),
        r.nombreCliente,
        r.fechaSalida || "-",
        r.motivoCancelacion || "Sin justificar",
        formatCurrency(r.precioHabitacion ?? 0),
      ]),
      ...tableStyles,
    });
    doc.save(`reporte_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }
};
