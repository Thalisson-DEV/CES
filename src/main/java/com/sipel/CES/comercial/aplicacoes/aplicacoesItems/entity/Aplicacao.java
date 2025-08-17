package com.sipel.CES.comercial.aplicacoes.aplicacoesItems.entity;

import com.sipel.CES.choreCadastros.materiais.entity.Material;
import com.sipel.CES.comercial.aplicacoes.tipoAplicacoes.entity.TipoAplicacoes;
import com.sipel.CES.comercial.notas.entity.Nota;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity(name = "aplicacoesCampo")
@Table(name = "aplicacoes_campo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Aplicacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "nota_id")
    private Nota notaId;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "material_id")
    private Material materialId;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_aplicacao_id")
    private TipoAplicacoes tipoAplicacoesId;
    private BigDecimal quantidadeAplicada;
}
