package com.sipel.CES.repositories;

import com.sipel.CES.models.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Integer> {
    Optional<Material> findByCodigoMaterial(String codigoMaterial);
}
