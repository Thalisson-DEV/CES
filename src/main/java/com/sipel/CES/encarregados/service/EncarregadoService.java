package com.sipel.CES.encarregados.service;

import com.sipel.CES.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.encarregados.DTO.EncarregadoDTO;
import com.sipel.CES.encarregados.DTO.EncarregadoResponseDTO;
import com.sipel.CES.encarregados.entity.Encarregado;
import com.sipel.CES.encarregados.exceptions.EncarregadoAlreadyExistException;
import com.sipel.CES.encarregados.repository.EncarregadoRepository;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import jakarta.persistence.EntityNotFoundException;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class EncarregadoService {

    @Autowired
    private EncarregadoRepository repository;
    @Autowired
    private BaseOperacionalRepository baseOperacionalRepository;

    public EncarregadoResponseDTO createEncarregado(EncarregadoDTO encarregado) {
        if (repository.findByNomeCompleto(encarregado.nomeCompleto()).isPresent()) {
            throw new EncarregadoAlreadyExistException("Encarregado já cadastrado no banco de dados.");
        }

        Encarregado encarregadoEntity = new Encarregado();
        mapDtoToEntity(encarregado, encarregadoEntity);

        Encarregado savedEncarregado = repository.save(encarregadoEntity);
        return new EncarregadoResponseDTO(savedEncarregado);
    }

    /*
    public EncarregadoResponseDTO getEncarregadoById(Integer id, EncarregadoDTO encarregado) {
        Encarregado EncarregadoValido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encarregado não encontrado."));

        mapDtoToEntity(encarregado, EncarregadoValido);
        return new EncarregadoResponseDTO(EncarregadoValido);
    }
     */

    public Page<EncarregadoResponseDTO> getAllEncarregados(Integer baseId, String searchTerm, Pageable pageable) {
        Page<Encarregado> encarregadoPage = repository.findWithFilters(baseId, searchTerm, pageable);
        return encarregadoPage.map(EncarregadoResponseDTO::new);
    }

    public EncarregadoResponseDTO updateEncarregado(Integer id, EncarregadoDTO encarregado) {
        Encarregado EncarregadoValido = repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Encarregado não encontrado."));

        mapDtoToEntity(encarregado, EncarregadoValido);
        Encarregado updatedEncarregado = repository.save(EncarregadoValido);
        return new EncarregadoResponseDTO(updatedEncarregado);
    }

    public void deleteEncarregado(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Encarregado não encontrado.");
        }

        repository.deleteById(id);
    }

    public ImportacaoResponseDTO importarEncarregados(@NotNull MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        List<Encarregado> encarregadoParaSalvar = new ArrayList<>();
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
                String nomeCompleto = getStringCellValue(currentRow.getCell(0));
                if (nomeCompleto == null || nomeCompleto.trim().isEmpty()) {
                    continue; // Pula para a próxima iteração do loop
                }

                try {
                    String vulgo = getStringCellValue(currentRow.getCell(1));
                    String baseOperacional = getStringCellValue(currentRow.getCell(2));
                    if (repository.findByNomeCompleto(nomeCompleto).isPresent()) {
                        throw new RuntimeException("Encarregado já cadastrado.");
                    }

                    BaseOperacional baseEncarregado = null;
                    if (baseOperacional != null && !baseOperacional.trim().isEmpty() && !"NA".equalsIgnoreCase(baseOperacional.trim())) {
                        baseEncarregado = baseOperacionalRepository.findByNomeBase(baseOperacional)
                                .orElseThrow(() -> new RuntimeException("Base de Obra '" + baseOperacional + "' inválida."));
                    }

                    Encarregado novoEncarregado = new Encarregado();
                    novoEncarregado.setNomeCompleto(nomeCompleto);
                    novoEncarregado.setVulgo(vulgo);
                    novoEncarregado.setAtivo(true);
                    novoEncarregado.setBaseOperacional(baseEncarregado);
                    novoEncarregado.setDataCriacao(OffsetDateTime.now());
                    encarregadoParaSalvar.add(novoEncarregado);

                } catch (Exception e) {
                    erros.add("Linha " + linhaAtual + ": " + e.getMessage());
                }
            }
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao ler o arquivo Excel: " + e.getMessage());
        }

        if (!encarregadoParaSalvar.isEmpty()) {
            repository.saveAll(encarregadoParaSalvar);
        }
        return new ImportacaoResponseDTO(encarregadoParaSalvar.size(), erros.size(), erros);
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


    private void mapDtoToEntity(@NotNull EncarregadoDTO dto, @NotNull Encarregado entity) {

        Integer baseOperacional = dto.baseOperacional();

        BaseOperacional baseObra = null;
        if (baseOperacional != null) {
            baseObra = baseOperacionalRepository.findById(baseOperacional)
                    .orElseThrow(() -> new EntityNotFoundException("Base da Obra não encontrada com o ID: " + baseOperacional));
        }

        entity.setNomeCompleto(dto.nomeCompleto());
        entity.setBaseOperacional(baseObra);
        entity.setVulgo(dto.vulgo());
        entity.setDataCriacao(OffsetDateTime.now());
        entity.setAtivo(true);

        if (entity.getDataCriacao() == null) {
            entity.setDataCriacao(OffsetDateTime.now());
        }
    }
}
