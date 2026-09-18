package com.mpt.financecontrol.categoria.service;

import com.mpt.financecontrol.categoria.dtos.CategoriaCreateDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaResponseDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaUpdateDto;
import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.mapper.CategoriaMapper;
import com.mpt.financecontrol.categoria.repository.CategoriaRepository;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioService      usuarioService;

    public CategoriaService(
            CategoriaRepository categoriaRepository,
            UsuarioService      usuarioService
    ) {
        this.categoriaRepository = categoriaRepository;
        this.usuarioService      = usuarioService;
    }

    @Transactional(readOnly = true)
    public Categoria findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

        if (!categoria.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Categoria não encontrada");

        return categoria;
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDto findByIdResponse(UUID id) {
        return CategoriaMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<CategoriaResponseDto> getAll(Pageable pageable, String nome) {
        Tenant tenant = usuarioService.getTenantLogado();
        return categoriaRepository.findAllWithFilters(pageable, tenant.getId(), nome)
                .map(CategoriaMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDto> select() {
        Tenant tenant = usuarioService.getTenantLogado();
        return categoriaRepository.findForSelect(tenant.getId())
                .stream()
                .map(CategoriaMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public CategoriaResponseDto create(CategoriaCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        if (categoriaRepository.existsByTenantIdAndNomeNormalizado(tenant.getId(), dto.nome()))
            throw new ConflictException("Já existe uma categoria com esse nome");

        Categoria categoria = new Categoria();
        categoria.setTenant(tenant);
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        if (dto.ativo() != null)
            categoria.setAtivo(dto.ativo());

        return CategoriaMapper.toResponseDto(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponseDto update(UUID id, CategoriaUpdateDto dto) {
        Categoria categoria = findById(id);

        categoriaRepository.findByTenantIdAndNomeNormalizado(categoria.getTenant().getId(), dto.nome())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(e -> {
                    throw new ConflictException("Já existe outra categoria com esse nome");
                });

        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        if (dto.ativo() != null)
            categoria.setAtivo(dto.ativo());

        return CategoriaMapper.toResponseDto(categoriaRepository.save(categoria));
    }
}
