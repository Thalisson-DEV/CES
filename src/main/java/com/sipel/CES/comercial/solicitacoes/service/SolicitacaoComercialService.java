package com.sipel.CES.comercial.solicitacoes.service;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.StatusSolicitacoes.repository.StatusSolicitacoesRepository;
import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.equipes.repository.EquipeRepository;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.processos.repository.ProcessoRepository;
import com.sipel.CES.comercial.solicitacoes.DTOs.SolicitacaoComercialDTO;
import com.sipel.CES.comercial.solicitacoes.DTOs.SolicitacaoComercialResponseDTO;
import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import com.sipel.CES.comercial.solicitacoes.repository.SolicitacaoComercialRepository;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class SolicitacaoComercialService {

    @Autowired
    private SolicitacaoComercialRepository repository;
    @Autowired
    //TODO - usar depois
    private BaseOperacionalRepository baseOperacionalRepository;
    @Autowired
    private StatusSolicitacoesRepository statusSolicitacoesRepository;
    @Autowired
    private ProcessoRepository processoRepository;
    @Autowired
    private EquipeRepository equipeRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public SolicitacaoComercialResponseDTO getSolicitacaoById(Integer id) {
        SolicitacaoComercial solicitacaoComercial = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));
        return new SolicitacaoComercialResponseDTO(solicitacaoComercial);
    }

    public SolicitacaoComercialResponseDTO createSolicitacao(SolicitacaoComercialDTO solicitacao) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuarioLogado = (Usuario) authentication.getPrincipal();

        SolicitacaoComercial solicitacaoComercialEntity = new SolicitacaoComercial();
        mapDtoToEntity(solicitacao, solicitacaoComercialEntity, usuarioLogado);

        repository.save(solicitacaoComercialEntity);
        return new SolicitacaoComercialResponseDTO(solicitacaoComercialEntity);
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

    public void mapDtoToEntity(SolicitacaoComercialDTO dto, SolicitacaoComercial entity, Usuario solicitante) {
        if (solicitante != null) {
            entity.setSolicitante(solicitante);
            StatusSolicitacoes statusInicial = statusSolicitacoesRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("Status inicial padrão não encontrado."));
            entity.setStatus(statusInicial);

            entity.setDataCriacao(OffsetDateTime.now());
        }

        Processos processoSolicitacao = processoRepository.findById(dto.processo())
                .orElseThrow(() -> new RuntimeException("Processo não encontrado"));
        entity.setProcesso(processoSolicitacao);

        Equipe equipeSolicitacao = equipeRepository.findById(dto.equipe())
                .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));
        entity.setEquipe(equipeSolicitacao);

        entity.setObservacoes(dto.observacoes());
        entity.setDataModificacao(OffsetDateTime.now()); // Sempre atualiza a data de modificação
    }
}
