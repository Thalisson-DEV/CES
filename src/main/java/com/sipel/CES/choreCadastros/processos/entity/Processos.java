package com.sipel.CES.choreCadastros.processos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "processos")
@Table(name = "processos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Processos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nomeProcesso;
}
