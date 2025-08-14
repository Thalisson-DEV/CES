package com.sipel.CES.comercial.solicitacoes.service;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.StatusSolicitacoes.repository.StatusSolicitacoesRepository;
import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.equipes.repository.EquipeRepository;
import com.sipel.CES.choreCadastros.materiais.entity.Material;
import com.sipel.CES.choreCadastros.materiais.repository.MaterialRepository;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.processos.repository.ProcessoRepository;
import com.sipel.CES.comercial.solicitacoes.DTOs.SolicitacaoComercialDTO;
import com.sipel.CES.comercial.solicitacoes.DTOs.SolicitacaoComercialResponseDTO;
import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import com.sipel.CES.comercial.solicitacoes.repository.SolicitacaoComercialRepository;
import com.sipel.CES.comercial.solicitacoesItems.DTOs.SolicitacaoComercialItemsDTO;
import com.sipel.CES.comercial.solicitacoesItems.entity.SolicitacaoComercialItems;
import com.sipel.CES.comercial.solicitacoesItems.repository.SolicitacaoComercialItemsRepository;
import com.sipel.CES.generic.emails.EmailComercialService;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolicitacaoComercialService {

    @Autowired
    private SolicitacaoComercialRepository repository;
    @Autowired
    private BaseOperacionalRepository baseOperacionalRepository;
    @Autowired
    private StatusSolicitacoesRepository statusSolicitacoesRepository;
    @Autowired
    private ProcessoRepository processoRepository;
    @Autowired
    private EquipeRepository equipeRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private EmailComercialService emailComercialService;
    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private SolicitacaoComercialItemsRepository solicitacaoComercialItemsRepository;

    public SolicitacaoComercialResponseDTO getSolicitacaoById(Integer id) {
        SolicitacaoComercial solicitacaoComercial = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));
        return new SolicitacaoComercialResponseDTO(solicitacaoComercial);
    }

    @Transactional
    public SolicitacaoComercialResponseDTO createSolicitacao(SolicitacaoComercialDTO solicitacaoDto, List<SolicitacaoComercialItemsDTO> itemsDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        SolicitacaoComercial solicitacaoEntity = new SolicitacaoComercial();
        mapDtoToEntity(solicitacaoDto, solicitacaoEntity, usuarioLogado);
        repository.save(solicitacaoEntity);

        List<SolicitacaoComercialItems> savedItems = itemsDto.stream().map(itemDto -> {
            Material material = materialRepository.findById(itemDto.materialId())
                    .orElseThrow(() -> new EntityNotFoundException("Material não encontrado com o ID: " + itemDto.materialId()));

            SolicitacaoComercialItems itemEntity = new SolicitacaoComercialItems();
            itemEntity.setSolicitacaoComercialId(solicitacaoEntity);
            itemEntity.setMaterialId(material);
            itemEntity.setQuantidadeSolicitada(itemDto.quantidadeSolicitada());
            itemEntity.setQuantidadeAtendida(BigDecimal.ZERO);
            itemEntity.setDataModificacao(OffsetDateTime.now());

            StatusSolicitacoes statusInicialItem = statusSolicitacoesRepository.findById(7)
                    .orElseThrow(() -> new RuntimeException("Status 'Solicitado' (ID 7) não encontrado."));
            itemEntity.setStatusId(statusInicialItem);

            return solicitacaoComercialItemsRepository.save(itemEntity);
        }).collect(Collectors.toList());

        emailComercialService.sendNewRequestNotificationEmail(solicitacaoEntity, savedItems);

        return new SolicitacaoComercialResponseDTO(solicitacaoEntity);
    }

    public SolicitacaoComercialResponseDTO updateSolicitacao(Integer id, SolicitacaoComercialDTO data) {
        SolicitacaoComercial solicitacaoComercial = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada"));
        mapDtoToEntity(data, solicitacaoComercial, null);
        repository.save(solicitacaoComercial);
        return new SolicitacaoComercialResponseDTO(solicitacaoComercial);
    }

    public Page<SolicitacaoComercialResponseDTO> getAllSolicitacoes(Integer equipeId, Long solicitanteId, Integer statusId, Integer processoId, String searchTerm, Pageable pageable) {
        Page<SolicitacaoComercial> solicitacaoPage = repository.findWithFilters(equipeId, solicitanteId, statusId, processoId, searchTerm, pageable);
        return solicitacaoPage.map(SolicitacaoComercialResponseDTO::new);
    }

    public Page<SolicitacaoComercialResponseDTO> getAllResquests(Integer equipeId, Long solicitanteId, Integer statusId,Integer processoId, String searchTerm, Pageable pageable) {
        Page<SolicitacaoComercial> solicitacaoPage = repository.findRequestedWithFilters(equipeId, solicitanteId, statusId ,processoId, searchTerm, pageable);
        return solicitacaoPage.map(SolicitacaoComercialResponseDTO::new);
    }

    public void mapDtoToEntity(SolicitacaoComercialDTO dto, SolicitacaoComercial entity, Usuario solicitante) {
        if (solicitante != null) {
            entity.setSolicitante(solicitante);
        }

        Integer statusId = dto.status();

        if (solicitante != null || statusId == null) {
            StatusSolicitacoes statusInicial = statusSolicitacoesRepository.findById(7)
                    .orElseThrow(() -> new RuntimeException("Status inicial 'Solicitado' (ID 7) não encontrado."));
            entity.setStatus(statusInicial);
        } else {
            StatusSolicitacoes statusAtualizado = statusSolicitacoesRepository.findById(statusId)
                    .orElseThrow(() -> new RuntimeException("Status não encontrado com o ID: " + statusId));
            entity.setStatus(statusAtualizado);
        }

        Processos processoSolicitacao = processoRepository.findById(dto.processo())
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));
        entity.setProcesso(processoSolicitacao);

        Equipe equipeSolicitacao = equipeRepository.findById(dto.equipe())
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));
        entity.setEquipe(equipeSolicitacao);

        if (dto.dataCriacao() != null) {
            entity.setDataCriacao(dto.dataCriacao());
        } else if (entity.getDataCriacao() == null) {
            entity.setDataCriacao(OffsetDateTime.now());
        }

        entity.setObservacoes(dto.observacoes());
        entity.setDataModificacao(OffsetDateTime.now());
    }

}
