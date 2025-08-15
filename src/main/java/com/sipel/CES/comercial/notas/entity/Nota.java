package com.sipel.CES.comercial.notas.entity;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.comercial.notas.tipoNotas.entity.TipoNota;
import com.sipel.CES.users.entity.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity(name = "Nota")
@Table(name = "notas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String numeroNota;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_nota_id")
    private TipoNota tipoNota;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_operacional_id")
    private BaseOperacional baseOperacional;
    private OffsetDateTime dataNota;
    private String observacoes;
    private OffsetDateTime dataCriacao;
}
