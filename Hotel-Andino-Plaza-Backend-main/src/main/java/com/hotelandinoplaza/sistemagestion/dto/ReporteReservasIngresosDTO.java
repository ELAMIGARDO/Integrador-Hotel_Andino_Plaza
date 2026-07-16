package com.hotelandinoplaza.sistemagestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReporteReservasIngresosDTO {
    private Double totalIngresos;
    private Long totalReservas;
    private Long habitacionesTotales;
    private Long habitacionesOcupadas;
    private Double porcentajeOcupacion;
    private Double tarifaPromedioPorNoche;
    private List<EstadoReservaDTO> reservasPorEstado;
    private List<IngresoPorTipoDTO> ingresosPorTipo;
    private List<IngresoPorFechaDTO> ingresosPorFecha;
    private List<ReservaCanceladaDTO> reservasCanceladas;
    private List<com.hotelandinoplaza.sistemagestion.dto.ReservaDetalleDTO> reservasDetalle;
}
