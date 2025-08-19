package com.sipel.CES.choreCadastros.contrato;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContratoService {

    @Autowired
    private ContratoRepository repository;

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
        entity.setAtivo(dto.ativo());
        entity.setDataCriacao(dto.dataCriacao());
   }


}
