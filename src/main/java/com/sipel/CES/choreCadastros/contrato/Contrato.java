package com.sipel.CES.choreCadastros.contrato;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.Date;

@Entity(name = "contrato")
@Table(name = "contratos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contrato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String numeroContrato;
    private String descricao;
    private Date dataInicio;
    private Date dataFim;
    private boolean ativo;
    private OffsetDateTime dataCriacao;
}
