package com.mpt.financecontrol.contareceber.service;

import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.repository.CategoriaRepository;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberCreateDto;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberResponseDto;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberUpdateDto;
import com.mpt.financecontrol.contareceber.entity.ContaReceber;
import com.mpt.financecontrol.contareceber.mapper.ContaReceberMapper;
import com.mpt.financecontrol.contareceber.repository.ContaReceberRepository;
import com.mpt.financecontrol.exceptions.NotFoundException;

import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.pessoa.service.PessoaService;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.UUID;

@Service
public class ContaReceberService {

    private final ContaReceberRepository repository;
    private final UsuarioService usuarioService;
    private final PessoaService pessoaService;
    private final CategoriaRepository categoriaRepository;


    public ContaReceberService(
            ContaReceberRepository repository,
            UsuarioService usuarioService,
            PessoaService pessoaService,
            CategoriaRepository categoriaRepository
    ) {
        this.repository = repository;
        this.usuarioService = usuarioService;
        this.pessoaService = pessoaService;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public ContaReceber findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaReceber contaReceber = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conta a receber não encontrada"));

        if (!contaReceber.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Conta a receber não encontrada");

        return contaReceber;
    }

    @Transactional(readOnly = true)
    public ContaReceberResponseDto findByIdResponse(UUID id) {
        return ContaReceberMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<ContaReceberResponseDto> getAll(Pageable pageable, UUID pessoaId, UUID categoriaId, StatusConta status, Boolean ativo) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(
                        pageable,
                        tenant.getId(),
                        pessoaId,
                        categoriaId,
                        status != null ? status.name() : null,
                        ativo)
                .map(ContaReceberMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<ContaReceberResponseDto> selec() {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findForSelect(tenant.getId())
                .stream()
                .map(ContaReceberMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public ContaReceberResponseDto create(ContaReceberCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaReceber contaReceber = new ContaReceber();
        contaReceber.setTenant(tenant);
        contaReceber.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            contaReceber.setCategoria(categoria);

        }

        contaReceber.setDescricao(dto.descricao());
        contaReceber.setDataEmissao(dto.dataEmissao());
        contaReceber.setValorTotal(dto.valorTotal());

        if (dto.status() != null)
            contaReceber.setStatus(dto.status());
        contaReceber.setObservacao(dto.observacao());
        if (dto.ativo() != null)
            contaReceber.setAtivo(dto.ativo());

        return ContaReceberMapper.toResponseDto(repository.save(contaReceber));
    }

    @Transactional
    public ContaReceberResponseDto update(UUID id, ContaReceberUpdateDto dto) {
        ContaReceber contaReceber = findById(id);
        Tenant tenant = contaReceber.getTenant();

        if (dto.pessoaId() != null)
            contaReceber.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            contaReceber.setCategoria(categoria);
        }

        if (dto.descricao() != null)
            contaReceber.setDescricao(dto.descricao());

        if (dto.dataEmissao() != null)
            contaReceber.setDataEmissao(dto.dataEmissao());

        if (dto.valorTotal() != null)
            contaReceber.setValorTotal(dto.valorTotal());

        if (dto.status() != null)
            contaReceber.setStatus(dto.status());

        if (dto.observacao() != null)
            contaReceber.setObservacao(dto.observacao());

        if (dto.ativo() != null)
            contaReceber.setAtivo(dto.ativo());

        return ContaReceberMapper.toResponseDto(repository.save(contaReceber));


    }
}
