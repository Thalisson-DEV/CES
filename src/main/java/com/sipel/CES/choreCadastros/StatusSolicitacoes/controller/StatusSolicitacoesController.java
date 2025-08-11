package com.sipel.CES.choreCadastros.StatusSolicitacoes.controller;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.StatusSolicitacoes.repository.StatusSolicitacoesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/status-solicitacao")
public class StatusSolicitacoesController {

    @Autowired
    private StatusSolicitacoesRepository repository;

    @GetMapping
    public ResponseEntity<List<StatusSolicitacoes>> getAllStatusSolicitacoesList() {
        return ResponseEntity.ok(repository.findAll());
    }
}
