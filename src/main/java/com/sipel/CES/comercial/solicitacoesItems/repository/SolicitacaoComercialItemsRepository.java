package com.sipel.CES.comercial.solicitacoesItems.repository;

import com.sipel.CES.comercial.solicitacoesItems.entity.SolicitacaoComercialItems;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitacaoComercialItemsRepository extends JpaRepository<SolicitacaoComercialItems, Integer> {
    List<SolicitacaoComercialItems> findBySolicitacaoComercialId_Id(Integer solicitacaoId);
}
