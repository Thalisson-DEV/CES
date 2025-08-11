package com.sipel.CES.choreCadastros.obras.DTO;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeResponseDTO;
import com.sipel.CES.choreCadastros.obras.entity.Obra;
import com.sipel.CES.choreCadastros.obras.entity.StatusObra;
import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import com.sipel.CES.users.entity.Usuario;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ObraResponseDTO(
        int id,
        String numeroObra,
        String titulo,
        BaseDTO baseObra,
        BaseDTO baseSaque,
        LocalDate dataInicio,
        LocalDate dataFim,
        CoordenadorDTO coordenador,
        SupervisorDTO supervisor,
        BigDecimal latitude,
        BigDecimal longitude,
        StatusDTO status,
        boolean ativo,
        OffsetDateTime dataCriacao
) {
    public ObraResponseDTO(Obra obra) {
        this(
                obra.getId(),
                obra.getNumeroObra(),
                obra.getTitulo(),
                obra.getBaseObra() != null ? new BaseDTO(obra.getBaseObra()) : null,
                obra.getBaseSaque() != null ? new BaseDTO(obra.getBaseSaque()) : null,
                obra.getDataInicio(),
                obra.getDataFim(),
                obra.getCoordenador() != null ? new CoordenadorDTO(obra.getCoordenador()) : null,
                obra.getSupervisor() != null ? new SupervisorDTO(obra.getSupervisor()) : null,
                obra.getLatitude(),
                obra.getLongitude(),
                obra.getStatusObra() != null ? new StatusDTO(obra.getStatusObra()) : null,
                obra.isAtivo(),
                obra.getDataCriacao());
    }

    // DTOs internos para representar as entidades relacionadas
    public record BaseDTO(int id, String nomeBase) {
        public BaseDTO(BaseOperacional base) {
            this(base.getId(), base.getNomeBase());
        }
    }

    public record StatusDTO(int id, String nomeStatus) {
        public StatusDTO(StatusObra status) {
            this(status.getId(), status.getNomeStatus());
        }
    }

    public record usuarioDTO(Long id, String user) {
        public usuarioDTO(Usuario usuario) {
            this(usuario.getId(), usuario.getNomeCompleto());
        }
    }


    public record CoordenadorDTO(int id, usuarioDTO username) {
        public CoordenadorDTO(Coordenador coordenador) {
            this(coordenador.getId(), coordenador.getUsuario() != null ? new usuarioDTO(coordenador.getUsuario()) : null);
        }
    }

    public record SupervisorDTO(int id, usuarioDTO username) {
        public SupervisorDTO(Supervisor supervisor) {
            this(supervisor.getId(), supervisor.getUsuario() != null ? new usuarioDTO(supervisor.getUsuario()) : null);
        }
    }
}
