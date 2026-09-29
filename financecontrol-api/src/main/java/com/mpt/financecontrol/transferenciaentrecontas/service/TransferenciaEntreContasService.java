package com.mpt.financecontrol.transferenciaentrecontas.service;

import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.financeiro.OrigemLancamento;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.repository.LancamentoFinanceiroRepository;
import com.mpt.financecontrol.lancamentofinanceiro.service.LancamentoFinanceiroService;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.transferenciaentrecontas.dtos.TransferenciaEntreContasCreateDto;
import com.mpt.financecontrol.transferenciaentrecontas.dtos.TransferenciaEntreContasResponseDto;
import com.mpt.financecontrol.transferenciaentrecontas.entity.TransferenciaEntreContas;
import com.mpt.financecontrol.transferenciaentrecontas.mapper.TransferenciaEntreContasMapper;
import com.mpt.financecontrol.transferenciaentrecontas.repository.TransferenciaEntreContasRepository;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class TransferenciaEntreContasService {

    private final TransferenciaEntreContasRepository repository;
    private final UsuarioService usuarioService;
    private final ContaFinanceiraService contaFinanceiraService;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;

    public TransferenciaEntreContasService(
            TransferenciaEntreContasRepository repository,
            UsuarioService                     usuarioService,
            ContaFinanceiraService             contaFinanceiraService,
            LancamentoFinanceiroService        lancamentoFinanceiroService,
            LancamentoFinanceiroRepository     lancamentoFinanceiroRepository
    ) {
        this.repository                     = repository;
        this.usuarioService                 = usuarioService;
        this.contaFinanceiraService         = contaFinanceiraService;
        this.lancamentoFinanceiroService    = lancamentoFinanceiroService;
        this.lancamentoFinanceiroRepository = lancamentoFinanceiroRepository;
    }

    @Transactional(readOnly = true)
    public TransferenciaEntreContas findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        TransferenciaEntreContas transferencia = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transferência não encontrada"));

        if (!transferencia.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Transferência não encontrada");

        return transferencia;
    }

    @Transactional(readOnly = true)
    public TransferenciaEntreContasResponseDto findByIdResponse(UUID id) {
        return TransferenciaEntreContasMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<TransferenciaEntreContasResponseDto> getAll(Pageable pageable, UUID contaFinanceiraId, LocalDate dataInicio, LocalDate dataFim) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(pageable, tenant.getId(), contaFinanceiraId, dataInicio, dataFim)
                .map(TransferenciaEntreContasMapper::toResponseDto);
    }

    @Transactional
    public TransferenciaEntreContasResponseDto create(TransferenciaEntreContasCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        if (dto.contaOrigemId().equals(dto.contaDestinoId()))
            throw new BadRequestException("Conta de origem e destino não podem ser iguais");

        ContaFinanceira contaOrigem = contaFinanceiraService.findById(dto.contaOrigemId());
        ContaFinanceira contaDestino = contaFinanceiraService.findById(dto.contaDestinoId());

        if (!Boolean.TRUE.equals(contaOrigem.getAtivo()))
            throw new BadRequestException("Conta de origem inativa");

        if (!Boolean.TRUE.equals(contaDestino.getAtivo()))
            throw new BadRequestException("Conta de destino inativa");

        String descricao = dto.descricao() != null && !dto.descricao().isBlank()
                ? dto.descricao()
                : "Transferência entre contas";

        TransferenciaEntreContas transferencia = new TransferenciaEntreContas();
        transferencia.setTenant(tenant);
        transferencia.setContaOrigem(contaOrigem);
        transferencia.setContaDestino(contaDestino);
        transferencia.setValor(dto.valor());
        transferencia.setData(dto.data());
        transferencia.setDescricao(descricao);
        transferencia.setLancamentoSaida(lancamentoFinanceiroService.registrar(
                tenant,
                contaOrigem,
                null,
                TipoLancamento.SAIDA,
                OrigemLancamento.TRANSFERENCIA,
                dto.valor(),
                dto.data(),
                descricao + " → " + contaDestino.getNome()));
        transferencia.setLancamentoEntrada(lancamentoFinanceiroService.registrar(
                tenant,
                contaDestino,
                null,
                TipoLancamento.ENTRADA,
                OrigemLancamento.TRANSFERENCIA,
                dto.valor(),
                dto.data(),
                descricao + " ← " + contaOrigem.getNome()));

        return TransferenciaEntreContasMapper.toResponseDto(repository.save(transferencia));
    }

    @Transactional
    public void delete(UUID id) {
        TransferenciaEntreContas transferencia = findById(id);

        repository.delete(transferencia);
        lancamentoFinanceiroRepository.delete(transferencia.getLancamentoSaida());
        lancamentoFinanceiroRepository.delete(transferencia.getLancamentoEntrada());
    }
}
