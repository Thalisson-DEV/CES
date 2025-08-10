package com.sipel.CES.choreCadastros.processos.repository;

import com.sipel.CES.choreCadastros.processos.entity.Processos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcessoRepository extends JpaRepository<Processos, Integer> {

    Optional<Processos> findByNomeProcesso(String nomeProcesso);
}
