package com.sipel.CES.comercial.notas.services;

import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.choreCadastros.equipes.repository.EquipeRepository;
import com.sipel.CES.choreCadastros.materiais.repository.MaterialRepository;
import com.sipel.CES.comercial.aplicacoes.aplicacoesItems.DTOs.AplicacoesDTO;
import com.sipel.CES.comercial.aplicacoes.aplicacoesItems.entity.Aplicacao;
import com.sipel.CES.comercial.aplicacoes.aplicacoesItems.repository.AplicacoesRepository;
import com.sipel.CES.comercial.aplicacoes.tipoAplicacoes.repository.TipoAplicacoesRepository;
import com.sipel.CES.comercial.notas.DTOs.NotaCompletaDTO;
import com.sipel.CES.comercial.notas.DTOs.NotaResponseDTO;
import com.sipel.CES.comercial.notas.entity.Nota;
import com.sipel.CES.comercial.notas.repository.NotasRepository;
import com.sipel.CES.comercial.notas.tipoNotas.repository.TipoNotaRepository;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class NotasService {

    @Autowired
    private NotasRepository notaRepository;
    @Autowired
    private AplicacoesRepository itemRepository;
    @Autowired
    private EquipeRepository equipeRepository;
    @Autowired
    private BaseOperacionalRepository baseRepository;
    @Autowired
    private TipoNotaRepository tipoNotaRepository;
    @Autowired
    private TipoAplicacoesRepository tipoAplicacaoRepository;
    @Autowired
    private MaterialRepository materialRepository;

    @Transactional
    public NotaResponseDTO createNotaCompleta(NotaCompletaDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        var notaDto = dto.nota();
        var equipe = equipeRepository.findById(notaDto.equipe())
                .orElseThrow(() -> new EntityNotFoundException("Equipe não encontrada."));
        var base = baseRepository.findById(notaDto.baseOperacional())
                .orElseThrow(() -> new EntityNotFoundException("Base Operacional não encontrada."));
        var tipoNota = tipoNotaRepository.findById(notaDto.tipoNota())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de Nota não encontrado."));

        Nota novaNota = new Nota();
        novaNota.setNumeroNota(notaDto.numeroNota());
        novaNota.setTipoNota(tipoNota);
        novaNota.setEquipe(equipe);
        novaNota.setBaseOperacional(base);
        novaNota.setUsuario(usuarioLogado);
        novaNota.setObservacoes(notaDto.observacoes());
        novaNota.setDataCriacao(OffsetDateTime.now());
        novaNota.setDataNota(OffsetDateTime.now());

        Nota notaSalva = notaRepository.save(novaNota);

        for (AplicacoesDTO itemDto : dto.itens()) {
            var material = materialRepository.findById(itemDto.materialId())
                    .orElseThrow(() -> new EntityNotFoundException("Material não encontrado: " + itemDto.materialId()));
            var tipoAplicacao = tipoAplicacaoRepository.findById(itemDto.tipoAplicacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Tipo de Aplicação não encontrado: " + itemDto.tipoAplicacaoId()));

            Aplicacao novoItem = new Aplicacao();
            novoItem.setMaterialId(material);
            novoItem.setTipoAplicacoesId(tipoAplicacao);
            novoItem.setQuantidadeAplicada(itemDto.quantidadeAplicada());

            itemRepository.save(novoItem);
        }

        return new NotaResponseDTO(notaSalva);
    }

    public Page<NotaResponseDTO> getAllNotasCompletas(
            Integer tipoNotaId,
            Integer equipeId,
            Long usuarioId,
            Integer baseId,
            String searchTerm,
            Pageable pageable
    ) {
        Page<Nota> notasPage = notaRepository.findWithFilters(tipoNotaId, equipeId, usuarioId, baseId, searchTerm, pageable);
        return notasPage.map(NotaResponseDTO::new);
    }
}
