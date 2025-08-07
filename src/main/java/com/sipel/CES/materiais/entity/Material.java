package com.sipel.CES.materiais.entity;

import com.sipel.CES.generic.entitys.SuprMatrEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity(name="materiais")
@Table(name="materiais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String codigoMaterial;
    private String nomeMaterial;
    private String descricao;
    private String unidadeMedida;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "supr_matr")
    private SuprMatrEnum suprMatrEnum;
    private String avaliacao;
    private String centro;
}
