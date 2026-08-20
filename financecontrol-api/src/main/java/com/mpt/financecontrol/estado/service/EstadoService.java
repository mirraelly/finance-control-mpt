package com.mpt.financecontrol.estado.service;

import com.mpt.financecontrol.estado.dtos.EstadoCreateDto;
import com.mpt.financecontrol.estado.dtos.EstadoResponseDto;
import com.mpt.financecontrol.estado.dtos.EstadoUpdateDto;
import com.mpt.financecontrol.estado.entity.Estado;
import com.mpt.financecontrol.estado.mapper.EstadoMapper;
import com.mpt.financecontrol.estado.repository.EstadoRepository;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EstadoService {

    private final EstadoRepository repository;

    public EstadoService(EstadoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Estado findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estado não encontrado"));
    }

    @Transactional(readOnly = true)
    public EstadoResponseDto findByIdResponse(UUID id) {
        return EstadoMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<EstadoResponseDto> getAll(Pageable pageable, String nome, String sigla, Integer codigoIbge, Boolean ativo) {
        return repository.findAllWithFilters(pageable, nome, sigla, codigoIbge, ativo)
                .map(EstadoMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<EstadoResponseDto> select() {
        return repository.findForSelect()
                .stream()
                .map(EstadoMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public EstadoResponseDto create(EstadoCreateDto dto) {
        if (repository.existsBySiglaIgnoreCase(dto.sigla()))
            throw new ConflictException("Já existe um estado com essa sigla");

        Estado estado = new Estado();
        estado.setNome(dto.nome());
        estado.setSigla(dto.sigla().toUpperCase());
        estado.setCodigoIbge(dto.codigoIbge());
        if (dto.ativo() != null)
            estado.setAtivo(dto.ativo());

        return EstadoMapper.toResponseDto(repository.save(estado));
    }

    @Transactional
    public EstadoResponseDto update(UUID id, EstadoUpdateDto dto) {
        Estado estado = findById(id);

        if (dto.sigla() != null && !dto.sigla().isBlank()) {
            repository.findBySiglaIgnoreCase(dto.sigla())
                    .filter(existente -> !existente.getId().equals(id))
                    .ifPresent(e -> {
                        throw new ConflictException("Já existe outro estado com essa sigla");
                    });
            estado.setSigla(dto.sigla().toUpperCase());
        }

        if (dto.nome() != null && !dto.nome().isBlank())
            estado.setNome(dto.nome());

        if (dto.codigoIbge() != null)
            estado.setCodigoIbge(dto.codigoIbge());

        if (dto.ativo() != null)
            estado.setAtivo(dto.ativo());

        return EstadoMapper.toResponseDto(repository.save(estado));
    }
}
