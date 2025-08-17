package com.sipel.CES.comercial.notas.DTOs;

import com.sipel.CES.comercial.aplicacoes.aplicacoesItems.DTOs.AplicacoesDTO;

import java.util.List;

public record NotaCompletaDTO(
        NotaDTO nota,
        List<AplicacoesDTO> itens
) {}
