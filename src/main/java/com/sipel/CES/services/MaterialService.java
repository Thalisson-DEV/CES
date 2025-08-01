package com.sipel.CES.services;

import java.util.List;
import java.util.stream.Collectors;

import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sipel.CES.DTOs.MaterialDTO;
import com.sipel.CES.DTOs.MaterialResponseDTO;
import com.sipel.CES.models.Material;
import com.sipel.CES.repositories.MaterialRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository repository;

    public List<MaterialResponseDTO> getAllMaterials() {
        return repository.findAll().stream()
                .map(MaterialResponseDTO::new)
                .collect(Collectors.toList());
    }

    public MaterialResponseDTO getMaterialById(Integer id) {
        Material material = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material não encontrado"));
        return new MaterialResponseDTO(material);
    }

    public MaterialResponseDTO getMaterialByCodigo(String codigoMaterial) {
        Material material = repository.findByCodigoMaterial(codigoMaterial)
                .orElseThrow(() -> new EntityNotFoundException("Material não encontrado"));
        return new MaterialResponseDTO(material);
    }

    public MaterialResponseDTO createMaterial(MaterialDTO data) {
        Material material = new Material();

        mapDtoToEntity(data, material);

        Material savedMaterial = repository.save(material);
        return new MaterialResponseDTO(savedMaterial);
    }

    public MaterialResponseDTO updateMaterial(Integer id, MaterialDTO data) {
        Material material = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material não encontrado"));

        mapDtoToEntity(data, material);

        Material updatedMaterial = repository.save(material);
        return new MaterialResponseDTO(updatedMaterial);
    }

    public void deleteMaterial(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Material não encontrado");
        }
        repository.deleteById(id);
    }

    private void mapDtoToEntity(@NotNull MaterialDTO dto, @NotNull Material entity) {
        entity.setCodigoMaterial(dto.codigoMaterial());
        entity.setNomeMaterial(dto.nomeMaterial());
        entity.setDescricao(dto.descricao());
        entity.setUnidadeMedida(dto.unidadeMedida());
        entity.setSuprMatrEnum(dto.suprMatr());
        entity.setAvaliacao(dto.avaliacao());
        entity.setCentro(dto.centro());
    }
}