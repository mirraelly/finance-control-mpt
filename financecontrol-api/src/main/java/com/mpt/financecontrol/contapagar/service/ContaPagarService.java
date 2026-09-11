package com.mpt.financecontrol.contapagar.service;

import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.repository.CategoriaRepository;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarCreateDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarResponseDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarUpdateDto;
import com.mpt.financecontrol.contapagar.entity.ContaPagar;
import com.mpt.financecontrol.contapagar.mapper.ContaPagarMapper;
import com.mpt.financecontrol.contapagar.repository.ContaPagarRepository;
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
public class ContaPagarService {

    private final ContaPagarRepository repository;
    private final UsuarioService usuarioService;
    private final PessoaService pessoaService;
    private final CategoriaRepository categoriaRepository;

    public ContaPagarService(
            ContaPagarRepository    repository,
            UsuarioService          usuarioService,
            PessoaService           pessoaService,
            CategoriaRepository     categoriaRepository
    ) {
        this.repository          = repository;
        this.usuarioService      = usuarioService;
        this.pessoaService       = pessoaService;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public ContaPagar findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaPagar contaPagar = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conta a pagar não encontrada"));

        if (!contaPagar.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Conta a pagar não encontrada");

        return contaPagar;
    }

    @Transactional(readOnly = true)
    public ContaPagarResponseDto findByIdResponse(UUID id) {
        return ContaPagarMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<ContaPagarResponseDto> getAll(Pageable pageable, UUID pessoaId, UUID categoriaId, StatusConta status, Boolean ativo) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(
                        pageable,
                        tenant.getId(),
                        pessoaId,
                        categoriaId,
                        status != null ? status.name() : null,
                        ativo)
                .map(ContaPagarMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<ContaPagarResponseDto> select() {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findForSelect(tenant.getId())
                .stream()
                .map(ContaPagarMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public ContaPagarResponseDto create(ContaPagarCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaPagar contaPagar = new ContaPagar();
        contaPagar.setTenant(tenant);
        contaPagar.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            contaPagar.setCategoria(categoria);
        }

        contaPagar.setDescricao(dto.descricao());
        contaPagar.setDataEmissao(dto.dataEmissao());
        contaPagar.setValorTotal(dto.valorTotal());
        if (dto.status() != null)
            contaPagar.setStatus(dto.status());
        contaPagar.setObservacao(dto.observacao());
        if (dto.ativo() != null)
            contaPagar.setAtivo(dto.ativo());

        return ContaPagarMapper.toResponseDto(repository.save(contaPagar));
    }

    @Transactional
    public ContaPagarResponseDto update(UUID id, ContaPagarUpdateDto dto) {
        ContaPagar contaPagar = findById(id);
        Tenant tenant = contaPagar.getTenant();

        if (dto.pessoaId() != null)
            contaPagar.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            contaPagar.setCategoria(categoria);
        }

        if (dto.descricao() != null)
            contaPagar.setDescricao(dto.descricao());

        if (dto.dataEmissao() != null)
            contaPagar.setDataEmissao(dto.dataEmissao());

        if (dto.valorTotal() != null)
            contaPagar.setValorTotal(dto.valorTotal());

        if (dto.status() != null)
            contaPagar.setStatus(dto.status());

        if (dto.observacao() != null)
            contaPagar.setObservacao(dto.observacao());

        if (dto.ativo() != null)
            contaPagar.setAtivo(dto.ativo());

        return ContaPagarMapper.toResponseDto(repository.save(contaPagar));
    }
}
