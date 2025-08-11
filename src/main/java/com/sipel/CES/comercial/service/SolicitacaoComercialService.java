package com.sipel.CES.comercial.service;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.StatusSolicitacoes.repository.StatusSolicitacoesRepository;
import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.equipes.repository.EquipeRepository;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.processos.repository.ProcessoRepository;
import com.sipel.CES.comercial.DTOs.SolicitacaoComercialDTO;
import com.sipel.CES.comercial.DTOs.SolicitacaoComercialResponseDTO;
import com.sipel.CES.comercial.entity.SolicitacaoComercial;
import com.sipel.CES.comercial.repository.SolicitacaoComercialRepository;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
        SolicitacaoComercial solicitacaoComercialEntity = new SolicitacaoComercial();
        mapDtoToEntity(solicitacao, solicitacaoComercialEntity);
        repository.save(solicitacaoComercialEntity);
        return new SolicitacaoComercialResponseDTO(solicitacaoComercialEntity);
    }

    public SolicitacaoComercialResponseDTO updateSolicitacao(Integer id, SolicitacaoComercialDTO data) {
        SolicitacaoComercial solicitacaoComercial = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada"));
        mapDtoToEntity(data, solicitacaoComercial);
        repository.save(solicitacaoComercial);
        return new SolicitacaoComercialResponseDTO(solicitacaoComercial);
    }

    public Page<SolicitacaoComercialResponseDTO> getAllSolicitacoes(Integer equipeId, Long solicitanteId, Integer statusId, Integer processoId, String searchTerm, Pageable pageable) {
        Page<SolicitacaoComercial> solicitacaoPage = repository.findWithFilters(equipeId, solicitanteId, statusId, processoId, searchTerm, pageable);
        return solicitacaoPage.map(SolicitacaoComercialResponseDTO::new);
    }

    public void mapDtoToEntity(SolicitacaoComercialDTO dto, SolicitacaoComercial entity) {
        Long solicitanteId = Long.valueOf(dto.solicitante());
        Integer statusId = dto.status();
        Integer processoId = dto.processo();
        Integer equipeId = dto.equipe();

        Usuario usuarioSolicitante = null;
        if (solicitanteId != null) {
            usuarioSolicitante = usuarioRepository.findById(solicitanteId)
                    .orElseThrow(() -> new RuntimeException("Solicitante não encontrado"));
        }
        entity.setSolicitante(usuarioSolicitante);

        StatusSolicitacoes statusSolicitacao = null;
        if (statusId != null) {
            statusSolicitacao = statusSolicitacoesRepository.findById(statusId)
                    .orElseThrow(() -> new RuntimeException("Status não encontrado"));
        }
        entity.setStatus(statusSolicitacao);

        Processos processoSolicitacao = null;
        if (processoId != null) {
            processoSolicitacao = processoRepository.findById(processoId)
                    .orElseThrow(() -> new RuntimeException("Processo não encontrado"));
        }
        entity.setProcesso(processoSolicitacao);

        Equipe equipeSolicitacao = null;
        if (equipeId != null) {
            equipeSolicitacao = equipeRepository.findById(equipeId)
                    .orElseThrow(() -> new RuntimeException("Equipe não encontrada"));
        }
        entity.setEquipe(equipeSolicitacao);

        entity.setObservacoes(dto.observacoes());
        entity.setDataCriacao(dto.dataCriacao());
        entity.setDataModificacao(dto.dataModificacao());
    }
}
