package com.sipel.CES.choreCadastros.contrato;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.List;

@Service
public class ContratoService {

    @Autowired
    private ContratoRepository repository;

    public Page<ContratoResponseDTO> getAllContratos(String searchTerm, Pageable pageable) {
        Page<Contrato> contratos = repository.findWithFilters(searchTerm, pageable);
        return contratos.map(ContratoResponseDTO::new);
    }

    public ContratoResponseDTO getContratoById(int id) {
        Contrato contrato = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra não encontrada"));
        return new ContratoResponseDTO(contrato);
    }

   public ContratoResponseDTO createContrato(ContratoDTO data) {
        if(repository.findByNumeroContrato(data.numeroContrato()).isPresent()) {
            throw new IllegalArgumentException("Contrato já cadastrado");
        }

        Contrato contrato = new Contrato();

        mapDtoToEntity(data, contrato);
        Contrato savedContrato = repository.save(contrato);
        return new ContratoResponseDTO(savedContrato);
   }

   public ContratoResponseDTO updateContrato(int id, ContratoDTO data) {
        Contrato contrato = repository.findByNumeroContrato(data.numeroContrato())
                .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado"));

        mapDtoToEntity(data, contrato);
        repository.save(contrato);
        return new ContratoResponseDTO(contrato);
   }

   public void deleteContrato(int id) {
        if (!repository.findById(id).isPresent()) {
            throw new EntityNotFoundException("Contrato não encontrado");
        }
        repository.deleteById(id);
   }

   private void mapDtoToEntity(ContratoDTO dto, Contrato entity) {
        entity.setNumeroContrato(dto.numeroContrato());
        entity.setDescricao(dto.descricao());
        entity.setDataInicio(dto.dataInicio());
        entity.setDataFim(dto.dataFim());
       if (entity.getId() == 0) {
           entity.setAtivo(true);
       } else {
           if (dto.ativo() != null) {
               entity.setAtivo(dto.ativo());
           }
       }
       if (entity.getDataCriacao() == null) {
           entity.setDataCriacao(OffsetDateTime.now());
       }
   }


}
