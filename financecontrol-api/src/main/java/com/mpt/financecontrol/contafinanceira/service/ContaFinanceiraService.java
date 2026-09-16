package com.mpt.financecontrol.contafinanceira.service;

import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraCreateDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraResponseDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraUpdateDto;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.mapper.ContaFinanceiraMapper;
import com.mpt.financecontrol.contafinanceira.repository.ContaFinanceiraRepository;
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
public class ContaFinanceiraService {

    private final ContaFinanceiraRepository repository;
    private final UsuarioService usuarioService;

    public ContaFinanceiraService(ContaFinanceiraRepository repository, UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public ContaFinanceira findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaFinanceira conta = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conta financeira não encontrada"));

        if (!conta.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Conta financeira não encontrada");

        return conta;
    }

    @Transactional(readOnly = true)
    public ContaFinanceiraResponseDto findByIdResponse(UUID id) {
        return ContaFinanceiraMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<ContaFinanceiraResponseDto> getAll(Pageable pageable, String nome) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(pageable, tenant.getId(), nome)
                .map(ContaFinanceiraMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<ContaFinanceiraResponseDto> select() {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findForSelect(tenant.getId())
                .stream()
                .map(ContaFinanceiraMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public ContaFinanceiraResponseDto create(ContaFinanceiraCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        if (repository.existsByTenantIdAndNomeNormalizado(tenant.getId(), dto.nome()))
            throw new ConflictException("Já existe uma conta financeira com esse nome");

        ContaFinanceira conta = new ContaFinanceira();
        conta.setTenant(tenant);
        conta.setNome(dto.nome());
        if (dto.ativo() != null)
            conta.setAtivo(dto.ativo());

        return ContaFinanceiraMapper.toResponseDto(repository.save(conta));
    }

    @Transactional
    public ContaFinanceiraResponseDto update(UUID id, ContaFinanceiraUpdateDto dto) {
        ContaFinanceira conta = findById(id);
        Tenant tenant = conta.getTenant();

        repository.findByTenantIdAndNomeNormalizado(tenant.getId(), dto.nome())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(e -> {
                    throw new ConflictException("Já existe outra conta financeira com esse nome");
                });

        conta.setNome(dto.nome());
        conta.setAtivo(dto.ativo());

        return ContaFinanceiraMapper.toResponseDto(repository.save(conta));
    }
}
