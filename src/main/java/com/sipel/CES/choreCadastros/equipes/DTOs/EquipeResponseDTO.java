package com.sipel.CES.choreCadastros.equipes.DTOs;

import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import com.sipel.CES.users.entity.Usuario;

import java.time.OffsetDateTime;

public record EquipeResponseDTO(
        Integer id,
        String nomeEquipe,
        String vulgo,
        boolean ativo,
        BaseDTO baseOperacional,
        ProcessoDTO processo,
        CoordenadorDTO coordenador,
        SupervisorDTO supervisor,
        OffsetDateTime dataCriacao

) {
    public EquipeResponseDTO(Equipe equipe) {
        this(
                equipe.getId(),
                equipe.getNomeEquipe(),
                equipe.getVulgo(),
                equipe.isAtivo(),
                equipe.getBaseOperacional() != null ? new BaseDTO(equipe.getBaseOperacional()) : null,
                equipe.getProcesso() != null ? new ProcessoDTO(equipe.getProcesso()) : null,
                equipe.getCoordenador() != null ? new CoordenadorDTO(equipe.getCoordenador()) : null,
                equipe.getSupervisor() != null ? new SupervisorDTO(equipe.getSupervisor()) : null,
                equipe.getDataCriacao());
    }

    public record BaseDTO(int id, String nomeBase) {
        public BaseDTO(BaseOperacional base) {
            this(base.getId(), base.getNomeBase());
        }
    }

    public record ProcessoDTO(int id, String nomeProcesso) {
        public ProcessoDTO(Processos processos) {
            this(processos.getId(), processos.getNomeProcesso());
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
