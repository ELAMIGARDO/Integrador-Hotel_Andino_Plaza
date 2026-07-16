package com.hotelandinoplaza.sistemagestion.service;

import com.hotelandinoplaza.sistemagestion.entity.Habitacion;
import com.hotelandinoplaza.sistemagestion.repository.HabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.lang.module.ResolutionException;
import java.util.List;

@RequiredArgsConstructor
@Service
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;

    // 🌟 CORREGIDO: Cambiamos findByActivoTrue() por findAll() para traer todo el catálogo
    // Esto permite que el frontend pueda conocer cuáles están ocultas y listarlas en tu modal
    public List<Habitacion> listarTodas() {
        return habitacionRepository.findAll();
    }

    public Habitacion guardar(Habitacion habitacion) {
        return habitacionRepository.save(habitacion);
    }

    public Habitacion buscarPorId(Long id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() -> new ResolutionException("La habitación con ID " + id + " no existe."));
    }

    @Transactional
    public void eliminar(Long id) {
        Habitacion habitacion = buscarPorId(id); // Valida si existe

        try {
            // Intenta la eliminación FÍSICA primero (Lo que quiere tu profesor)
            habitacionRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Si SQL lanza el error de llaves foráneas (porque tiene reservas),
            // el sistema se defiende y aplica la eliminación LÓGICA automáticamente.
            habitacion.setActivo(false);
            habitacionRepository.save(habitacion);
        }
    }
}
