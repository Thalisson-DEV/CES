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
    public ResponseEntity<?> atenderItens(
            @PathVariable Integer solicitacaoId,
            @RequestBody(required = false) List<Integer> itemIds) {
        try {
            List<SolicitacaoComercialItemsResponseDTO> itemsAtendidos = itemsService.atenderItens(solicitacaoId, itemIds);
            if (itemsAtendidos.isEmpty()) {
                throw new IllegalArgumentException("Nenhum item para atender disponivel.");
            }
            return ResponseEntity.ok(itemsAtendidos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/request/aprovar")
    public ResponseEntity<?> aprovarRequests(
            @PathVariable Integer solicitacaoId,
            @RequestBody(required = false) List<Integer> itemIds) {
        try {
            List<SolicitacaoComercialItemsResponseDTO> itemsAtendidos = itemsService.aprovarItensRequest(solicitacaoId, itemIds);
            if (itemsAtendidos.isEmpty()) {
                throw new IllegalArgumentException("Nenhum item para atender disponivel.");
            }
            return ResponseEntity.ok(itemsAtendidos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rejeitar")
    public ResponseEntity<?> rejeitarItens(
            @PathVariable Integer solicitacaoId,
            @RequestBody(required = false) List<Integer> itemIds) {
        try {
            List<SolicitacaoComercialItemsResponseDTO> itemsRejeitados = itemsService.rejeitarItens(solicitacaoId, itemIds);
            if (itemsRejeitados.isEmpty()) {
                throw new IllegalArgumentException("Nenhum item para rejeitar disponivel.");
            }
            return ResponseEntity.ok(itemsRejeitados);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/request/rejeitar")
    public ResponseEntity<?> rejeitarRequests(
            @PathVariable Integer solicitacaoId,
            @RequestBody(required = false) List<Integer> itemIds) {
        try {
            List<SolicitacaoComercialItemsResponseDTO> itemsRejeitados = itemsService.rejeitarItensRequest(solicitacaoId, itemIds);
            if (itemsRejeitados.isEmpty()) {
                throw new IllegalArgumentException("Nenhum item para rejeitar disponivel.");
            }
            return ResponseEntity.ok(itemsRejeitados);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> syncItems(
            @PathVariable Integer solicitacaoId,
            @RequestBody List<SolicitacaoComercialItemsDTO> itemsDto) {
        try {
            List<SolicitacaoComercialItemsResponseDTO> updatedItems = itemsService.syncItems(solicitacaoId, itemsDto);
            return ResponseEntity.ok(updatedItems);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }


    }
}