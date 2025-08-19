package com.sipel.CES.choreCadastros.contrato;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContratoRepository extends JpaRepository<Contrato, Integer> {
    Optional<Contrato> findByNumeroContrato(String numeroContrato);
}
