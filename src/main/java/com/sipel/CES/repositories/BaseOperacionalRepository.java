package com.sipel.CES.repositories;

import com.sipel.CES.models.BaseOperacional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BaseOperacionalRepository extends JpaRepository <BaseOperacional, Integer> {
    Optional<BaseOperacional> findByNomeBase(String nomeBase);
}
