package com.sipel.CES.choreCadastros.coordenador.controller;

import com.sipel.CES.choreCadastros.coordenador.DTOs.CoordenadorDTO;
import com.sipel.CES.choreCadastros.coordenador.DTOs.CoordenadorResponseDTO;
import com.sipel.CES.choreCadastros.coordenador.service.CoordenadorService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coordenadores")
public class CoordenadorController {

    @Autowired
    private CoordenadorService service;

    @PostMapping
    public ResponseEntity<?> createCoordenador(@RequestBody CoordenadorDTO data) {
        try {
            CoordenadorResponseDTO response = service.createCoordenador(data);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<CoordenadorResponseDTO>> getAllCoordenadores(
            @RequestParam(required = false) Integer coordenadorId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<CoordenadorResponseDTO> coordenadores = service.getAllCoordenadores(coordenadorId, searchTerm, pageable);
        return ResponseEntity.ok(coordenadores);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoordenador(@PathVariable(value = "id") Integer id, @RequestBody CoordenadorDTO data) {
        try {
            CoordenadorResponseDTO response = service.updateCoordenador(id, data);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoordenador(@PathVariable(value = "id") Integer id) {
        try {
            service.deleteCoordenador(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
