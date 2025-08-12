package com.sipel.CES.comercial.solicitacoesItems.controller;

import com.sipel.CES.comercial.solicitacoesItems.DTOs.SolicitacaoComercialItemsDTO;
import com.sipel.CES.comercial.solicitacoesItems.DTOs.SolicitacaoComercialItemsResponseDTO;
import com.sipel.CES.comercial.solicitacoesItems.service.SolicitacaoComercialItemsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/solicitacoes-comercial/{solicitacaoId}/items")
public class SolicitacaoComercialItemsController {

    @Autowired
    private SolicitacaoComercialItemsService itemsService;

    @GetMapping()
    public ResponseEntity<List<SolicitacaoComercialItemsResponseDTO>> getItemsBySolicitacaoId(@PathVariable Integer solicitacaoId) {
        List<SolicitacaoComercialItemsResponseDTO> items = itemsService.getItemsBySolicitacaoId(solicitacaoId);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<SolicitacaoComercialItemsResponseDTO> addItem(
            @PathVariable Integer solicitacaoId,
            @RequestBody SolicitacaoComercialItemsDTO itemDto) {
        SolicitacaoComercialItemsResponseDTO newItem = itemsService.addItem(solicitacaoId, itemDto);
        return ResponseEntity.status(201).body(newItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Integer itemId) {
        itemsService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/atender")
    public ResponseEntity<List<SolicitacaoComercialItemsResponseDTO>> atenderItens(
            @PathVariable Integer solicitacaoId,
            @RequestBody(required = false) List<Integer> itemIds) {
        List<SolicitacaoComercialItemsResponseDTO> itemsAtendidos = itemsService.atenderItens(solicitacaoId, itemIds);
        return ResponseEntity.ok(itemsAtendidos);
    }

    @PostMapping("/rejeitar")
    public ResponseEntity<List<SolicitacaoComercialItemsResponseDTO>> rejeitarItens(
            @PathVariable Integer solicitacaoId,
            @RequestBody(required = false) List<Integer> itemIds) {
        List<SolicitacaoComercialItemsResponseDTO> itemsRejeitados = itemsService.rejeitarItens(solicitacaoId, itemIds);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<List<SolicitacaoComercialItemsResponseDTO>> syncItems(
            @PathVariable Integer solicitacaoId,
            @RequestBody List<SolicitacaoComercialItemsDTO> itemsDto) {
        List<SolicitacaoComercialItemsResponseDTO> updatedItems = itemsService.syncItems(solicitacaoId, itemsDto);
        return ResponseEntity.ok(updatedItems);
    }
}