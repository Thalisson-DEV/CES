package com.sipel.CES.comercial.solicitacoesItems.entity;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.materiais.entity.Material;
import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity(name = "solicitacaoComercialItems")
@Table(name = "solicitacao_comercial_itens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoComercialItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "solicitacao_id")
    private SolicitacaoComercial solicitacaoComercialId;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "material_id")
    private Material materialId;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private StatusSolicitacoes statusId;
    private BigDecimal quantidadeSolicitada;
    private BigDecimal quantidadeAtendida;
    private OffsetDateTime dataModificacao;
}
