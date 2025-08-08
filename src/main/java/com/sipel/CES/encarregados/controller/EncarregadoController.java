package com.sipel.CES.encarregados.controller;

import com.sipel.CES.encarregados.DTO.EncarregadoDTO;
import com.sipel.CES.encarregados.DTO.EncarregadoResponseDTO;
import com.sipel.CES.encarregados.service.EncarregadoService;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.materiais.DTOs.MaterialResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/encarregados")
public class EncarregadoController {

    @Autowired
    private EncarregadoService service;

    @PostMapping
    public ResponseEntity<?> createEncarregado(@RequestBody EncarregadoDTO data) {
        try {
            EncarregadoResponseDTO response = service.createEncarregado(data);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<EncarregadoResponseDTO>> getAllEncarregados(
            @RequestParam(required = false) Integer baseId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<EncarregadoResponseDTO> encarregados = service.getAllEncarregados(baseId, searchTerm, pageable);
        return ResponseEntity.ok(encarregados);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEncarregado(@PathVariable(value = "id") Integer id, @RequestBody EncarregadoDTO data) {
        try {
            EncarregadoResponseDTO response = service.updateEncarregado(id, data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEncarregado(@PathVariable(value = "id") Integer id) {
        try {
            service.deleteEncarregado(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity<ImportacaoResponseDTO> importEncarregado(@RequestParam("file") MultipartFile file) {
        try {
            ImportacaoResponseDTO resultado = service.importarEncarregados(file);
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
}
