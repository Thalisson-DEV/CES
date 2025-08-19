package com.sipel.CES.choreCadastros.contrato;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contratos")
public class ContratoController {
    @Autowired
    private ContratoService service;

    @GetMapping
    public ResponseEntity<Page<ContratoResponseDTO>> getAllContratos(
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<ContratoResponseDTO> contratos = service.getAllContratos(searchTerm, pageable);
        return ResponseEntity.ok(contratos);
    }

    @PostMapping
    public ResponseEntity<?> createContrato(@RequestBody ContratoDTO data) {
        try {
            ContratoResponseDTO contrato = service.createContrato(data);
            return ResponseEntity.status(201).body(contrato);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratoResponseDTO> updateContrato(@PathVariable(value = "id") Integer id, @RequestBody ContratoDTO data) {
        try {
            ContratoResponseDTO contrato = service.updateContrato(id, data);
            return ResponseEntity.ok(contrato);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratoResponseDTO> getContratoById(@PathVariable(value = "id") Integer id) {
        try {
            ContratoResponseDTO contrato = service.getContratoById(id);
            return ResponseEntity.ok(contrato);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
