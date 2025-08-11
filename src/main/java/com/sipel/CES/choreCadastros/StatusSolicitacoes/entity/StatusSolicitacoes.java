package com.sipel.CES.choreCadastros.StatusSolicitacoes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "StatusSolicitacao")
@Table(name = "status_solicitacao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StatusSolicitacoes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nomeStatus;
}
