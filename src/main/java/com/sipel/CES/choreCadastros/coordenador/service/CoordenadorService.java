package com.sipel.CES.choreCadastros.coordenador.service;

import com.sipel.CES.choreCadastros.coordenador.DTOs.CoordenadorResponseDTO;
import com.sipel.CES.choreCadastros.coordenador.repository.CoordenadorRepository;
import com.sipel.CES.users.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoordenadorService {

    @Autowired
    private CoordenadorRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<CoordenadorResponseDTO> getAllCoordenadoresList() {
        return repository.findAll().stream()
                .map(CoordenadorResponseDTO::new)
                .collect(Collectors.toList());
    }
}