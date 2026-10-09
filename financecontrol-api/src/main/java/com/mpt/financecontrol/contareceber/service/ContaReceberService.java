package com.mpt.financecontrol.contareceber.service;

import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.repository.CategoriaRepository;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberCreateDto;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberResponseDto;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberUpdateDto;
import com.mpt.financecontrol.contareceber.entity.ContaReceber;
import com.mpt.financecontrol.contareceber.mapper.ContaReceberMapper;
import com.mpt.financecontrol.contareceber.repository.ContaReceberRepository;
import com.mpt.financecontrol.contareceberparcela.dtos.ContaReceberParcelaBaixaDto;
import com.mpt.financecontrol.contareceberparcela.dtos.ContaReceberParcelaItemDto;
import com.mpt.financecontrol.contareceberparcela.entity.ContaReceberParcela;
import com.mpt.financecontrol.contareceberparcela.mapper.ContaReceberParcelaMapper;
import com.mpt.financecontrol.contareceberparcela.repository.ContaReceberParcelaRepository;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.financeiro.OrigemLancamento;
import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.formapagamento.entity.FormaPagamento;
import com.mpt.financecontrol.formapagamento.repository.FormaPagamentoRepository;
import com.mpt.financecontrol.lancamentofinanceiro.entity.LancamentoFinanceiro;
import com.mpt.financecontrol.lancamentofinanceiro.repository.LancamentoFinanceiroRepository;
import com.mpt.financecontrol.lancamentofinanceiro.service.LancamentoFinanceiroService;
import com.mpt.financecontrol.pessoa.service.PessoaService;
import com.mpt.financecontrol.recebimento.dtos.RecebimentoCreateDto;
import com.mpt.financecontrol.recebimento.entity.Recebimento;
import com.mpt.financecontrol.recebimento.repository.RecebimentoRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ContaReceberService {

    private final ContaReceberRepository repository;
    private final ContaReceberParcelaRepository parcelaRepository;
    private final RecebimentoRepository recebimentoRepository;
    private final UsuarioService usuarioService;
    private final PessoaService pessoaService;
    private final CategoriaRepository categoriaRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    private final ContaFinanceiraService contaFinanceiraService;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;

    public ContaReceberService(
            ContaReceberRepository          repository,
            ContaReceberParcelaRepository   parcelaRepository,
            RecebimentoRepository           recebimentoRepository,
            UsuarioService                  usuarioService,
            PessoaService                   pessoaService,
            CategoriaRepository             categoriaRepository,
            FormaPagamentoRepository        formaPagamentoRepository,
            ContaFinanceiraService          contaFinanceiraService,
            LancamentoFinanceiroService     lancamentoFinanceiroService,
            LancamentoFinanceiroRepository  lancamentoFinanceiroRepository
    ) {
        this.repository                     = repository;
        this.parcelaRepository              = parcelaRepository;
        this.recebimentoRepository          = recebimentoRepository;
        this.usuarioService                 = usuarioService;
        this.pessoaService                  = pessoaService;
        this.categoriaRepository            = categoriaRepository;
        this.formaPagamentoRepository       = formaPagamentoRepository;
        this.contaFinanceiraService         = contaFinanceiraService;
        this.lancamentoFinanceiroService    = lancamentoFinanceiroService;
        this.lancamentoFinanceiroRepository = lancamentoFinanceiroRepository;
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
    public List<ContaReceberResponseDto> select() {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findForSelect(tenant.getId())
                .stream()
                .map(ContaReceberMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ContaReceberParcelaBaixaDto> getParcelas(
            Pageable    pageable,
            UUID        pessoaId,
            StatusConta status,
            LocalDate   dataVencimentoInicio,
            LocalDate   dataVencimentoFim
    ) {
        Tenant tenant = usuarioService.getTenantLogado();
        return parcelaRepository.findAllWithFilters(
                        pageable,
                        tenant.getId(),
                        pessoaId,
                        status != null ? status.name() : null,
                        dataVencimentoInicio,
                        dataVencimentoFim)
                .map(ContaReceberParcelaMapper::toBaixaDto);
    }

    @Transactional
    public ContaReceberResponseDto create(ContaReceberCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        BigDecimal somaParcelas = dto.parcelas().stream()
                .map(ContaReceberParcelaItemDto::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (somaParcelas.compareTo(dto.valorTotal()) != 0)
            throw new BadRequestException("A soma das parcelas deve ser igual ao valor total da conta");

        ContaReceber contaReceber = new ContaReceber();
        contaReceber.setTenant(tenant);
        contaReceber.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            if (!Boolean.TRUE.equals(categoria.getAtivo()))
                throw new BadRequestException("Categoria inativa");

            contaReceber.setCategoria(categoria);
        }

        contaReceber.setDescricao(dto.descricao());
        contaReceber.setDataEmissao(dto.dataEmissao());
        contaReceber.setValorTotal(dto.valorTotal());
        contaReceber.setObservacao(dto.observacao());
        if (dto.ativo() != null)
            contaReceber.setAtivo(dto.ativo());

        repository.save(contaReceber);

        for (int i = 0; i < dto.parcelas().size(); i++) {
            ContaReceberParcelaItemDto item = dto.parcelas().get(i);

            if (item.dataVencimento().isBefore(contaReceber.getDataEmissao()))
                throw new BadRequestException("Data de vencimento da parcela não pode ser anterior à data de emissão");

            ContaReceberParcela parcela = new ContaReceberParcela();
            parcela.setTenant(tenant);
            parcela.setContaReceber(contaReceber);
            parcela.setNumeroParcela(i + 1);
            parcela.setDataVencimento(item.dataVencimento());
            parcela.setValor(item.valor());
            parcela.setObservacao(item.observacao());

            if (item.formaPagamentoId() != null) {
                FormaPagamento formaPagamento = formaPagamentoRepository.findById(item.formaPagamentoId())
                        .orElseThrow(() -> new NotFoundException("Forma de pagamento não encontrada"));

                if (!formaPagamento.getTenant().getId().equals(tenant.getId()))
                    throw new NotFoundException("Forma de pagamento não encontrada");

                if (!Boolean.TRUE.equals(formaPagamento.getAtivo()))
                    throw new BadRequestException("Forma de pagamento inativa");

                parcela.setFormaPagamento(formaPagamento);
            }

            contaReceber.getParcelas().add(parcelaRepository.save(parcela));
        }

        return ContaReceberMapper.toResponseDto(contaReceber);
    }

    @Transactional
    public ContaReceberResponseDto update(UUID id, ContaReceberUpdateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaReceber contaReceber = repository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Conta a receber não encontrada"));

        if (!contaReceber.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Conta a receber não encontrada");

        if (dto.pessoaId() != null)
            contaReceber.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (Boolean.TRUE.equals(dto.removerCategoria())) {
            contaReceber.setCategoria(null);
        } else if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            if (!Boolean.TRUE.equals(categoria.getAtivo()))
                throw new BadRequestException("Categoria inativa");

            contaReceber.setCategoria(categoria);
        }

        if (dto.descricao() != null)
            contaReceber.setDescricao(dto.descricao());

        if (dto.dataEmissao() != null)
            contaReceber.setDataEmissao(dto.dataEmissao());

        if (dto.valorTotal() != null)
            contaReceber.setValorTotal(dto.valorTotal());

        if (dto.observacao() != null)
            contaReceber.setObservacao(dto.observacao());

        if (dto.ativo() != null)
            contaReceber.setAtivo(dto.ativo());

        if (dto.status() == StatusConta.CANCELADO) {
            if (contaReceber.getStatus() != StatusConta.CANCELADO) {
                boolean possuiRecebimentos = contaReceber.getParcelas().stream()
                        .anyMatch(p -> !p.getRecebimentos().isEmpty());

                if (possuiRecebimentos)
                    throw new BadRequestException("Não é possível cancelar uma conta com recebimentos");

                contaReceber.setStatus(StatusConta.CANCELADO);
                contaReceber.getParcelas().forEach(p -> p.setStatus(StatusConta.CANCELADO));
                parcelaRepository.saveAll(contaReceber.getParcelas());
            }
        } else if (dto.status() == StatusConta.ABERTO) {
            if (contaReceber.getStatus() == StatusConta.CANCELADO) {
                contaReceber.setStatus(StatusConta.ABERTO);
                contaReceber.getParcelas().forEach(p -> p.setStatus(StatusConta.ABERTO));
                parcelaRepository.saveAll(contaReceber.getParcelas());
            } else if (contaReceber.getStatus() != StatusConta.ABERTO) {
                throw new BadRequestException("O status da conta é calculado pelas parcelas");
            }
        } else if (dto.status() != null) {
            throw new BadRequestException("O status da conta é calculado pelas parcelas");
        }

        if (dto.parcelas() != null) {
            if (dto.parcelas().isEmpty())
                throw new BadRequestException("É necessário ao menos uma parcela");

            if (contaReceber.getStatus() == StatusConta.CANCELADO)
                throw new BadRequestException("Não é possível alterar as parcelas de uma conta cancelada");

            if (!Boolean.TRUE.equals(contaReceber.getAtivo()))
                throw new BadRequestException("Não é possível alterar as parcelas de uma conta inativa");

            boolean possuiRecebimentos = contaReceber.getParcelas().stream()
                    .anyMatch(p -> !p.getRecebimentos().isEmpty());

            if (possuiRecebimentos)
                throw new BadRequestException("Não é possível alterar as parcelas de uma conta com recebimentos");

            BigDecimal somaParcelas = dto.parcelas().stream()
                    .map(ContaReceberParcelaItemDto::valor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (somaParcelas.compareTo(contaReceber.getValorTotal()) != 0)
                throw new BadRequestException("A soma das parcelas deve ser igual ao valor total da conta");

            parcelaRepository.deleteAll(contaReceber.getParcelas());
            parcelaRepository.flush();
            contaReceber.getParcelas().clear();

            for (int i = 0; i < dto.parcelas().size(); i++) {
                ContaReceberParcelaItemDto item = dto.parcelas().get(i);

                if (item.dataVencimento().isBefore(contaReceber.getDataEmissao()))
                    throw new BadRequestException("Data de vencimento da parcela não pode ser anterior à data de emissão");

                ContaReceberParcela parcela = new ContaReceberParcela();
                parcela.setTenant(tenant);
                parcela.setContaReceber(contaReceber);
                parcela.setNumeroParcela(i + 1);
                parcela.setDataVencimento(item.dataVencimento());
                parcela.setValor(item.valor());
                parcela.setObservacao(item.observacao());

                if (item.formaPagamentoId() != null) {
                    FormaPagamento formaPagamento = formaPagamentoRepository.findById(item.formaPagamentoId())
                            .orElseThrow(() -> new NotFoundException("Forma de pagamento não encontrada"));

                    if (!formaPagamento.getTenant().getId().equals(tenant.getId()))
                        throw new NotFoundException("Forma de pagamento não encontrada");

                    if (!Boolean.TRUE.equals(formaPagamento.getAtivo()))
                        throw new BadRequestException("Forma de pagamento inativa");

                    parcela.setFormaPagamento(formaPagamento);
                }

                contaReceber.getParcelas().add(parcelaRepository.save(parcela));
            }
        } else {
            if (dto.valorTotal() != null && !contaReceber.getParcelas().isEmpty()) {
                BigDecimal somaParcelas = contaReceber.getParcelas().stream()
                        .map(ContaReceberParcela::getValor)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (somaParcelas.compareTo(contaReceber.getValorTotal()) != 0)
                    throw new BadRequestException("A soma das parcelas deve ser igual ao valor total da conta");
            }

            if (dto.dataEmissao() != null) {
                boolean vencimentoAnterior = contaReceber.getParcelas().stream()
                        .anyMatch(p -> p.getDataVencimento().isBefore(contaReceber.getDataEmissao()));

                if (vencimentoAnterior)
                    throw new BadRequestException("Data de vencimento da parcela não pode ser anterior à data de emissão");
            }
        }

        return ContaReceberMapper.toResponseDto(repository.save(contaReceber));
    }

    @Transactional
    public ContaReceberResponseDto receberParcela(UUID parcelaId, RecebimentoCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        UUID contaReceberId = parcelaRepository.findContaReceberIdById(parcelaId, tenant.getId())
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        ContaReceber contaReceber = repository.findByIdForUpdate(contaReceberId)
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        ContaReceberParcela parcela = parcelaRepository.findById(parcelaId)
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        if (!Boolean.TRUE.equals(contaReceber.getAtivo()))
            throw new BadRequestException("Conta a receber inativa");

        if (contaReceber.getStatus() == StatusConta.CANCELADO)
            throw new BadRequestException("Conta a receber cancelada");

        if (parcela.getStatus() == StatusConta.PAGO)
            throw new BadRequestException("Parcela já está paga");

        if (parcela.getStatus() == StatusConta.CANCELADO)
            throw new BadRequestException("Parcela cancelada");

        BigDecimal juros    = dto.juros()    != null ? dto.juros()    : BigDecimal.ZERO;
        BigDecimal multa    = dto.multa()    != null ? dto.multa()    : BigDecimal.ZERO;
        BigDecimal desconto = dto.desconto() != null ? dto.desconto() : BigDecimal.ZERO;

        BigDecimal saldo = parcela.getValor().subtract(parcela.getRecebimentos().stream()
                .map(r -> r.getValor().add(r.getDesconto()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        BigDecimal abatido = dto.valor().add(desconto);

        if (abatido.compareTo(saldo) > 0)
            throw new BadRequestException("Valor recebido maior que o saldo da parcela");

        FormaPagamento formaPagamento = formaPagamentoRepository.findById(dto.formaPagamentoId())
                .orElseThrow(() -> new NotFoundException("Forma de pagamento não encontrada"));

        if (!formaPagamento.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Forma de pagamento não encontrada");

        if (!Boolean.TRUE.equals(formaPagamento.getAtivo()))
            throw new BadRequestException("Forma de pagamento inativa");

        ContaFinanceira contaFinanceira = dto.contaFinanceiraId() != null
                ? contaFinanceiraService.findById(dto.contaFinanceiraId())
                : formaPagamento.getContaFinanceira();

        if (!Boolean.TRUE.equals(contaFinanceira.getAtivo()))
            throw new BadRequestException("Conta financeira inativa");

        LancamentoFinanceiro lancamento = lancamentoFinanceiroService.registrar(
                tenant,
                contaFinanceira,
                contaReceber.getCategoria(),
                TipoLancamento.ENTRADA,
                OrigemLancamento.RECEBIMENTO,
                dto.valor().add(juros).add(multa),
                dto.dataRecebimento(),
                "Recebimento parcela " + parcela.getNumeroParcela()
                        + (contaReceber.getDescricao() != null ? " - " + contaReceber.getDescricao() : ""));

        Recebimento recebimento = new Recebimento();
        recebimento.setTenant(tenant);
        recebimento.setContaReceberParcela(parcela);
        recebimento.setFormaPagamento(formaPagamento);
        recebimento.setContaFinanceira(contaFinanceira);
        recebimento.setLancamentoFinanceiro(lancamento);
        recebimento.setDataRecebimento(dto.dataRecebimento());
        recebimento.setValor(dto.valor());
        recebimento.setJuros(juros);
        recebimento.setMulta(multa);
        recebimento.setDesconto(desconto);
        recebimento.setObservacao(dto.observacao());

        parcela.getRecebimentos().add(recebimentoRepository.save(recebimento));

        if (saldo.subtract(abatido).compareTo(BigDecimal.ZERO) <= 0)
            parcela.setStatus(StatusConta.PAGO);
        else
            parcela.setStatus(StatusConta.PARCIALMENTE_PAGO);

        parcelaRepository.save(parcela);

        long pagas = contaReceber.getParcelas().stream()
                .filter(p -> p.getStatus() == StatusConta.PAGO)
                .count();

        boolean possuiRecebimentos = contaReceber.getParcelas().stream()
                .anyMatch(p -> p.getStatus() == StatusConta.PAGO || p.getStatus() == StatusConta.PARCIALMENTE_PAGO);

        if (pagas == contaReceber.getParcelas().size())
            contaReceber.setStatus(StatusConta.PAGO);
        else if (possuiRecebimentos)
            contaReceber.setStatus(StatusConta.PARCIALMENTE_PAGO);
        else
            contaReceber.setStatus(StatusConta.ABERTO);

        return ContaReceberMapper.toResponseDto(repository.save(contaReceber));
    }

    @Transactional
    public ContaReceberResponseDto estornarRecebimento(UUID recebimentoId) {
        Tenant tenant = usuarioService.getTenantLogado();

        UUID contaReceberId = recebimentoRepository.findContaReceberIdById(recebimentoId, tenant.getId())
                .orElseThrow(() -> new NotFoundException("Recebimento não encontrado"));

        ContaReceber contaReceber = repository.findByIdForUpdate(contaReceberId)
                .orElseThrow(() -> new NotFoundException("Recebimento não encontrado"));

        Recebimento recebimento = recebimentoRepository.findById(recebimentoId)
                .orElseThrow(() -> new NotFoundException("Recebimento não encontrado"));

        if (contaReceber.getStatus() == StatusConta.CANCELADO)
            throw new BadRequestException("Conta a receber cancelada");

        ContaReceberParcela parcela = recebimento.getContaReceberParcela();
        LancamentoFinanceiro lancamento = recebimento.getLancamentoFinanceiro();

        parcela.getRecebimentos().remove(recebimento);
        recebimentoRepository.delete(recebimento);
        lancamentoFinanceiroRepository.delete(lancamento);

        BigDecimal saldo = parcela.getValor().subtract(parcela.getRecebimentos().stream()
                .map(r -> r.getValor().add(r.getDesconto()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        if (parcela.getRecebimentos().isEmpty())
            parcela.setStatus(StatusConta.ABERTO);
        else if (saldo.compareTo(BigDecimal.ZERO) <= 0)
            parcela.setStatus(StatusConta.PAGO);
        else
            parcela.setStatus(StatusConta.PARCIALMENTE_PAGO);

        parcelaRepository.save(parcela);

        long pagas = contaReceber.getParcelas().stream()
                .filter(p -> p.getStatus() == StatusConta.PAGO)
                .count();

        boolean possuiRecebimentos = contaReceber.getParcelas().stream()
                .anyMatch(p -> p.getStatus() == StatusConta.PAGO || p.getStatus() == StatusConta.PARCIALMENTE_PAGO);

        if (pagas == contaReceber.getParcelas().size())
            contaReceber.setStatus(StatusConta.PAGO);
        else if (possuiRecebimentos)
            contaReceber.setStatus(StatusConta.PARCIALMENTE_PAGO);
        else
            contaReceber.setStatus(StatusConta.ABERTO);

        return ContaReceberMapper.toResponseDto(repository.save(contaReceber));
    }
}
