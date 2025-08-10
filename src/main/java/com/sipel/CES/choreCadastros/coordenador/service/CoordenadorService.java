package com.sipel.CES.choreCadastros.coordenador.service;

import com.sipel.CES.choreCadastros.coordenador.DTOs.CoordenadorDTO;
import com.sipel.CES.choreCadastros.coordenador.DTOs.CoordenadorResponseDTO;
import com.sipel.CES.choreCadastros.coordenador.entity.Coordenador;
import com.sipel.CES.choreCadastros.coordenador.repository.CoordenadorRepository;
import com.sipel.CES.users.entity.Usuario;
import com.sipel.CES.users.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class CoordenadorService {

    @Autowired
    private CoordenadorRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public CoordenadorResponseDTO createCoordenador(CoordenadorDTO data) {
        Coordenador coordenador = new Coordenador();

        mapDtoToEntity(data, coordenador);
        repository.save(coordenador);
        return new CoordenadorResponseDTO(coordenador);
    }

    public Page<CoordenadorResponseDTO> getAllCoordenadores(Integer coordenadorId, String searchTerm, Pageable pageable) {
        Page<Coordenador> coordenadores = repository.findWithFilters(coordenadorId, searchTerm, pageable);
        return coordenadores.map(CoordenadorResponseDTO::new);
    }

    public CoordenadorResponseDTO updateCoordenador(Integer id, CoordenadorDTO data) {
        Coordenador coordenador = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coordenador não encontrado com o id: " + id));

        mapDtoToEntity(data, coordenador);
        repository.save(coordenador);
        return new CoordenadorResponseDTO(coordenador);
    }

    public void deleteCoordenador(Integer id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Coordenador não encontrado com o id: " + id);
        }
        repository.deleteById(id);
    }


    public void mapDtoToEntity(@NotNull CoordenadorDTO dto, @NotNull Coordenador entity) {

        Long usuarioId = dto.usuarioId();
        Usuario usuarioCoordenador = null;
        if (usuarioId != null) {
            usuarioCoordenador = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Coordenador não encontrado com o id: " + usuarioId));
        }

        entity.setUsuario(usuarioCoordenador);
        entity.setAtivo(true);
        entity.setDataCriacao(OffsetDateTime.now());


    }


}
