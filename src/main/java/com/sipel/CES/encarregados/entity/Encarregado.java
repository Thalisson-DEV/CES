package com.sipel.CES.encarregados.entity;

import com.sipel.CES.basesOperacionais.entity.BaseOperacional;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity(name = "encarregados")
@Table(name = "encarregados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Encarregado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "nome_completo")
    private String nomeCompleto;
    private String vulgo;
    private boolean ativo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_operacional_id")
    private BaseOperacional baseOperacional;
    private OffsetDateTime dataCriacao;
}
