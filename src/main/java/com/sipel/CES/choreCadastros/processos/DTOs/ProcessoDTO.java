package com.sipel.CES.choreCadastros.processos.DTOs;

import com.sipel.CES.choreCadastros.processos.entity.Processos;

public record ProcessoDTO(int id, String nomeProcesso) {
    public ProcessoDTO(Processos processo) {
        this(processo.getId(), processo.getNomeProcesso());
    }
}
