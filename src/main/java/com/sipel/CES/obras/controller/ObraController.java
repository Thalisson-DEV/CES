package com.sipel.CES.obras.controller;

import com.sipel.CES.exceptions.ObraException;
import com.sipel.CES.obras.DTO.ObraResponseDTO;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.obras.DTO.ObraDTO;
import com.sipel.CES.obras.service.ObraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/obras")
public class ObraController {

    @Autowired
    ObraService obraService;

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity<ImportacaoResponseDTO> importObras(@RequestParam("file") MultipartFile file) {
        try {
            ImportacaoResponseDTO resultado = obraService.importarObras(file);
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
    public ResponseEntity<List<ObraResponseDTO>> getAllObras() {
        List<ObraResponseDTO> obras = obraService.getAllObras();
        return ResponseEntity.ok(obras);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity deleteObra(@PathVariable(value = "id") Integer id) {
        try {
            ObraResponseDTO obra =  obraService.getObraById(id);
            if (obra.status() != null && obra.status().id() == 4){
                return ResponseEntity.badRequest().body("Não é possivel deletar uma obra concluida!");
            }
        } catch (Exception e){
            System.out.println("Erro ao deletar obra: " + e.getMessage());
            throw e;
        }
        obraService.deleteObra(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity<ObraResponseDTO> createObra(@RequestBody ObraDTO data) {
        try {
            ObraResponseDTO response = obraService.createObra(data);
            return ResponseEntity.status(201).body(response);
        } catch (ObraException e) {
            // Log do erro para análise posterior
            System.out.println("Erro ao criar obra: " + e.getMessage());
            throw e; // Relança para que seja manipulado pelo handler global
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'COORDENACAO')")
    public ResponseEntity<?> updateObra(@PathVariable(value = "id") Integer id, @RequestBody ObraDTO data) {
        try {
            ObraResponseDTO obra = obraService.getObraById(id);
            if (obra.status() != null && obra.status().id() == 4){
                return ResponseEntity.badRequest().body(obra);
            }
        } catch (Exception e) {
            System.out.println("Erro ao criar obra: " + e.getMessage());
            throw e;
        }
        ObraResponseDTO response = obraService.updateObra(id, data);
        return ResponseEntity.ok(response);
    }

}
