package com.sipel.CES.comercial.notas.aplicacoes.tipoAplicacoes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "TipoAplicacoes")
@Table(name = "tipo_aplicacoes")
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
