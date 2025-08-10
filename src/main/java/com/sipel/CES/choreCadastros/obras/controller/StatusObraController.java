package com.sipel.CES.choreCadastros.obras.controller;


import com.sipel.CES.choreCadastros.obras.entity.StatusObra;
import com.sipel.CES.choreCadastros.obras.repositories.StatusObraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/status-obra")
public class StatusObraController {

    @Autowired
    private StatusObraRepository repository;

    @GetMapping
    public ResponseEntity<List<StatusObra>> obras() {
        return ResponseEntity.ok(repository.findAll());
    }
}
