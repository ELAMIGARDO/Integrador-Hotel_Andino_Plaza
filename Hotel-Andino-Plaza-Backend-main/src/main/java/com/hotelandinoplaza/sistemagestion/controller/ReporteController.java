package com.hotelandinoplaza.sistemagestion.controller;

import com.hotelandinoplaza.sistemagestion.dto.ReporteReservasIngresosDTO;
import com.hotelandinoplaza.sistemagestion.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/reservas-ingresos")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ReporteReservasIngresosDTO> obtenerReporteReservasIngresos(
            @RequestParam(value = "desde", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(value = "hasta", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin
    ) {
        ReporteReservasIngresosDTO reporte = reporteService.obtenerResumenReservasIngresos(fechaInicio, fechaFin);
        return ResponseEntity.ok(reporte);
    }
}
