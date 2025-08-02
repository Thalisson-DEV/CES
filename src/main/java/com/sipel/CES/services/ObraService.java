package com.sipel.CES.services;

import com.sipel.CES.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.DTOs.ObraDTO;
import com.sipel.CES.DTOs.ObraResponseDTO;
import com.sipel.CES.exceptions.ObraException;
import com.sipel.CES.models.BaseOperacional;
import com.sipel.CES.models.Obra;
import com.sipel.CES.models.StatusObra;
import com.sipel.CES.repositories.BaseOperacionalRepository;
import com.sipel.CES.repositories.ObraRepository;
import com.sipel.CES.repositories.StatusObraRepository;
import jakarta.persistence.EntityNotFoundException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ObraService {

    @Autowired
    ObraRepository repository;

    @Autowired
    BaseOperacionalRepository BaseOperacionalRepository;

    @Autowired
    StatusObraRepository StatusObraRepository;

    public List<ObraResponseDTO> getAllObras() {
        return repository.findAll().stream()
                .map(ObraResponseDTO::new)
                .collect(Collectors.toList());
    }

    public ObraResponseDTO getObraById(Integer id){
        Obra obra = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra não encontrada"));
        return new ObraResponseDTO(obra);
    }

    public ObraResponseDTO getObraByNumero(String numeroObra){
        Obra obra = repository.findByNumeroObra(numeroObra)
                .orElseThrow(() -> new EntityNotFoundException("Obra não encontrada"));
        return new ObraResponseDTO(obra);
    }

    public ObraResponseDTO createObra(ObraDTO data) {
        if (repository.findByNumeroObra(data.numeroObra()).isPresent() ) {
            throw new ObraException("Obra já Cadastrada");
        }

        Obra obra = new Obra();

        mapDtoToEntity(data, obra);

        Obra savedObra = repository.save(obra);
        return new ObraResponseDTO(savedObra);
    }

    public ObraResponseDTO updateObra(Integer id, ObraDTO data) {
        Obra obra = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra não encontrada"));

        mapDtoToEntity(data, obra);
        Obra updatedObra = repository.save(obra);
        return new ObraResponseDTO(updatedObra);
    }

    public void deleteObra(Integer id){
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Obra não encontrada");
        }
        repository.deleteById(id);
    }

    public ImportacaoResponseDTO importarObras(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        List<Obra> obrasParaSalvar = new ArrayList<>();
        List<String> erros = new ArrayList<>();
        int linhaAtual = 1;

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                linhaAtual++;

                try {
                    String numeroObra = getStringCellValue(currentRow.getCell(0));
                    String titulo = getStringCellValue(currentRow.getCell(1));
                    String statusNome = getStringCellValue(currentRow.getCell(2));
                    String baseObraNome = getStringCellValue(currentRow.getCell(3));
                    String baseSaqueNome = getStringCellValue(currentRow.getCell(4));
                    LocalDate dataInicio = getDateCellValue(currentRow.getCell(5));
                    LocalDate dataFim = getDateCellValue(currentRow.getCell(6));

                    // --- VALIDAÇÕES DE NEGÓCIO ---
                    if (repository.findByNumeroObra(numeroObra).isPresent()) {
                        throw new RuntimeException("Número de obra já cadastrado.");
                    }

                    // "Tradução" dos nomes para entidades do banco
                    StatusObra status = StatusObraRepository.findByNomeStatus(statusNome)
                            .orElseThrow(() -> new RuntimeException("Status '" + statusNome + "' inválido."));

                    BaseOperacional baseObra = BaseOperacionalRepository.findByNomeBase(baseObraNome)
                            .orElseThrow(() -> new RuntimeException("Base de Obra '" + baseObraNome + "' inválida."));

                    BaseOperacional baseSaque = BaseOperacionalRepository.findByNomeBase(baseSaqueNome)
                            .orElseThrow(() -> new RuntimeException("Base de Saque '" + baseSaqueNome + "' inválida."));


                    Obra novaObra = new Obra();
                    novaObra.setNumeroObra(numeroObra);
                    novaObra.setTitulo(titulo);
                    novaObra.setStatusObra(status);
                    novaObra.setBaseObra(baseObra);
                    novaObra.setBaseSaque(baseSaque);
                    novaObra.setDataInicio(dataInicio);
                    novaObra.setDataFim(dataFim);
                    novaObra.setAtivo(true);

                    obrasParaSalvar.add(novaObra);

                } catch (Exception e) {
                    erros.add("Linha " + linhaAtual + ": " + e.getMessage());
                }
            }
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao ler o arquivo Excel: " + e.getMessage());
        }

        if (!obrasParaSalvar.isEmpty()) {
            repository.saveAll(obrasParaSalvar);
        }


        return new ImportacaoResponseDTO(obrasParaSalvar.size(), erros.size(), erros);
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
        if (cell == null || cell.getStringCellValue().isEmpty()) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return LocalDate.parse(cell.getStringCellValue(), formatter);
    }

    private void mapDtoToEntity(@NotNull ObraDTO dto, @NotNull Obra entity) {

        Integer baseObraId = dto.baseObra();
        Integer baseSaqueId = dto.baseSaque();
        Integer statusObraId = dto.statusObra();


        StatusObra statusObra = StatusObraRepository.findById(statusObraId)
                .orElseThrow(() -> new EntityNotFoundException("Status não encontrado com o ID: " + statusObraId));

        BaseOperacional baseObra = BaseOperacionalRepository.findById(baseObraId)
                .orElseThrow(() -> new EntityNotFoundException("Base da Obra não encontrada com o ID: " + baseObraId));

        BaseOperacional baseSaque = BaseOperacionalRepository.findById(baseSaqueId)
                .orElseThrow(() -> new EntityNotFoundException("Base de Saque não encontrada com o ID: " + baseSaqueId));

        entity.setNumeroObra(dto.numeroObra());
        entity.setTitulo(dto.titulo());
        entity.setBaseObra(baseObra);
        entity.setBaseSaque(baseSaque);
        entity.setDataInicio(dto.dataInicio());
        entity.setDataFim(dto.dataFim());
        entity.setStatusObra(statusObra);
        entity.setDataCriacao(OffsetDateTime.now());
    }
}
