package com.hotelandinoplaza.sistemagestion.service;

import com.hotelandinoplaza.sistemagestion.dto.ReporteReservasIngresosDTO;
import com.hotelandinoplaza.sistemagestion.repository.HabitacionRepository;
import com.hotelandinoplaza.sistemagestion.repository.ReporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ReporteService {

    private final ReporteRepository reporteRepository;
    private final HabitacionRepository habitacionRepository;

    public ReporteReservasIngresosDTO obtenerResumenReservasIngresos(LocalDate fechaInicio, LocalDate fechaFin) {
        Double totalIngresos = reporteRepository.calcularIngresosTotales(fechaInicio, fechaFin);
        Long totalReservas = reporteRepository.contarReservasTotales(fechaInicio, fechaFin);
        List<?> reservasPorEstado = reporteRepository.contarReservasPorEstado(fechaInicio, fechaFin);
        List<?> ingresosPorTipo = reporteRepository.calcularIngresosPorTipo(fechaInicio, fechaFin);
        List<?> ingresosPorFecha = reporteRepository.calcularIngresosPorFecha(fechaInicio, fechaFin);
        List<?> reservasCanceladas = reporteRepository.buscarReservasCanceladas(fechaInicio, fechaFin);
        List<com.hotelandinoplaza.sistemagestion.dto.ReservaDetalleDTO> reservasDetalle = reporteRepository.buscarReservasDetalle(fechaInicio, fechaFin);

        Long habitacionesTotales = habitacionRepository.count();
        Long habitacionesOcupadas = reporteRepository.contarHabitacionesOcupadasHoy();

        Double porcentajeOcupacion = habitacionesTotales > 0 ? (habitacionesOcupadas.doubleValue() / habitacionesTotales) * 100.0 : 0.0;
        Double tarifaPromedioPorNoche = totalReservas > 0 ? totalIngresos / totalReservas : 0.0;

        return new ReporteReservasIngresosDTO(
                totalIngresos,
                totalReservas,
                habitacionesTotales,
                habitacionesOcupadas,
                porcentajeOcupacion,
                tarifaPromedioPorNoche,
                (List) reservasPorEstado,
                (List) ingresosPorTipo,
                (List) ingresosPorFecha,
            (List) reservasCanceladas,
            reservasDetalle
        );
    }
}
