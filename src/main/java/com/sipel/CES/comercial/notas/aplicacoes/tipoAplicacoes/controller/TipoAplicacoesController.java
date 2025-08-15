package com.sipel.CES.comercial.notas.aplicacoes.tipoAplicacoes.controller;

import com.sipel.CES.comercial.notas.aplicacoes.tipoAplicacoes.entity.TipoAplicacoes;
import com.sipel.CES.comercial.notas.aplicacoes.tipoAplicacoes.repository.TipoAplicacoesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tipos-aplicacoes")
public class TipoAplicacoesController {

    @Autowired
    private TipoAplicacoesRepository repository;

    @GetMapping
    public ResponseEntity<List<TipoAplicacoes>> getAllTipoAplicacoesList() {
        return ResponseEntity.ok(repository.findAll());
    }
}
