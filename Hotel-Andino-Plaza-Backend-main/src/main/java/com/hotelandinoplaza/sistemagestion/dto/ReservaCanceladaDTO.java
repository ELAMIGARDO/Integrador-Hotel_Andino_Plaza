package com.hotelandinoplaza.sistemagestion.dto;

import java.time.LocalDate;

public interface ReservaCanceladaDTO {
    Long getId();
    String getNombreCliente();
    LocalDate getFechaSalida();
    String getMotivoCancelacion();
    Double getPrecioHabitacion();
}
