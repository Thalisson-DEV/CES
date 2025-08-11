package com.sipel.CES.comercial.controller;

import com.sipel.CES.comercial.DTOs.SolicitacaoComercialDTO;
import com.sipel.CES.comercial.DTOs.SolicitacaoComercialResponseDTO;
import com.sipel.CES.comercial.repository.SolicitacaoComercialRepository;
import com.sipel.CES.comercial.service.SolicitacaoComercialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/solicitacoes-comercial")
class SolicitacaoComercialController {

    @Autowired
    SolicitacaoComercialService service;

    @GetMapping
    public ResponseEntity<Page<SolicitacaoComercialResponseDTO>> getAllSolicitacoesComerciais(
            @RequestParam(required = false) Integer equipeId,
            @RequestParam(required = false) Long solicitanteId,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer processoId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<SolicitacaoComercialResponseDTO> solicitacoes = service.getAllSolicitacoes(equipeId, solicitanteId, statusId, processoId, searchTerm, pageable);
        return ResponseEntity.ok(solicitacoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitacaoComercialResponseDTO> getSolicitacaoById(@RequestParam(value = "id") Integer id) {
        try {
            SolicitacaoComercialResponseDTO solicitacao = service.getSolicitacaoById(id);
            return ResponseEntity.ok(solicitacao);
        } catch (Exception e) {
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SolicitacaoComercialResponseDTO> updateSolicitacao(@PathVariable(value = "id") Integer id, @RequestBody SolicitacaoComercialDTO data) {
        try {
            SolicitacaoComercialResponseDTO solicitacao = service.updateSolicitacao(id, data);
            return ResponseEntity.ok(solicitacao);
        } catch (Exception e) {
            throw e;
        }
    }

}
