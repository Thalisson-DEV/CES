package com.sipel.CES.choreCadastros.supervisor.service;

import com.sipel.CES.choreCadastros.supervisor.DTOs.SupervisorResponseDTO;
import com.sipel.CES.choreCadastros.supervisor.repository.SupervisorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupervisorService {

    @Autowired
    private SupervisorRepository repository;

    public List<SupervisorResponseDTO> getAllSupervisoresList() {
        return repository.findAll().stream()
                .map(SupervisorResponseDTO::new)
                .collect(Collectors.toList());
    }
}
