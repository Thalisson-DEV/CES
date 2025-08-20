package com.sipel.CES.choreCadastros.servicos.entity;

import com.sipel.CES.choreCadastros.contrato.entity.Contrato;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity(name = "cadernoServicos")
@Table(name = "servicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Servicos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String codigoServico;
    private String descricao;
    @Column(name = "um")
    private String unidadeMedida;
    private String grupoMercadoria;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processo_id")
    private Processos processo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contrato_id")
    private Contrato contrato;
    private BigDecimal valorReferencia;
    private String textoLongo;
    private boolean ativo;
    private OffsetDateTime dataCriacao;
}
