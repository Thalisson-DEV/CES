package com.sipel.CES.choreCadastros.servicos.service;

import com.sipel.CES.choreCadastros.contrato.entity.Contrato;
import com.sipel.CES.choreCadastros.contrato.repository.ContratoRepository;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.processos.repository.ProcessoRepository;
import com.sipel.CES.choreCadastros.servicos.DTOs.ServicosDTO;
import com.sipel.CES.choreCadastros.servicos.DTOs.ServicosResponseDTO;
import com.sipel.CES.choreCadastros.servicos.entity.Servicos;
import com.sipel.CES.choreCadastros.servicos.repository.ServicosRepository;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ServicosService {

    @Autowired
    private ServicosRepository repository;
    @Autowired
    private ContratoRepository contratoRepository;
    @Autowired
    private ProcessoRepository processoRepository;

    public ServicosResponseDTO getServicosById(Integer id) {
        Servicos servicos = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado."));
        return new ServicosResponseDTO(servicos);
    }

    public ServicosResponseDTO createServico(ServicosDTO data) {
        if (repository.findByCodigoServico(data.codigoServico()).isPresent()) {
            throw new IllegalArgumentException("Serviço já cadastrado.");
        }

        Servicos servico = new Servicos();
        mapDtoToEntity(data, servico);
        repository.save(servico);
        return new ServicosResponseDTO(servico);
    }

    public ServicosResponseDTO updateServico(Integer id, ServicosDTO data) {
        Servicos servico = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado."));

        mapDtoToEntity(data, servico);
        repository.save(servico);
        return new ServicosResponseDTO(servico);
    }

    public void deleteServico(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Serviço não encontrado.");
        }
        repository.deleteById(id);
    }

    public Page<ServicosResponseDTO> getAllServicos(Integer contratoId, Integer processoId, String searchTerm, Pageable pageable) {
        Page<Servicos> servicosPage = repository.findWithFilters(contratoId, processoId, searchTerm, pageable);
        return servicosPage.map(ServicosResponseDTO::new);
    }

    public ImportacaoResponseDTO importarServicos(@NotNull MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        List<Servicos> servicosParaSalvar = new ArrayList<>();
        List<String> erros = new ArrayList<>();
        int linhaAtual = 1;

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) {
                rows.next();
            }

            if (!rows.hasNext()) {
                throw new IOException("O arquivo não possui linhas disponíveis para leitura.");
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                linhaAtual++;

                try {
                    String codigoServico = getStringCellValue(currentRow.getCell(0));
                    String descricao = getStringCellValue(currentRow.getCell(1));
                    String unidadeMedida = getStringCellValue(currentRow.getCell(2));
                    String grupoMercadoria = getStringCellValue(currentRow.getCell(3));
                    String processoNome = getStringCellValue(currentRow.getCell(4));
                    String contratoNome = getStringCellValue(currentRow.getCell(5));
                    String valorReferenciaString = getStringCellValue(currentRow.getCell(6));
                    String textoLongo = getStringCellValue(currentRow.getCell(7));

                    BigDecimal valorReferencia = new BigDecimal(valorReferenciaString);

                    if (repository.findByCodigoServico(codigoServico).isPresent()) {
                        throw new IllegalArgumentException("Serviço já cadastrado.");
                    }

                    Processos processo = processoRepository.findByNomeProcesso(processoNome)
                            .orElseThrow(() -> new EntityNotFoundException("Processo " + processoNome + "' Invalido."));

                    Contrato contrato = contratoRepository.findByNumeroContrato(contratoNome)
                            .orElseThrow(() -> new EntityNotFoundException("Contrato " + contratoNome + "' Invalido."));

                    Servicos novoServico = new Servicos();
                    novoServico.setCodigoServico(codigoServico);
                    novoServico.setDescricao(descricao);
                    novoServico.setUnidadeMedida(unidadeMedida);
                    novoServico.setGrupoMercadoria(grupoMercadoria);
                    novoServico.setContrato(contrato);
                    novoServico.setProcesso(processo);
                    novoServico.setValorReferencia(valorReferencia);
                    novoServico.setTextoLongo(textoLongo);
                    novoServico.setAtivo(true);
                    novoServico.setDataCriacao(OffsetDateTime.now());

                    servicosParaSalvar.add(novoServico);
                } catch (Exception e) {
                    erros.add("Linha " + linhaAtual + ": " + e.getMessage());
                }
            }
            workbook.close();
        } catch (IOException e) {
            throw new RuntimeException("Falha ao ler o arquivo Excel: " + e.getMessage());
        }

        if (!servicosParaSalvar.isEmpty()) {
            repository.saveAll(servicosParaSalvar);
        }

        return new ImportacaoResponseDTO(servicosParaSalvar.size(), erros.size(), erros);
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

    private LocalDate getDateCellValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                String dateString = cell.getStringCellValue();
                if (dateString.isEmpty()) return null;
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                return LocalDate.parse(dateString, formatter);

            case NUMERIC:
                return cell.getLocalDateTimeCellValue().toLocalDate();

            default:
                return null;
        }
    }

    public void mapDtoToEntity(ServicosDTO dto, Servicos entity) {
        Integer processoId = dto.processo();
        Integer contratoId = dto.contrato();

        Processos processo = null;
        if (processoId != null) {
            processo = processoRepository.findById(processoId)
                    .orElseThrow(() -> new EntityNotFoundException("Processo não encontrado para o id: " + processoId));
        }

        Contrato contrato = null;
        if(contratoId != null) {
            contrato = contratoRepository.findById(contratoId)
                    .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado para o id: " + contratoId));
        }

        entity.setCodigoServico(dto.codigoServico());
        entity.setDescricao(dto.descricao());
        entity.setUnidadeMedida(dto.unidadeMedida());
        entity.setGrupoMercadoria(dto.grupoMercadoria());
        entity.setProcesso(processo);
        entity.setContrato(contrato);
        entity.setValorReferencia(dto.valorReferencia());
        entity.setTextoLongo(dto.textoLongo());
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
