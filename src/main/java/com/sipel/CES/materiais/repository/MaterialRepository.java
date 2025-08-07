package com.sipel.CES.materiais.repository;

import com.sipel.CES.materiais.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Integer> {
    Optional<Material> findByCodigoMaterial(String codigoMaterial);
}
