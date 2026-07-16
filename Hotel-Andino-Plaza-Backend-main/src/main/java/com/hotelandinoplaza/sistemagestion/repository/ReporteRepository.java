package com.hotelandinoplaza.sistemagestion.repository;

import com.hotelandinoplaza.sistemagestion.dto.EstadoReservaDTO;
import com.hotelandinoplaza.sistemagestion.dto.IngresoPorFechaDTO;
import com.hotelandinoplaza.sistemagestion.dto.IngresoPorTipoDTO;
import com.hotelandinoplaza.sistemagestion.dto.ReservaCanceladaDTO;
import com.hotelandinoplaza.sistemagestion.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reserva, Long> {

    @Query("SELECT COALESCE(SUM(CASE WHEN DATEDIFF(r.fechaSalida, r.fechaIngreso) > 0 " +
            "THEN DATEDIFF(r.fechaSalida, r.fechaIngreso) ELSE 1 END * r.habitacion.precio), 0) " +
            "FROM Reserva r " +
            "WHERE r.estado = 'FINALIZADA' " +
            "AND r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR r.fechaIngreso >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR r.fechaSalida <= :fechaFin)")
    Double calcularIngresosTotales(@Param("fechaInicio") LocalDate fechaInicio,
                                   @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT COUNT(r) FROM Reserva r " +
            "WHERE r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR r.fechaIngreso >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR r.fechaSalida <= :fechaFin)")
    Long contarReservasTotales(@Param("fechaInicio") LocalDate fechaInicio,
                               @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT r.estado AS estado, COUNT(r) AS cantidad " +
            "FROM Reserva r " +
            "WHERE r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR r.fechaIngreso >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR r.fechaSalida <= :fechaFin) " +
            "GROUP BY r.estado")
    List<EstadoReservaDTO> contarReservasPorEstado(@Param("fechaInicio") LocalDate fechaInicio,
                                                   @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT r.habitacion.tipo AS tipo, COALESCE(SUM(CASE WHEN DATEDIFF(r.fechaSalida, r.fechaIngreso) > 0 " +
            "THEN DATEDIFF(r.fechaSalida, r.fechaIngreso) ELSE 1 END * r.habitacion.precio), 0) AS ingresos, COUNT(r) AS reservas " +
            "FROM Reserva r " +
            "WHERE r.estado = 'FINALIZADA' " +
            "AND r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR r.fechaIngreso >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR r.fechaSalida <= :fechaFin) " +
            "GROUP BY r.habitacion.tipo")
    List<IngresoPorTipoDTO> calcularIngresosPorTipo(@Param("fechaInicio") LocalDate fechaInicio,
                                                    @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT FUNCTION('DATE_FORMAT', r.fechaIngreso, '%Y-%m-%d') AS fecha, " +
            "COALESCE(SUM(CASE WHEN DATEDIFF(r.fechaSalida, r.fechaIngreso) > 0 " +
            "THEN DATEDIFF(r.fechaSalida, r.fechaIngreso) ELSE 1 END * r.habitacion.precio), 0) AS ingresos " +
            "FROM Reserva r " +
            "WHERE r.estado = 'FINALIZADA' " +
            "AND r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR r.fechaIngreso >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR r.fechaSalida <= :fechaFin) " +
            "GROUP BY FUNCTION('DATE_FORMAT', r.fechaIngreso, '%Y-%m-%d') " +
            "ORDER BY FUNCTION('DATE_FORMAT', r.fechaIngreso, '%Y-%m-%d')")
    List<IngresoPorFechaDTO> calcularIngresosPorFecha(@Param("fechaInicio") LocalDate fechaInicio,
                                                      @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT COUNT(DISTINCT r.habitacion.id) FROM Reserva r " +
            "WHERE r.numeroDocumento != '00000000' " +
            "AND r.estado NOT IN ('CANCELADA') " +
            "AND CURRENT_DATE() BETWEEN r.fechaIngreso AND r.fechaSalida")
    Long contarHabitacionesOcupadasHoy();

    @Query("SELECT r.id AS id, r.nombreCliente AS nombreCliente, r.fechaSalida AS fechaSalida, r.motivoCancelacion AS motivoCancelacion, r.habitacion.precio AS precioHabitacion " +
            "FROM Reserva r " +
            "WHERE r.estado = 'CANCELADA' " +
            "AND r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR r.fechaIngreso >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR r.fechaSalida <= :fechaFin)")
    List<ReservaCanceladaDTO> buscarReservasCanceladas(@Param("fechaInicio") LocalDate fechaInicio,
                                                        @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT new com.hotelandinoplaza.sistemagestion.dto.ReservaDetalleDTO(" +
            "r.id, r.tipoDocumento, r.numeroDocumento, r.nombreCliente, r.fechaIngreso, r.fechaSalida, r.fechaEmision, r.estado, r.motivoCancelacion, " +
            "r.habitacion.id, r.habitacion.numero, r.habitacion.tipo, r.habitacion.precio, " +
            "(CASE WHEN DATEDIFF(r.fechaSalida, r.fechaIngreso) > 0 " +
            "THEN DATEDIFF(r.fechaSalida, r.fechaIngreso) ELSE 1 END * r.habitacion.precio)) " +
            "FROM Reserva r " +
            "WHERE r.numeroDocumento != '00000000' " +
            "AND (:fechaInicio IS NULL OR COALESCE(r.fechaEmision, r.fechaIngreso) >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR COALESCE(r.fechaEmision, r.fechaSalida) <= :fechaFin) " +
            "ORDER BY r.fechaEmision")
    List<com.hotelandinoplaza.sistemagestion.dto.ReservaDetalleDTO> buscarReservasDetalle(@Param("fechaInicio") LocalDate fechaInicio,
                                                                                         @Param("fechaFin") LocalDate fechaFin);
}
