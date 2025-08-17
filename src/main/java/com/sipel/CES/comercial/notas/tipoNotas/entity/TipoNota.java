package com.sipel.CES.comercial.notas.tipoNotas.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "TipoNota")
@Table(name = "tipos_nota")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TipoNota {

    @Id
    @GeneratedValue
    private int id;
    @Column(name = "nome_tipo")
    private String nomeTipoNota;
    @Column(name = "grupo_tipo")
    private String grupoNota;
}
