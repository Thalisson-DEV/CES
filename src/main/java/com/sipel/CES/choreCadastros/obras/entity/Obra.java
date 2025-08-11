package com.sipel.CES.choreCadastros.obras.entity;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
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
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coordenador_id")
    private Coordenador coordenador;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;
    private boolean ativo;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private OffsetDateTime dataCriacao;
}
