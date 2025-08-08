package com.sipel.CES.materiais.controller;

import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.materiais.DTOs.MaterialDTO;
import com.sipel.CES.materiais.DTOs.MaterialResponseDTO;
import com.sipel.CES.materiais.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/material")
public class MaterialController {

    @Autowired
    private MaterialService service;
    @Autowired
    private MaterialService materialService;

    @GetMapping
    public ResponseEntity<Page<MaterialResponseDTO>> getAllMateriais(
            @RequestParam(required = false) String suprMatr,
            @RequestParam(required = false) String avaliacao,
            @RequestParam(required = false) String centro,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<MaterialResponseDTO> materiais = materialService.getAllMaterials(suprMatr, avaliacao, centro, searchTerm, pageable);
        return ResponseEntity.ok(materiais);
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

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity<ImportacaoResponseDTO> importMateriais(@RequestParam("file") MultipartFile file) {
        try {
            ImportacaoResponseDTO resultado = materialService.importarMateriais(file);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();

            String mensagemErro = "Erro ao processar o arquivo: ";
            if (e.getMessage().contains("formato") || e.getMessage().contains("inválido")) {
                mensagemErro = "O arquivo está em formato inválido. Por favor, utilize o modelo correto.";
            } else if (e.getMessage().contains("vazio")) {
                mensagemErro = "O arquivo enviado está vazio. Por favor, verifique e tente novamente.";
            } else {
                mensagemErro += e.getMessage();
            }
            return ResponseEntity.badRequest().body(new ImportacaoResponseDTO(0, 0, List.of(mensagemErro)));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDENADOR') or hasRole('ADMINISTRADOR')")
    public ResponseEntity updateMaterial(@PathVariable(value = "id") Integer id, @RequestBody MaterialDTO data) {
        service.updateMaterial(id, data);
        return ResponseEntity.ok().build();
    }
}
