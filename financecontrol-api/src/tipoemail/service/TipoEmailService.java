package com.mpt.financecontrol.tipoemail.service;

import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailCreateDto;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailResponseDto;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailUpdateDto;
import com.mpt.financecontrol.tipoemail.entity.TipoEmail;
import com.mpt.financecontrol.tipoemail.mapper.TipoEmailMapper;
import com.mpt.financecontrol.tipoemail.repository.TipoEmailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TipoEmailService {

    private final TipoEmailRepository repository;

    public TipoEmailService(TipoEmailRepository repository) {
        this.repository = repository;
    }

    // Uso interno: retorna a entidade (reaproveitado pelo update).
    @Transactional(readOnly = true)
    public TipoEmail findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de email não encontrado"));
    }

    @Transactional(readOnly = true)
    public TipoEmailResponseDto findByIdResponse(UUID id) {
        return TipoEmailMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<TipoEmailResponseDto> getAll(Pageable pageable, String nome) {
        return repository.findAllWithFilters(pageable, nome)
                .map(TipoEmailMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<TipoEmailResponseDto> select() {
        return repository.findForSelect()
                .stream()
                .map(TipoEmailMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public TipoEmailResponseDto create(TipoEmailCreateDto dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new ConflictException("Já existe um tipo de email com esse nome");

        TipoEmail tipo = new TipoEmail();
        tipo.setNome(dto.nome());
        if (dto.ativo() != null)
            tipo.setAtivo(dto.ativo());

        return TipoEmailMapper.toResponseDto(repository.save(tipo));
    }

    // PUT: substitui o recurso por completo (nome e ativo são obrigatórios no DTO).
    @Transactional
    public TipoEmailResponseDto update(UUID id, TipoEmailUpdateDto dto) {
        TipoEmail tipo = findById(id);

        repository.findByNomeIgnoreCase(dto.nome())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(e -> {
                    throw new ConflictException("Já existe outro tipo de email com esse nome");
                });

        tipo.setNome(dto.nome());
        tipo.setAtivo(dto.ativo());

        return TipoEmailMapper.toResponseDto(repository.save(tipo));
    }
}
