package com.mpt.financecontrol.cidade.service;

import com.mpt.financecontrol.cidade.dtos.CidadeCreateDto;
import com.mpt.financecontrol.cidade.dtos.CidadeResponseDto;
import com.mpt.financecontrol.cidade.dtos.CidadeUpdateDto;
import com.mpt.financecontrol.cidade.entity.Cidade;
import com.mpt.financecontrol.cidade.mapper.CidadeMapper;
import com.mpt.financecontrol.cidade.repository.CidadeRepository;
import com.mpt.financecontrol.estado.entity.Estado;
import com.mpt.financecontrol.estado.service.EstadoService;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CidadeService {

    private final CidadeRepository repository;
    private final EstadoService estadoService;

    public CidadeService(CidadeRepository repository, EstadoService estadoService) {
        this.repository = repository;
        this.estadoService = estadoService;
    }

    @Transactional(readOnly = true)
    public Cidade findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cidade não encontrada"));
    }

    @Transactional(readOnly = true)
    public CidadeResponseDto findByIdResponse(UUID id) {
        return CidadeMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<CidadeResponseDto> getAll(Pageable pageable, String nome, UUID estadoId, Integer codigoIbge, Boolean ativo) {
        return repository.findAllWithFilters(pageable, nome, estadoId, codigoIbge, ativo)
                .map(CidadeMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<CidadeResponseDto> select() {
        return repository.findForSelect()
                .stream()
                .map(CidadeMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public CidadeResponseDto create(CidadeCreateDto dto) {
        Estado estado = estadoService.findById(dto.estadoId());

        if (repository.findByNomeIgnoreCaseAndEstadoId(dto.nome(), estado.getId()).isPresent())
            throw new ConflictException("Já existe uma cidade com esse nome nesse estado");

        Cidade cidade = new Cidade();
        cidade.setNome(dto.nome());
        cidade.setEstado(estado);
        cidade.setCodigoIbge(dto.codigoIbge());
        if (dto.ativo() != null)
            cidade.setAtivo(dto.ativo());

        return CidadeMapper.toResponseDto(repository.save(cidade));
    }

    @Transactional
    public CidadeResponseDto update(UUID id, CidadeUpdateDto dto) {
        Cidade cidade = findById(id);

        if (dto.estadoId() != null)
            cidade.setEstado(estadoService.findById(dto.estadoId()));

        if (dto.nome() != null && !dto.nome().isBlank()) {
            repository.findByNomeIgnoreCaseAndEstadoId(dto.nome(), cidade.getEstado().getId())
                    .filter(existente -> !existente.getId().equals(id))
                    .ifPresent(c -> {
                        throw new ConflictException("Já existe outra cidade com esse nome nesse estado");
                    });
            cidade.setNome(dto.nome());
        }

        if (dto.codigoIbge() != null)
            cidade.setCodigoIbge(dto.codigoIbge());

        if (dto.ativo() != null)
            cidade.setAtivo(dto.ativo());

        return CidadeMapper.toResponseDto(repository.save(cidade));
    }
}
