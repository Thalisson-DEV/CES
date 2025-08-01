package com.sipel.CES.controllers;

import com.sipel.CES.DTOs.MaterialDTO;
import com.sipel.CES.models.Material;
import com.sipel.CES.repositories.MaterialRepository;
import com.sipel.CES.services.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/material")
public class MaterialController {

    @Autowired
    private MaterialService service;

    @GetMapping
    public ResponseEntity getAllMaterials() {
        return ResponseEntity.ok(service.getAllMaterials());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDENADOR') or hasRole('ADMINISTRADOR')")
    public ResponseEntity deleteMaterial(@PathVariable(value = "id") Integer id) {
        service.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDENADOR') or hasRole('ADMINISTRADOR')")
    public ResponseEntity createMaterial(@RequestBody MaterialDTO data) {
        service.createMaterial(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDENADOR') or hasRole('ADMINISTRADOR')")
    public ResponseEntity updateMaterial(@PathVariable(value = "id") Integer id, @RequestBody MaterialDTO data) {
        service.updateMaterial(id, data);
        return ResponseEntity.ok().build();
    }
}
