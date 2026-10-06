package com.mpt.financecontrol.contapagarparcela.service;

import com.mpt.financecontrol.contapagar.entity.ContaPagar;
import com.mpt.financecontrol.contapagar.service.ContaPagarService;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaCreateDto;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaResponseDto;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaUpdateDto;
import com.mpt.financecontrol.contapagarparcela.entity.ContaPagarParcela;
import com.mpt.financecontrol.contapagarparcela.mapper.ContaPagarParcelaMapper;
import com.mpt.financecontrol.contapagarparcela.repository.ContaPagarParcelaRepository;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.formapagamento.entity.FormaPagamento;
import com.mpt.financecontrol.formapagamento.repository.FormaPagamentoRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class ContaPagarParcelaService {

    private final ContaPagarParcelaRepository repository;
    private final UsuarioService usuarioService;
    private final ContaPagarService contaPagarService;
    private final FormaPagamentoRepository formaPagamentoRepository;

    public ContaPagarParcelaService(
            ContaPagarParcelaRepository repository,
            UsuarioService usuarioService,
            ContaPagarService contaPagarService,
            FormaPagamentoRepository formaPagamentoRepository
    ) {
        this.repository                = repository;
        this.usuarioService            = usuarioService;
        this.contaPagarService         = contaPagarService;
        this.formaPagamentoRepository  = formaPagamentoRepository;
    }

    @Transactional(readOnly = true)
    public ContaPagarParcela findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaPagarParcela parcela = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        if (!parcela.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Parcela não encontrada");

        return parcela;
    }

    @Transactional(readOnly = true)
    public ContaPagarParcelaResponseDto findByIdResponse(UUID id) {
        return ContaPagarParcelaMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<ContaPagarParcelaResponseDto> getAll(Pageable pageable, UUID pessoaId, StatusConta status, LocalDate dataVencimentoInicio, LocalDate dataVencimentoFim) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(
                pageable,
                tenant.getId(),
                pessoaId,
                status != null ? status.name() : null,
                dataVencimentoInicio,
                dataVencimentoFim)
                .map(ContaPagarParcelaMapper::toResponseDto);
    }

    @Transactional
    public ContaPagarParcelaResponseDto create(ContaPagarParcelaCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();
        ContaPagar contaPagar = contaPagarService.findById(dto.contaPagarId());

        ContaPagarParcela parcela = new ContaPagarParcela();
        parcela.setTenant(tenant);
        parcela.setContaPagar(contaPagar);
        parcela.setNumeroParcela(dto.numeroParcela());
        parcela.setDataVencimento(dto.dataVencimento());
        parcela.setValor(dto.valor());

        if (dto.formaPagamentoId() != null) {
            FormaPagamento formaPagamento = formaPagamentoRepository.findById(dto.formaPagamentoId())
                    .orElseThrow(() -> new NotFoundException("Forma de pagamento não encontrada"));

            if (!formaPagamento.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Forma de pagamento não encontrada");

            parcela.setFormaPagamento(formaPagamento);
        }
        if (dto.status() != null)
            parcela.setStatus(dto.status());
        parcela.setObservacao(dto.observacao());

        return ContaPagarParcelaMapper.toResponseDto(repository.save(parcela));
    }

    @Transactional
    public ContaPagarParcelaResponseDto update(UUID id, ContaPagarParcelaUpdateDto dto) {
        ContaPagarParcela parcela = findById(id);
        Tenant tenant = parcela.getTenant();

        if (dto.dataVencimento() != null)
            parcela.setDataVencimento(dto.dataVencimento());

        if (dto.valor() != null)
            parcela.setValor(dto.valor());

        if (dto.formaPagamentoId() != null) {
            FormaPagamento formaPagamento = formaPagamentoRepository.findById(dto.formaPagamentoId())
                    .orElseThrow(() -> new NotFoundException("Forma de pagamento não encontrada"));

            if (!formaPagamento.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Forma de pagamento não encontrada");

            parcela.setFormaPagamento(formaPagamento);
        }

        if (dto.status() != null)
            parcela.setStatus(dto.status());

        if (dto.observacao() != null)
            parcela.setObservacao(dto.observacao());

        return ContaPagarParcelaMapper.toResponseDto(repository.save(parcela));
    }
}
