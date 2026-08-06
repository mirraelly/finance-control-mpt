package com.mpt.financecontrol.tipoendereco.service;

import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoCreateDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoResponseDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoUpdateDto;
import com.mpt.financecontrol.tipoendereco.entity.TipoEndereco;
import com.mpt.financecontrol.tipoendereco.mapper.TipoEnderecoMapper;
import com.mpt.financecontrol.tipoendereco.repository.TipoEnderecoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TipoEnderecoService {

    private final TipoEnderecoRepository repository;

    public TipoEnderecoService(TipoEnderecoRepository repository) {
        this.repository = repository;
    }

    // Uso interno: retorna a entidade (reaproveitado pelo update).
    @Transactional(readOnly = true)
    public TipoEndereco findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de endereço não encontrado"));
    }

    @Transactional(readOnly = true)
    public TipoEnderecoResponseDto findByIdResponse(UUID id) {
        return TipoEnderecoMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<TipoEnderecoResponseDto> getAll(Pageable pageable, String nome) {
        return repository.findAllWithFilters(pageable, nome)
                .map(TipoEnderecoMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<TipoEnderecoResponseDto> select() {
        return repository.findForSelect()
                .stream()
                .map(TipoEnderecoMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public TipoEnderecoResponseDto create(TipoEnderecoCreateDto dto) {
        if (repository.existsByNomeNormalizado(dto.nome()))
            throw new ConflictException("Já existe um tipo de endereço com esse nome");

        TipoEndereco tipo = new TipoEndereco();
        tipo.setNome(dto.nome());
        if (dto.ativo() != null)
            tipo.setAtivo(dto.ativo());

        return TipoEnderecoMapper.toResponseDto(repository.save(tipo));
    }

    // PUT: substitui o recurso por completo (nome e ativo são obrigatórios no DTO).
    @Transactional
    public TipoEnderecoResponseDto update(UUID id, TipoEnderecoUpdateDto dto) {
        TipoEndereco tipo = findById(id);

        repository.findByNomeNormalizado(dto.nome())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(e -> {
                    throw new ConflictException("Já existe outro tipo de endereço com esse nome");
                });

        tipo.setNome(dto.nome());
        tipo.setAtivo(dto.ativo());

        return TipoEnderecoMapper.toResponseDto(repository.save(tipo));
    }
}
