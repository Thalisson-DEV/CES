package com.sipel.CES.comercial.solicitacoesItems.service;

import com.sipel.CES.choreCadastros.StatusSolicitacoes.entity.StatusSolicitacoes;
import com.sipel.CES.choreCadastros.StatusSolicitacoes.repository.StatusSolicitacoesRepository;
import com.sipel.CES.choreCadastros.materiais.entity.Material;
import com.sipel.CES.choreCadastros.materiais.repository.MaterialRepository;
import com.sipel.CES.comercial.solicitacoes.entity.SolicitacaoComercial;
import com.sipel.CES.comercial.solicitacoes.repository.SolicitacaoComercialRepository;
import com.sipel.CES.comercial.solicitacoesItems.DTOs.SolicitacaoComercialItemsDTO;
import com.sipel.CES.comercial.solicitacoesItems.DTOs.SolicitacaoComercialItemsResponseDTO;
import com.sipel.CES.comercial.solicitacoesItems.entity.SolicitacaoComercialItems;
import com.sipel.CES.comercial.solicitacoesItems.repository.SolicitacaoComercialItemsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SolicitacaoComercialItemsService {

    @Autowired
    private SolicitacaoComercialItemsRepository itemsRepository;
    @Autowired
    private SolicitacaoComercialRepository solicitacaoRepository;
    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private StatusSolicitacoesRepository statusSolicitacoesRepository;


    public List<SolicitacaoComercialItemsResponseDTO> getItemsBySolicitacaoId(Integer solicitacaoId) {
        return itemsRepository.findBySolicitacaoComercialId_Id(solicitacaoId).stream()
                .map(SolicitacaoComercialItemsResponseDTO::new)
                .collect(Collectors.toList());
    }

    public SolicitacaoComercialItemsResponseDTO addItem(Integer solicitacaoId, SolicitacaoComercialItemsDTO itemDto) {
        var solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada com o ID: " + solicitacaoId));
        var material = materialRepository.findById(itemDto.materialId())
                .orElseThrow(() -> new EntityNotFoundException("Material não encontrado com o ID: " + itemDto.materialId()));

        SolicitacaoComercialItems newItem = new SolicitacaoComercialItems();
        newItem.setSolicitacaoComercialId(solicitacao);
        newItem.setMaterialId(material);
        newItem.setQuantidadeSolicitada(itemDto.quantidadeSolicitada());
        newItem.setQuantidadeAtendida(BigDecimal.ZERO);
        newItem.setDataModificacao(OffsetDateTime.now());

        itemsRepository.save(newItem);
        return new SolicitacaoComercialItemsResponseDTO(newItem);
    }

    public void deleteItem(Integer itemId) {
        if (!itemsRepository.existsById(itemId)) {
            throw new EntityNotFoundException("Item não encontrado com o ID: " + itemId);
        }
        itemsRepository.deleteById(itemId);
    }

    @Transactional
    public List<SolicitacaoComercialItemsResponseDTO> atenderItens(Integer solicitacaoId, List<Integer> itemIds) {
        List<SolicitacaoComercialItems> itensParaAtender;

        if (itemIds == null || itemIds.isEmpty()) {
            itensParaAtender = itemsRepository.findBySolicitacaoComercialId_Id(solicitacaoId);
        } else {
            itensParaAtender = itemsRepository.findAllById(itemIds);
        }

        if (itensParaAtender.isEmpty()) {
            throw new EntityNotFoundException("Nenhum item válido encontrado para atendimento.");
        }

        StatusSolicitacoes statusAtendido = statusSolicitacoesRepository.findById(2) // Assumindo ID 2 = Aprovada
                .orElseThrow(() -> new RuntimeException("Status 'Aprovada' (ID 2) não encontrado."));

        for (SolicitacaoComercialItems item : itensParaAtender) {
            if (item.getSolicitacaoComercialId().getId() != solicitacaoId) {
                throw new SecurityException("Tentativa de atender item de outra solicitação.");
            }
            item.setQuantidadeAtendida(item.getQuantidadeSolicitada());
            item.setStatusId(statusAtendido);
            item.setDataModificacao(OffsetDateTime.now());
        }

        itemsRepository.saveAll(itensParaAtender);

        // NOVO: Chama o método para atualizar o status principal
        atualizarStatusDaSolicitacaoPrincipal(solicitacaoId);

        return itensParaAtender.stream()
                .map(SolicitacaoComercialItemsResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<SolicitacaoComercialItemsResponseDTO> rejeitarItens(Integer solicitacaoId, List<Integer> itemIds) {
        List<SolicitacaoComercialItems> itensParaRejeitar;

        if (itemIds == null || itemIds.isEmpty()) {
            itensParaRejeitar = itemsRepository.findBySolicitacaoComercialId_Id(solicitacaoId);
        } else {
            itensParaRejeitar = itemsRepository.findAllById(itemIds);
        }

        if (itensParaRejeitar.isEmpty()) {
            throw new EntityNotFoundException("Nenhum item válido encontrado para rejeição.");
        }

        StatusSolicitacoes statusRejeitado = statusSolicitacoesRepository.findById(3) // Assumindo ID 3 = Recusada
                .orElseThrow(() -> new RuntimeException("Status 'Recusada' (ID 3) não encontrado."));

        for (SolicitacaoComercialItems item : itensParaRejeitar) {
            if (item.getSolicitacaoComercialId().getId() != solicitacaoId) {
                throw new SecurityException("Tentativa de rejeitar item de outra solicitação.");
            }
            item.setQuantidadeAtendida(BigDecimal.ZERO);
            item.setStatusId(statusRejeitado);
            item.setDataModificacao(OffsetDateTime.now());
        }

        itemsRepository.saveAll(itensParaRejeitar);

        // NOVO: Chama o método para atualizar o status principal
        atualizarStatusDaSolicitacaoPrincipal(solicitacaoId);

        return itensParaRejeitar.stream()
                .map(SolicitacaoComercialItemsResponseDTO::new)
                .collect(Collectors.toList());
    }


    private void atualizarStatusDaSolicitacaoPrincipal(Integer solicitacaoId) {
        SolicitacaoComercial solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada para atualização de status."));

        List<SolicitacaoComercialItems> itens = itemsRepository.findBySolicitacaoComercialId_Id(solicitacaoId);

        if (itens.isEmpty()) {
            StatusSolicitacoes statusCancelado = statusSolicitacoesRepository.findById(6)
                    .orElseThrow(() -> new RuntimeException("Status 'Cancelada' não encontrado."));
            solicitacao.setStatus(statusCancelado);
        } else {
            boolean todosAtendidos = itens.stream()
                    .allMatch(item -> "Aprovada".equalsIgnoreCase(item.getStatusId().getNomeStatus()));

            if (todosAtendidos) {
                StatusSolicitacoes statusTotal = statusSolicitacoesRepository.findById(2)
                        .orElseThrow(() -> new RuntimeException("Status 'Aprovado' não encontrado."));
                solicitacao.setStatus(statusTotal);
            } else {
                StatusSolicitacoes statusPendente = statusSolicitacoesRepository.findById(3)
                        .orElseThrow(() -> new RuntimeException("Status 'Pendente' não encontrado."));
                solicitacao.setStatus(statusPendente);
            }
        }

        solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public List<SolicitacaoComercialItemsResponseDTO> syncItems(Integer solicitacaoId, List<SolicitacaoComercialItemsDTO> dtos) {
        SolicitacaoComercial solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Solicitação não encontrada com o ID: " + solicitacaoId));

        Map<Integer, SolicitacaoComercialItemsDTO> dtoMap = dtos.stream()
                .collect(Collectors.toMap(SolicitacaoComercialItemsDTO::materialId, Function.identity()));

        Map<Integer, SolicitacaoComercialItems> existingItemsMap = itemsRepository.findBySolicitacaoComercialId_Id(solicitacaoId).stream()
                .collect(Collectors.toMap(item -> item.getMaterialId().getId(), Function.identity()));

        List<SolicitacaoComercialItems> itemsToRemove = existingItemsMap.values().stream()
                .filter(item -> !dtoMap.containsKey(item.getMaterialId().getId()))
                .collect(Collectors.toList());
        itemsRepository.deleteAll(itemsToRemove);

        for (SolicitacaoComercialItemsDTO dto : dtos) {
            SolicitacaoComercialItems item = existingItemsMap.get(dto.materialId());

            if (item != null) {
                item.setQuantidadeSolicitada(dto.quantidadeSolicitada());
                item.setDataModificacao(OffsetDateTime.now());
                itemsRepository.save(item);
            } else {
                Material material = materialRepository.findById(dto.materialId())
                        .orElseThrow(() -> new EntityNotFoundException("Material não encontrado com o ID: " + dto.materialId()));

                StatusSolicitacoes statusSolicitacao = statusSolicitacoesRepository.findById(1)
                        .orElseThrow(() -> new EntityNotFoundException("Status não encontrado com o ID: " + 1));

                SolicitacaoComercialItems newItem = new SolicitacaoComercialItems();
                newItem.setSolicitacaoComercialId(solicitacao);
                newItem.setStatusId(statusSolicitacao);
                newItem.setMaterialId(material);
                newItem.setQuantidadeSolicitada(dto.quantidadeSolicitada());
                newItem.setQuantidadeAtendida(BigDecimal.ZERO);
                newItem.setDataModificacao(OffsetDateTime.now());
                itemsRepository.save(newItem);
            }
        }

        return getItemsBySolicitacaoId(solicitacaoId);
    }
}