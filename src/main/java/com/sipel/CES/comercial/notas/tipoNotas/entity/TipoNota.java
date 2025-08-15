package com.sipel.CES.comercial.notas.tipoNotas.entity;

import jakarta.persistence.*;

@Entity(name = "TipoNota")
@Table(name = "tipos_nota")
public class TipoNota {

    @Id
    @GeneratedValue
    private int id;
    @Column(name = "nome_tipo")
    private String nomeTipoNota;
    @Column(name = "grupo_nota")
    private String grupoNota;
}
