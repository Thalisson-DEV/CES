package com.sipel.CES.comercial.notas.controller;

import com.sipel.CES.comercial.notas.DTOs.NotaCompletaDTO;
import com.sipel.CES.comercial.notas.DTOs.NotaResponseDTO;
import com.sipel.CES.comercial.notas.services.NotasService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notas")
public class NotasController {

    @Autowired
    private NotasService notaService;

    @PostMapping
    public ResponseEntity<?> createNotaCompleta(@RequestBody NotaCompletaDTO data) {
        try {
            NotaResponseDTO response = notaService.createNotaCompleta(data);
            return ResponseEntity.status(201).body(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<NotaResponseDTO>> getAllNotasCompletas(
            @RequestParam(required = false) Integer tipoNotaId,
            @RequestParam(required = false) Integer equipeId,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) Integer baseId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable
    ) {
        Page<NotaResponseDTO> notas = notaService.getAllNotasCompletas(tipoNotaId, equipeId, usuarioId, baseId, searchTerm, pageable);
        return ResponseEntity.ok(notas);
    }
}
