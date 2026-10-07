package com.mpt.financecontrol.formapagamento.service;

import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoCreateDto;
import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoResponseDto;
import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoUpdateDto;
import com.mpt.financecontrol.formapagamento.entity.FormaPagamento;
import com.mpt.financecontrol.formapagamento.mapper.FormaPagamentoMapper;
import com.mpt.financecontrol.formapagamento.repository.FormaPagamentoRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FormaPagamentoService {

    private final FormaPagamentoRepository repository;
    private final UsuarioService usuarioService;
    private final ContaFinanceiraService contaFinanceiraService;

    public FormaPagamentoService(
            FormaPagamentoRepository repository,
            UsuarioService           usuarioService,
            ContaFinanceiraService   contaFinanceiraService
    ) {
        this.repository             = repository;
        this.usuarioService         = usuarioService;
        this.contaFinanceiraService = contaFinanceiraService;
    }

    @Transactional(readOnly = true)
    public FormaPagamento findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        FormaPagamento formaPagamento = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Forma de pagamento não encontrada"));

        if (!formaPagamento.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Forma de pagamento não encontrada");

        return formaPagamento;
    }

    @Transactional(readOnly = true)
    public FormaPagamentoResponseDto findByIdResponse(UUID id) {
        return FormaPagamentoMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<FormaPagamentoResponseDto> getAll(Pageable pageable, String nome, Boolean ativo) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(pageable, tenant.getId(), nome, ativo)
                .map(FormaPagamentoMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<FormaPagamentoResponseDto> select() {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findForSelect(tenant.getId())
                .stream()
                .map(FormaPagamentoMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public FormaPagamentoResponseDto create(FormaPagamentoCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();
        String nome   = dto.nome().trim();

        if (repository.existsByTenantIdAndNomeNormalizado(tenant.getId(), nome))
            throw new ConflictException("Já existe uma forma de pagamento com esse nome");

        FormaPagamento formaPagamento = new FormaPagamento();
        formaPagamento.setTenant(tenant);
        formaPagamento.setNome(nome);
        formaPagamento.setContaFinanceira(findContaFinanceiraAtiva(dto.contaFinanceiraId()));
        if (dto.ativo() != null)
            formaPagamento.setAtivo(dto.ativo());

        return FormaPagamentoMapper.toResponseDto(repository.save(formaPagamento));
    }

    @Transactional
    public FormaPagamentoResponseDto update(UUID id, FormaPagamentoUpdateDto dto) {
        FormaPagamento formaPagamento = findById(id);
        Tenant tenant = formaPagamento.getTenant();
        String nome   = dto.nome().trim();

        repository.findByTenantIdAndNomeNormalizado(tenant.getId(), nome)
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(e -> {
                    throw new ConflictException("Já existe outra forma de pagamento com esse nome");
                });

        if (!formaPagamento.getContaFinanceira().getId().equals(dto.contaFinanceiraId()))
            formaPagamento.setContaFinanceira(findContaFinanceiraAtiva(dto.contaFinanceiraId()));

        formaPagamento.setNome(nome);
        formaPagamento.setAtivo(dto.ativo());

        return FormaPagamentoMapper.toResponseDto(repository.save(formaPagamento));
    }

    private ContaFinanceira findContaFinanceiraAtiva(UUID contaFinanceiraId) {
        ContaFinanceira contaFinanceira = contaFinanceiraService.findById(contaFinanceiraId);

        if (!Boolean.TRUE.equals(contaFinanceira.getAtivo()))
            throw new BadRequestException("Conta financeira inativa");

        return contaFinanceira;
    }
}
