package com.hotelandinoplaza.sistemagestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservaDetalleDTO {
    private Long id;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombreCliente;
    private LocalDate fechaIngreso;
    private LocalDate fechaSalida;
    private LocalDate fechaEmision;
    private String estado;
    private String motivoCancelacion;
    private Long habitacionId;
    private String habitacionNumero;
    private String habitacionTipo;
    private Double habitacionPrecio;
    private Double costo;
}
