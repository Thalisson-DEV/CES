package com.sipel.CES.choreCadastros.processos.controller;


import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.processos.repository.ProcessoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/processos")
public class ProcessoController {

    @Autowired
    ProcessoRepository repository;

    @GetMapping
    public ResponseEntity<List<Processos>> getAllProcessos() {
        return ResponseEntity.ok(repository.findAll());
    }

}
