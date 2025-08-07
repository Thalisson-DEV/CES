package com.sipel.CES.obras.entity;

import com.sipel.CES.basesOperacionais.entity.BaseOperacional;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity(name="obras")
@Table(name="obras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Obra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String numeroObra;
    private String titulo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_obra_id")
    private BaseOperacional baseObra;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_saque_id")
    private BaseOperacional baseSaque;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private StatusObra statusObra;
    private boolean ativo;
    private OffsetDateTime dataCriacao;
}
