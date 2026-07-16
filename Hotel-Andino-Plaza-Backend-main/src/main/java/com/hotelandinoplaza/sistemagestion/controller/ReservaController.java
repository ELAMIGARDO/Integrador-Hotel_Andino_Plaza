package com.hotelandinoplaza.sistemagestion.controller;

import com.hotelandinoplaza.sistemagestion.entity.Reserva;
import com.hotelandinoplaza.sistemagestion.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor 
public class ReservaController {

    private final ReservaService reservaService; 
    private final SimpMessagingTemplate messagingTemplate;

    // 1. Obtener todas las reservas
    @GetMapping
    public ResponseEntity<List<Reserva>> obtenerTodas() {
        List<Reserva> reservas = reservaService.listarTodas();
        return new ResponseEntity<>(reservas, HttpStatus.OK);
    }

    // 2. Buscar una reserva por ID
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> obtenerPorId(@PathVariable Long id) {
        Reserva reserva = reservaService.buscarPorId(id);
        return new ResponseEntity<>(reserva, HttpStatus.OK);
    }

    // 3. Crear una nueva reserva (CORREGIDO PARA INTERCEPTAR ERRORES Y ADMITIR MANTENIMIENTO)
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Reserva reserva) {
        if (reserva.getEstado() == null || reserva.getEstado().isEmpty()) {
            reserva.setEstado("ACTIVA");
        }

        try {
            Reserva nuevaReserva = reservaService.guardar(reserva);
            messagingTemplate.convertAndSend("/topic/disponibilidad", "UPDATE_RESERVA");
            return new ResponseEntity<>(nuevaReserva, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // 4. Finalizar / Liberar habitación
    @PutMapping("/{id}/finalizar")
    public ResponseEntity<String> finalizar(@PathVariable Long id, @RequestBody(required = false) String body) {
        try {
            reservaService.finalizarReserva(id);
            messagingTemplate.convertAndSend("/topic/disponibilidad", "UPDATE_RESERVA");
            return ResponseEntity.ok().body("Habitación liberada con éxito y reserva archivada.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. Eliminar una reserva por completo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long id) {
        reservaService.eliminar(id);
        messagingTemplate.convertAndSend("/topic/disponibilidad", "UPDATE_RESERVA");
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // 📊 6. ENDPOINT DASHBOARD: Expone las ganancias reales para consumirlas desde React
    @GetMapping("/ganancias")
    public ResponseEntity<Double> obtenerGananciasReales() {
        Double total = reservaService.obtenerTotalIngresos();
        return new ResponseEntity<>(total, HttpStatus.OK);
    }

    // 7. Cancelar Reserva
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<String> cancelar(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String motivoLimpio = body.get("motivo");
        reservaService.cancelarReserva(id, motivoLimpio);
        messagingTemplate.convertAndSend("/topic/disponibilidad", "UPDATE_RESERVA");
        return ResponseEntity.ok().body("Reserva cancelada con éxito.");
    }

    // 🌟 8. NUEVO ENDPOINT: Modificar Fechas de Hospedaje en Tiempo Real
    // Recibe el JSON con las fechas corregidas y valida que no rompan colisiones en MySQL
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id, @RequestBody Reserva datosActualizados) {
        Reserva reservaExistente = reservaService.buscarPorId(id);
        if (reservaExistente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La reserva solicitada no existe.");
        }

        // Modificamos únicamente los rangos de tiempo solicitados desde el modal de React
        reservaExistente.setFechaIngreso(datosActualizados.getFechaIngreso());
        reservaExistente.setFechaSalida(datosActualizados.getFechaSalida());

        try {
            // Reutiliza las salvaguardas y validaciones matemáticas que ya programaste en tu Service
            Reserva actualizada = reservaService.guardar(reservaExistente);

            // 🔥 SPREAD EN TIEMPO REAL: Notifica al Gantt y Dashboard de React para estirar/encoger los bloques al segundo
            messagingTemplate.convertAndSend("/topic/disponibilidad", "UPDATE_RESERVA");

            return ResponseEntity.ok(actualizada);
        } catch (IllegalArgumentException e) {
            // Captura si el Service detecta que las nuevas fechas chocan con otra reserva existente
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
