package com.sipel.CES.choreCadastros.equipes.services;


import com.sipel.CES.choreCadastros.basesOperacionais.entity.BaseOperacional;
import com.sipel.CES.choreCadastros.basesOperacionais.repository.BaseOperacionalRepository;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.coordenador.repository.CoordenadorRepository;
import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeDTO;
import com.sipel.CES.choreCadastros.equipes.DTOs.EquipeResponseDTO;
import com.sipel.CES.choreCadastros.equipes.entity.Equipe;
import com.sipel.CES.choreCadastros.equipes.repository.EquipeRepository;
import com.sipel.CES.choreCadastros.processos.entity.Processos;
import com.sipel.CES.choreCadastros.processos.repository.ProcessoRepository;
import com.sipel.CES.choreCadastros.supervisor.entity.Supervisor;
import com.sipel.CES.choreCadastros.supervisor.repository.SupervisorRepository;
import com.sipel.CES.generic.DTOs.ImportacaoResponseDTO;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
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

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class EquipeService {

    @Autowired
    private EquipeRepository repository;
    @Autowired
    private BaseOperacionalRepository baseOperacionalRepository;
    @Autowired
    private SupervisorRepository supervisorRepository;
    @Autowired
    private CoordenadorRepository coordenadorRepository;
    @Autowired
    private ProcessoRepository processoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    public EquipeResponseDTO createEquipe(EquipeDTO equipe) {
        if (repository.findByNomeEquipe(equipe.nomeEquipe()).isPresent()) {
            throw new RuntimeException("Equipe já cadastrada no banco de dados.");
        }

        Equipe equipeEntity = new Equipe();
        mapDtoToEntity(equipe, equipeEntity);
        repository.save(equipeEntity);
        return new EquipeResponseDTO(equipeEntity);
    }

    public ImportacaoResponseDTO importarEquipes(@NotNull MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        List<Equipe> equipeParaSalvar = new ArrayList<>();
        List<String> erros = new ArrayList<>();
        int linhaAtual = 1;

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) {
                rows.next();
            }

            if (!rows.hasNext()) {}

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                linhaAtual++;


                String nomeEquipe = getStringCellValue(currentRow.getCell(0));
                if (nomeEquipe == null || nomeEquipe.trim().isEmpty()) {
                    continue;
                }

                try {
                    if (repository.findByNomeEquipe(nomeEquipe).isPresent()) {
                        throw new RuntimeException("Encarregado já cadastrado.");
                    }
                    String vulgo = getStringCellValue(currentRow.getCell(1));
                    String baseOperacional = getStringCellValue(currentRow.getCell(2));
                    BaseOperacional baseEquipe = null;
                    if (baseOperacional != null && !baseOperacional.trim().isEmpty() && !"NA".equalsIgnoreCase(baseOperacional.trim())) {
                        baseEquipe = baseOperacionalRepository.findByNomeBase(baseOperacional)
                                .orElseThrow(() -> new RuntimeException("Base de equipe '" + baseOperacional + "' inválida."));
                    }

                    String processo = getStringCellValue(currentRow.getCell(3));
                    Processos processoEquipe = null;
                    if (processo != null && !processo.trim().isEmpty() && !"NA".equalsIgnoreCase(processo.trim())) {
                        processoEquipe = processoRepository.findByNomeProcesso(processo)
                                .orElseThrow(() -> new RuntimeException("Processo da equipe '" + processo + "'inválido."));
                    }

                    String usuarioCoordenador = getStringCellValue(currentRow.getCell(4));
                    Usuario coordenadorEquipe = null;
                    Coordenador coordenador = null;
                    if (usuarioCoordenador != null && !usuarioCoordenador.trim().isEmpty() && !"NA".equalsIgnoreCase(usuarioCoordenador.trim())) {
                        coordenadorEquipe = usuarioRepository.findByNomeCompleto(usuarioCoordenador)
                                .orElseThrow(() -> new RuntimeException("Coordenador da equipe '" + usuarioCoordenador + "'inválido."));
                        coordenador = coordenadorRepository.findByUsuario_nomeCompleto(coordenadorEquipe.getNomeCompleto())
                                .orElseThrow(() -> new RuntimeException("Coordenador inválido."));
                    }

                    String usuarioSupervisor = getStringCellValue(currentRow.getCell(5));
                    Usuario supervisorEquipe = null;
                    Supervisor supervisor = null;
                    if (usuarioSupervisor != null && !usuarioSupervisor.trim().isEmpty() && !"NA".equalsIgnoreCase(usuarioSupervisor.trim())) {
                        supervisorEquipe = usuarioRepository.findByNomeCompleto(usuarioSupervisor)
                                .orElseThrow(() -> new RuntimeException("Coordenador da equipe '" + usuarioSupervisor + "'inválido."));
                        supervisor = supervisorRepository.findByUsuario_nomeCompleto(supervisorEquipe.getNomeCompleto())
                                .orElseThrow(() -> new RuntimeException("Supervisor inválido."));
                    }

                    String emailCoordenacao = getStringCellValue(currentRow.getCell(6));
                    String emailAlmoxarifado = getStringCellValue(currentRow.getCell(7));

                    Equipe novaEquipe = new Equipe();
                    novaEquipe.setNomeEquipe(nomeEquipe);
                    novaEquipe.setVulgo(vulgo);
                    novaEquipe.setProcesso(processoEquipe);
                    novaEquipe.setCoordenador(coordenador);
                    novaEquipe.setSupervisor(supervisor);
                    novaEquipe.setAtivo(true);
                    novaEquipe.setBaseOperacional(baseEquipe);
                    novaEquipe.setDataCriacao(OffsetDateTime.now());
                    novaEquipe.setEmailCoordenador(emailCoordenacao);
                    novaEquipe.setEmailAlmoxarifado(emailAlmoxarifado);
                    equipeParaSalvar.add(novaEquipe);

                } catch (Exception e) {
                    erros.add("Linha " + linhaAtual + ": " + e.getMessage());
                }
            }
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao ler o arquivo Excel: " + e.getMessage());
        }

        if (!equipeParaSalvar.isEmpty()) {
            repository.saveAll(equipeParaSalvar);
        }
        return new ImportacaoResponseDTO(equipeParaSalvar.size(), erros.size(), erros);
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

    public Page<EquipeResponseDTO> getAllEquipes(Integer baseId, Integer processoId, Integer coordenadorId, Integer supervisorId, String searchTerm, Pageable pageable) {
        Page<Equipe> equipePage = repository.findWithFilters(baseId, processoId, coordenadorId, supervisorId, searchTerm, pageable);
        return equipePage.map(EquipeResponseDTO::new);
    }

    public EquipeResponseDTO getEquipeById(Integer id) {
        Equipe equipe = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipe não encontrada."));
        return new EquipeResponseDTO(equipe);
    }

    public EquipeResponseDTO updateEquipe(Integer id, EquipeDTO equipe) {
        Equipe equipeUpdated = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipe não encontrada."));

        mapDtoToEntity(equipe, equipeUpdated);
        repository.save(equipeUpdated);
        return new EquipeResponseDTO(equipeUpdated);
    }

    public void deleteEquipe(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Equipe não encontrada.");
        }

        repository.deleteById(id);
    }

    private void mapDtoToEntity(@NotNull EquipeDTO dto, @NotNull Equipe entity) {

        Integer baseOperacional = dto.baseOperacional();
        Integer processo = dto.processo();
        Integer supervisor = dto.supervisor();
        Integer coordenador = dto.coordenador();

        BaseOperacional baseEquipe = null;
        if (baseOperacional != null) {
            baseEquipe = baseOperacionalRepository.findById(baseOperacional)
                    .orElseThrow(() -> new EntityNotFoundException("Base não encontrada com o ID: " + baseOperacional));
        }

        Processos processoEquipe = null;
        if (processo != null) {
            processoEquipe = processoRepository.findById(processo)
                    .orElseThrow(() -> new RuntimeException("Processo não encontrado com o ID: " + processo));
        }

        Coordenador coordenadorEquipe = null;
        if (coordenador != null) {
            coordenadorEquipe = coordenadorRepository.findById(coordenador)
                    .orElseThrow(() -> new RuntimeException("Coordenador não encontrado com o ID: " + coordenador));
        }

        Supervisor supervisorEquipe = null;
        if (supervisor != null) {
            supervisorEquipe = supervisorRepository.findById(supervisor)
                    .orElseThrow(() -> new RuntimeException("Supervisor não encontrado com o ID: " + supervisor));
        }

        entity.setNomeEquipe(dto.nomeEquipe());
        entity.setVulgo(dto.vulgo());
        entity.setBaseOperacional(baseEquipe);
        entity.setProcesso(processoEquipe);
        entity.setCoordenador(coordenadorEquipe);
        entity.setSupervisor(supervisorEquipe);
        entity.setAtivo(true);
        entity.setDataCriacao(OffsetDateTime.now());
    }

}
