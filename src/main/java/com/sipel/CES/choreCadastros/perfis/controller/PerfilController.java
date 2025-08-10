package com.sipel.CES.choreCadastros.perfis.controller;

import com.sipel.CES.choreCadastros.perfis.entity.Perfis;
import com.sipel.CES.choreCadastros.perfis.repository.PerfisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/perfis")
public class PerfilController {

    @Autowired
    private PerfisRepository repository;

    @GetMapping
    public ResponseEntity<List<Perfis>> getAllPerfis() {
        return ResponseEntity.ok(repository.findAll());
    }
}
