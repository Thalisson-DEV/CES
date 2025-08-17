package com.sipel.CES.choreCadastros.equipes.DTOs;

import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record EquipeDTO(
        @NotBlank
        String nomeEquipe,
        @NotBlank
        String vulgo,
        @NotNull
        boolean ativo,
        @NotNull
        Integer baseOperacional,
        @NotBlank
        Integer processo,
        @NotBlank
        Integer supervisor,
        @NotBlank
        Integer coordenador,
        @NotBlank
        String emailCoordenador,
        @NotBlank
        String emailAlmoxarifado,
        @NotBlank
        OffsetDateTime dataCriacao
) {

        public EquipeDTO(Equipe equipe) {
                this(equipe.getNomeEquipe(), equipe.getVulgo(), equipe.isAtivo(), equipe.getBaseOperacional().getId(), equipe.getProcesso().getId(), equipe.getSupervisor().getId(), equipe.getCoordenador().getId(), equipe.getEmailCoordenador(), equipe.getEmailAlmoxarifado(), equipe.getDataCriacao());
        }
}
