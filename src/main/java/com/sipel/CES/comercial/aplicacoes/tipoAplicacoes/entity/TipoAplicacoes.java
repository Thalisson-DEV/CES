package com.sipel.CES.comercial.aplicacoes.tipoAplicacoes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "TipoAplicacoes")
@Table(name = "tipos_aplicacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TipoAplicacoes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "nome_tipo")
    private String nomeTipoAplicacao;
}
