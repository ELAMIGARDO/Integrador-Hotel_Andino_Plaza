package com.hotelandinoplaza.sistemagestion.repository;

import com.hotelandinoplaza.sistemagestion.entity.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    
    // Forzamos una query nativa limpia para traer activas e inactivas al catálogo completo del frontend
    @Query(value = "SELECT * FROM habitaciones", nativeQuery = true)
    List<Habitacion> findAllCompleto();
}