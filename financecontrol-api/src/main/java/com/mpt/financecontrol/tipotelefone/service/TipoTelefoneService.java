package com.mpt.financecontrol.tipotelefone.service;

import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneCreateDto;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneResponseDto;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneUpdateDto;
import com.mpt.financecontrol.tipotelefone.entity.TipoTelefone;
import com.mpt.financecontrol.tipotelefone.mapper.TipoTelefoneMapper;
import com.mpt.financecontrol.tipotelefone.repository.TipoTelefoneRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TipoTelefoneService {

    private final TipoTelefoneRepository repository;

    public TipoTelefoneService(TipoTelefoneRepository repository) {
        this.repository = repository;
    }

    // Uso interno: retorna a entidade (reaproveitado pelo update).
    @Transactional(readOnly = true)
    public TipoTelefone findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de telefone não encontrado"));
    }

    @Transactional(readOnly = true)
    public TipoTelefoneResponseDto findByIdResponse(UUID id) {
        return TipoTelefoneMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<TipoTelefoneResponseDto> getAll(Pageable pageable, String nome) {
        return repository.findAllWithFilters(pageable, nome)
                .map(TipoTelefoneMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<TipoTelefoneResponseDto> select() {
        return repository.findForSelect()
                .stream()
                .map(TipoTelefoneMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public TipoTelefoneResponseDto create(TipoTelefoneCreateDto dto) {
        if (repository.existsByNomeNormalizado(dto.nome()))
            throw new ConflictException("Já existe um tipo de telefone com esse nome");

        TipoTelefone tipo = new TipoTelefone();
        tipo.setNome(dto.nome());
        if (dto.ativo() != null)
            tipo.setAtivo(dto.ativo());

        return TipoTelefoneMapper.toResponseDto(repository.save(tipo));
    }

    // PUT: substitui o recurso por completo (nome e ativo são obrigatórios no DTO).
    @Transactional
    public TipoTelefoneResponseDto update(UUID id, TipoTelefoneUpdateDto dto) {
        TipoTelefone tipo = findById(id);

        repository.findByNomeNormalizado(dto.nome())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(e -> {
                    throw new ConflictException("Já existe outro tipo de telefone com esse nome");
                });

        tipo.setNome(dto.nome());
        tipo.setAtivo(dto.ativo());

        return TipoTelefoneMapper.toResponseDto(repository.save(tipo));
    }
}
