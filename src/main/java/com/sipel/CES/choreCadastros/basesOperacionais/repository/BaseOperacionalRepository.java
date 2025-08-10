package com.sipel.CES.choreCadastros.basesOperacionais.repository;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BaseOperacionalRepository extends JpaRepository <BaseOperacional, Integer> {
    Optional<BaseOperacional> findByNomeBase(String nomeBase);
}
