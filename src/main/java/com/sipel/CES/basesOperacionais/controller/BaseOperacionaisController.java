package com.sipel.CES.basesOperacionais.controller;

import com.sipel.CES.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.basesOperacionais.repository.BaseOperacionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bases-operacionais")
public class BaseOperacionaisController {

    @Autowired
    private BaseOperacionalRepository repository;

    @GetMapping
    public ResponseEntity<List<BaseOperacional>> getAllBaseOperacional() {
        return ResponseEntity.ok(repository.findAll());
    }

}
