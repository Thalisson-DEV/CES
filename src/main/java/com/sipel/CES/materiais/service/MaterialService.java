package com.sipel.CES.materiais.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.generic.entitys.SuprMatrEnum;
import com.sipel.CES.materiais.DTOs.MaterialDTO;
import com.sipel.CES.materiais.DTOs.MaterialResponseDTO;
import com.sipel.CES.materiais.entity.Material;
import com.sipel.CES.materiais.repository.MaterialRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository repository;

    public Page<MaterialResponseDTO> getAllMaterials(String suprMatr, String avaliacao, String centro, String searchTerm, Pageable pageable) {
        Page<Material> materialPage = repository.findWithFilters(suprMatr, avaliacao, centro, searchTerm, pageable);
        return materialPage.map(MaterialResponseDTO::new);
    }

    /**
    public List<MaterialResponseDTO> getAllMaterials() {
        return repository.findAll().stream()
                .map(MaterialResponseDTO::new)
                .collect(Collectors.toList());
    }
     **/

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

    public ImportacaoResponseDTO importarMateriais(@NotNull MultipartFile file) {
        if (file.isEmpty()) {
            System.out.println("DEBUG: O arquivo enviado está vazio.");
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        System.out.println("DEBUG: Iniciando processamento do arquivo: " + file.getOriginalFilename());
        List<Material> materialParaSalvar = new ArrayList<>();
        List<String> erros = new ArrayList<>();
        int linhaAtual = 1;

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) {
                rows.next(); // Pula o cabeçalho
            }

            if (!rows.hasNext()) {
                System.out.println("DEBUG: O arquivo não contém linhas de dados após o cabeçalho.");
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                linhaAtual++;

                // Se estiver, considera a linha como vazia e pula para a próxima.
                String codigoMaterial = getStringCellValue(currentRow.getCell(0));
                if (codigoMaterial == null || codigoMaterial.trim().isEmpty()) {
                    continue; // Pula para a próxima iteração do loop
                }

                try {
                    System.out.println("DEBUG: Lendo linha " + linhaAtual + " para o Material: " + codigoMaterial);
                    String nomeMaterial = getStringCellValue(currentRow.getCell(1));
                    String descricao = getStringCellValue(currentRow.getCell(2));
                    String unidadeMedida = getStringCellValue(currentRow.getCell(3));
                    String suprMatrEnumStr = getStringCellValue(currentRow.getCell(4)); // Renomeado para clareza
                    String avaliacao = getStringCellValue(currentRow.getCell(5));
                    String centro = getStringCellValue(currentRow.getCell(6));


                    if (repository.findByCodigoMaterial(codigoMaterial).isPresent()) {
                        throw new RuntimeException("Codigo de material já cadastrado.");
                    }

                    // Validação para campos obrigatórios que são Enums
                    if (suprMatrEnumStr.trim().isEmpty()) {
                        throw new IllegalArgumentException("O tipo Supr/Matr não pode estar vazio.");
                    }

                    Material novoMaterial = new Material();
                    novoMaterial.setCodigoMaterial(codigoMaterial);
                    novoMaterial.setNomeMaterial(nomeMaterial);
                    novoMaterial.setDescricao(descricao);
                    novoMaterial.setUnidadeMedida(unidadeMedida);

                    String suprMatrMaiusculo = suprMatrEnumStr.toUpperCase();
                    novoMaterial.setSuprMatrEnum(SuprMatrEnum.valueOf(suprMatrMaiusculo));

                    novoMaterial.setAvaliacao(avaliacao);
                    novoMaterial.setCentro(centro);

                    materialParaSalvar.add(novoMaterial);
                    System.out.println("DEBUG: Linha " + linhaAtual + " validada com sucesso.");

                } catch (Exception e) {
                    System.out.println("DEBUG: ERRO na linha " + linhaAtual + ": " + e.getMessage());
                    erros.add("Linha " + linhaAtual + ": " + e.getMessage());
                }
            }
            workbook.close();
        } catch (Exception e) {
            System.out.println("DEBUG: Falha crítica ao ler o arquivo: " + e.getMessage());
            throw new RuntimeException("Falha ao ler o arquivo Excel: " + e.getMessage());
        }

        if (!materialParaSalvar.isEmpty()) {
            repository.saveAll(materialParaSalvar);
        }

        System.out.println("DEBUG: Processamento finalizado. Sucessos: " + materialParaSalvar.size() + ", Falhas: " + erros.size());
        return new ImportacaoResponseDTO(materialParaSalvar.size(), erros.size(), erros);
    }



    private String getStringCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return "";
        }
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