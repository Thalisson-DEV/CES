package com.sipel.CES.comercial.notas.tipoNotas.controller;

import com.sipel.CES.comercial.notas.tipoNotas.entity.TipoNota;
import com.sipel.CES.comercial.notas.tipoNotas.repository.TipoNotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tipos-nota")
public class TipoNotaController {

    @Autowired
    private TipoNotaRepository repository;

    @GetMapping
    public ResponseEntity<List<TipoNota>> getAllTipoNotaList() {
        return ResponseEntity.ok(repository.findAll());
    }
}
