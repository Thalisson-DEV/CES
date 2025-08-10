package com.sipel.CES.choreCadastros.equipes.entity;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity(name = "Equipes")
@Table(name = "equipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "nome_equipe")
    private String nomeEquipe;
    private String vulgo;
    private boolean ativo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_operacional_id")
    private BaseOperacional baseOperacional;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processo_id")
    private Processos processo;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coordenador_id")
    private Coordenador coordenador;
    @Column(name = "email_coordenacao")
    private String emailCoordenador;
    @Column(name = "email_almoxarifado")
    private String emailAlmoxarifado;
    private OffsetDateTime dataCriacao;

}
