package com.sipel.CES.DTOs;

import java.util.List;

public record ImportacaoResponseDTO(int sucesso, int falhas, List<String> erros) {
}
