package com.sipel.CES.comercial.entity;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.users.entity.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity(name = "SolicitacaoComercial")
@Table(name = "solicitacoes_comerciais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "solicitante_id")
    private Usuario solicitante;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private StatusSolicitacoes status;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processo_id")
    private Processos processo;
    private String observacoes;
    private OffsetDateTime dataCriacao;
    @Column(name = "data_modificacao")
    private OffsetDateTime dataModificacao;
}
