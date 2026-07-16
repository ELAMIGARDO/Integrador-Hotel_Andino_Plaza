package com.hotelandinoplaza.sistemagestion.controller;

import com.hotelandinoplaza.sistemagestion.entity.Habitacion;
import com.hotelandinoplaza.sistemagestion.service.HabitacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HabitacionController {
    private final HabitacionService habitacionService;

    // 1. Obtener todas las habitaciones del hotel (Ajustado para retornar TODO el catálogo)
    // El frontend se encargará de ocultar del Gantt las que tengan activo = false y mostrarlas en el modal
    @GetMapping
    public ResponseEntity<List<Habitacion>> obtenerTodas() {
        List<Habitacion> habitaciones = habitacionService.listarTodas(); // Asegúrate de que este método en tu service haga un repository.findAll() completo
        return new ResponseEntity<>(habitaciones, HttpStatus.OK);
    }

    // 2. Buscar una habitación específica por su ID
    @GetMapping("{id}")
    public ResponseEntity<Habitacion> obtenerPorId(@PathVariable Long id) {
        Habitacion habitacion = habitacionService.buscarPorId(id);
        return new ResponseEntity<>(habitacion, HttpStatus.OK);
    }

    // 3. Crear una nueva habitación (BLINDAJE ANTE VALORES NULOS)
    @PostMapping
    public ResponseEntity<Habitacion> crear(@RequestBody Habitacion habitacion) {
        if (habitacion.getActivo() == null) {
            habitacion.setActivo(true); 
        }
        Habitacion nuevaHabitacion = habitacionService.guardar(habitacion);
        return new ResponseEntity<>(nuevaHabitacion, HttpStatus.CREATED);
    }

    // 4. Actualizar una habitación existente (SOPORTA DESACTIVACIÓN Y REACTIVACIÓN EN CALIENTE)
    @PutMapping("{id}")
    public ResponseEntity<Habitacion> actualizar(@PathVariable Long id, @RequestBody Habitacion habitacion) {
        Habitacion habitacionExistente = habitacionService.buscarPorId(id); 

        if (habitacionExistente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Si un campo llega nulo desde el frontend, le inyectamos su valor actual de la BD
        if (habitacion.getNumero() == null) {
            habitacion.setNumero(habitacionExistente.getNumero());
        }
        if (habitacion.getTipo() == null) {
            habitacion.setTipo(habitacionExistente.getTipo());
        }
        if (habitacion.getPrecio() == null) {
            habitacion.setPrecio(habitacionExistente.getPrecio());
        }
        if (habitacion.getDisponible() == null) {
            habitacion.setDisponible(habitacionExistente.getDisponible()); 
        }
        
        // 🔥 AJUSTE CRÍTICO: Si el frontend envía explícitamente el campo 'activo' (sea true o false),
        // respetamos el valor enviado para permitir que el Borrado Lógico o la Reactivación surtan efecto.
        if (habitacion.getActivo() == null) {
            habitacion.setActivo(habitacionExistente.getActivo());
        }

        habitacion.setId(id); 
        Habitacion habitacionActualizada = habitacionService.guardar(habitacion);
        return new ResponseEntity<>(habitacionActualizada, HttpStatus.OK);
    }

    // 5. Eliminar una habitación por ID (Usa el borrado híbrido automático del Service)
    @DeleteMapping("{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        habitacionService.eliminar(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
