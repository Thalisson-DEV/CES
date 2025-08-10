package com.sipel.CES.choreCadastros.coordenador.controller;

import com.sipel.CES.choreCadastros.coordenador.DTOs.CoordenadorResponseDTO;
import com.sipel.CES.choreCadastros.coordenador.service.CoordenadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coordenadores")
public class CoordenadorController {

    @Autowired
    private CoordenadorService service;

    @GetMapping()
    public ResponseEntity<List<CoordenadorResponseDTO>> getAllCoordenadoresList() {
        List<CoordenadorResponseDTO> coordenadores = service.getAllCoordenadoresList();
        return ResponseEntity.ok(coordenadores);
    }
}
