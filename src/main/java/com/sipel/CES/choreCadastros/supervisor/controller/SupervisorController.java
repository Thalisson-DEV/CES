package com.sipel.CES.choreCadastros.supervisor.controller;

import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import com.sipel.CES.choreCadastros.supervisor.repository.SupervisorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/supervisores")
public class SupervisorController {

    @Autowired
    private SupervisorRepository repository;

    @GetMapping
    public ResponseEntity<List<Supervisor>> getAllSupervisores() {
        return ResponseEntity.ok(repository.findAll());
    }
}
