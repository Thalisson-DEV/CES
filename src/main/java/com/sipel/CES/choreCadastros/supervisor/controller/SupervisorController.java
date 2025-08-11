package com.sipel.CES.choreCadastros.supervisor.controller;

import com.sipel.CES.choreCadastros.supervisor.DTOs.SupervisorResponseDTO;
import com.sipel.CES.choreCadastros.supervisor.service.SupervisorService;
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
    private SupervisorService service;

    @GetMapping
    public ResponseEntity<List<SupervisorResponseDTO>> getAllSupervisoresList() {
        List<SupervisorResponseDTO> supervisores = service.getAllSupervisoresList();
        return ResponseEntity.ok(supervisores);
    }
}
