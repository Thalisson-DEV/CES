package com.sipel.CES.choreCadastros.servicos.controller;

import com.sipel.CES.choreCadastros.servicos.DTOs.ServicosDTO;
import com.sipel.CES.choreCadastros.servicos.DTOs.ServicosResponseDTO;
import com.sipel.CES.choreCadastros.servicos.service.ServicosService;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/servicos")
public class ServicosController {

    @Autowired
    private ServicosService service;

    @PostMapping("/import")
    public ResponseEntity<ImportacaoResponseDTO> importServicos(@RequestParam("file") MultipartFile file) {
        try {
            ImportacaoResponseDTO resultado = service.importarServicos(file);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.out.println("Erro na importação de obras: " + e.getMessage());
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

    @GetMapping
    public ResponseEntity<Page<ServicosResponseDTO>> getAllServicos(
            @RequestParam(required = false) Integer contratoId,
            @RequestParam(required = false) Integer processoId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<ServicosResponseDTO> servicos = service.getAllServicos(contratoId, processoId, searchTerm, pageable);
        return ResponseEntity.ok(servicos);
    }

    @PostMapping
    public ResponseEntity<?> createServico(@RequestBody ServicosDTO data) {
        try {
            ServicosResponseDTO response = service.createServico(data);
            return ResponseEntity.status(201).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateServico(@PathVariable(value = "id") Integer id, @RequestBody ServicosDTO data) {
        try {
            ServicosResponseDTO servico = service.updateServico(id, data);
            return ResponseEntity.ok(servico);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServicoById(@PathVariable(value = "id") Integer id) {
        try {
            ServicosResponseDTO servico = service.getServicosById(id);
            return ResponseEntity.ok(servico);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
