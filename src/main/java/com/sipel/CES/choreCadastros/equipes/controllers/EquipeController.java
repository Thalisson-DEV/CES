package com.sipel.CES.choreCadastros.equipes.controllers;

import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeDTO;
import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeResponseDTO;
import com.sipel.CES.choreCadastros.equipes.exceptions.EquipeGlobalException;
import com.sipel.CES.choreCadastros.equipes.services.EquipeService;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.choreCadastros.obras.service.ObraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/v1/equipes")
public class EquipeController {

    @Autowired
    EquipeService equipeService;
    @Autowired
    private ObraService obraService;

    @PostMapping
    public ResponseEntity<EquipeResponseDTO> createEquipe(@RequestBody EquipeDTO data) {
        try {
            EquipeResponseDTO response = equipeService.createEquipe(data);
            return ResponseEntity.status(201).body(response);
        } catch (EquipeGlobalException e) {
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<Page<EquipeResponseDTO>> getAllEquipes(
            @RequestParam(required = false) Integer baseId,
            @RequestParam(required = false) Integer processoId,
            @RequestParam(required = false) Integer coordenadorId,
            @RequestParam(required = false) Integer supervisorId,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        Page<EquipeResponseDTO> equipes = equipeService.getAllEquipes(baseId, processoId, coordenadorId, supervisorId, searchTerm, pageable);
        return ResponseEntity.ok(equipes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipeResponseDTO> updateEquipe(@PathVariable(value = "id") Integer id, @RequestBody EquipeDTO data) {
        try{
            EquipeResponseDTO response = equipeService.updateEquipe(id, data);
            return ResponseEntity.ok(response);
        } catch(EquipeGlobalException e) {
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteEquipe(@PathVariable(value = "id") Integer id) {
        try {
            obraService.deleteObra(id);
            return ResponseEntity.noContent().build();
        } catch (EquipeGlobalException e) {
            throw e;
        }
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity<ImportacaoResponseDTO> importEquipes(@RequestParam("file") MultipartFile file) {
        try {
            ImportacaoResponseDTO resultado = equipeService.importarEquipes(file);
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
}
