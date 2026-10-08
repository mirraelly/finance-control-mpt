package com.mpt.financecontrol.contapagar.service;

import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.repository.CategoriaRepository;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarCreateDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarResponseDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarUpdateDto;
import com.mpt.financecontrol.contapagar.entity.ContaPagar;
import com.mpt.financecontrol.contapagar.mapper.ContaPagarMapper;
import com.mpt.financecontrol.contapagar.repository.ContaPagarRepository;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaBaixaDto;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaItemDto;
import com.mpt.financecontrol.contapagarparcela.entity.ContaPagarParcela;
import com.mpt.financecontrol.contapagarparcela.mapper.ContaPagarParcelaMapper;
import com.mpt.financecontrol.contapagarparcela.repository.ContaPagarParcelaRepository;
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
import com.mpt.financecontrol.pagamento.dtos.PagamentoCreateDto;
import com.mpt.financecontrol.pagamento.entity.Pagamento;
import com.mpt.financecontrol.pagamento.repository.PagamentoRepository;
import com.mpt.financecontrol.pessoa.service.PessoaService;
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
public class ContaPagarService {

    private final ContaPagarRepository repository;
    private final ContaPagarParcelaRepository parcelaRepository;
    private final PagamentoRepository pagamentoRepository;
    private final UsuarioService usuarioService;
    private final PessoaService pessoaService;
    private final CategoriaRepository categoriaRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    private final ContaFinanceiraService contaFinanceiraService;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;

    public ContaPagarService(
            ContaPagarRepository            repository,
            ContaPagarParcelaRepository     parcelaRepository,
            PagamentoRepository             pagamentoRepository,
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
        this.pagamentoRepository            = pagamentoRepository;
        this.usuarioService                 = usuarioService;
        this.pessoaService                  = pessoaService;
        this.categoriaRepository            = categoriaRepository;
        this.formaPagamentoRepository       = formaPagamentoRepository;
        this.contaFinanceiraService         = contaFinanceiraService;
        this.lancamentoFinanceiroService    = lancamentoFinanceiroService;
        this.lancamentoFinanceiroRepository = lancamentoFinanceiroRepository;
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

    @Transactional(readOnly = true)
    public Page<ContaPagarParcelaBaixaDto> getParcelas(
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
                .map(ContaPagarParcelaMapper::toBaixaDto);
    }

    @Transactional
    public ContaPagarResponseDto create(ContaPagarCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        BigDecimal somaParcelas = dto.parcelas().stream()
                .map(ContaPagarParcelaItemDto::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (somaParcelas.compareTo(dto.valorTotal()) != 0)
            throw new BadRequestException("A soma das parcelas deve ser igual ao valor total da conta");

        ContaPagar contaPagar = new ContaPagar();
        contaPagar.setTenant(tenant);
        contaPagar.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            if (!Boolean.TRUE.equals(categoria.getAtivo()))
                throw new BadRequestException("Categoria inativa");

            contaPagar.setCategoria(categoria);
        }

        contaPagar.setDescricao(dto.descricao());
        contaPagar.setDataEmissao(dto.dataEmissao());
        contaPagar.setValorTotal(dto.valorTotal());
        contaPagar.setObservacao(dto.observacao());
        if (dto.ativo() != null)
            contaPagar.setAtivo(dto.ativo());

        repository.save(contaPagar);

        for (int i = 0; i < dto.parcelas().size(); i++) {
            ContaPagarParcelaItemDto item = dto.parcelas().get(i);

            if (item.dataVencimento().isBefore(contaPagar.getDataEmissao()))
                throw new BadRequestException("Data de vencimento da parcela não pode ser anterior à data de emissão");

            ContaPagarParcela parcela = new ContaPagarParcela();
            parcela.setTenant(tenant);
            parcela.setContaPagar(contaPagar);
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

            contaPagar.getParcelas().add(parcelaRepository.save(parcela));
        }

        return ContaPagarMapper.toResponseDto(contaPagar);
    }

    @Transactional
    public ContaPagarResponseDto update(UUID id, ContaPagarUpdateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaPagar contaPagar = repository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Conta a pagar não encontrada"));

        if (!contaPagar.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Conta a pagar não encontrada");

        if (dto.pessoaId() != null)
            contaPagar.setPessoa(pessoaService.findById(dto.pessoaId()));

        if (dto.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));

            if (!categoria.getTenant().getId().equals(tenant.getId()))
                throw new NotFoundException("Categoria não encontrada");

            if (!Boolean.TRUE.equals(categoria.getAtivo()))
                throw new BadRequestException("Categoria inativa");

            contaPagar.setCategoria(categoria);
        }

        if (dto.descricao() != null)
            contaPagar.setDescricao(dto.descricao());

        if (dto.dataEmissao() != null)
            contaPagar.setDataEmissao(dto.dataEmissao());

        if (dto.valorTotal() != null)
            contaPagar.setValorTotal(dto.valorTotal());

        if (dto.observacao() != null)
            contaPagar.setObservacao(dto.observacao());

        if (dto.ativo() != null)
            contaPagar.setAtivo(dto.ativo());

        if (dto.status() == StatusConta.CANCELADO) {
            if (contaPagar.getStatus() != StatusConta.CANCELADO) {
                boolean possuiPagamentos = contaPagar.getParcelas().stream()
                        .anyMatch(p -> !p.getPagamentos().isEmpty());

                if (possuiPagamentos)
                    throw new BadRequestException("Não é possível cancelar uma conta com pagamentos");

                contaPagar.setStatus(StatusConta.CANCELADO);
                contaPagar.getParcelas().forEach(p -> p.setStatus(StatusConta.CANCELADO));
                parcelaRepository.saveAll(contaPagar.getParcelas());
            }
        } else if (dto.status() == StatusConta.ABERTO) {
            if (contaPagar.getStatus() == StatusConta.CANCELADO) {
                contaPagar.setStatus(StatusConta.ABERTO);
                contaPagar.getParcelas().forEach(p -> p.setStatus(StatusConta.ABERTO));
                parcelaRepository.saveAll(contaPagar.getParcelas());
            } else if (contaPagar.getStatus() != StatusConta.ABERTO) {
                throw new BadRequestException("O status da conta é calculado pelas parcelas");
            }
        } else if (dto.status() != null) {
            throw new BadRequestException("O status da conta é calculado pelas parcelas");
        }

        if (dto.parcelas() != null) {
            if (dto.parcelas().isEmpty())
                throw new BadRequestException("É necessário ao menos uma parcela");

            if (contaPagar.getStatus() == StatusConta.CANCELADO)
                throw new BadRequestException("Não é possível alterar as parcelas de uma conta cancelada");

            if (!Boolean.TRUE.equals(contaPagar.getAtivo()))
                throw new BadRequestException("Não é possível alterar as parcelas de uma conta inativa");

            boolean possuiPagamentos = contaPagar.getParcelas().stream()
                    .anyMatch(p -> !p.getPagamentos().isEmpty());

            if (possuiPagamentos)
                throw new BadRequestException("Não é possível alterar as parcelas de uma conta com pagamentos");

            BigDecimal somaParcelas = dto.parcelas().stream()
                    .map(ContaPagarParcelaItemDto::valor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (somaParcelas.compareTo(contaPagar.getValorTotal()) != 0)
                throw new BadRequestException("A soma das parcelas deve ser igual ao valor total da conta");

            parcelaRepository.deleteAll(contaPagar.getParcelas());
            parcelaRepository.flush();
            contaPagar.getParcelas().clear();

            for (int i = 0; i < dto.parcelas().size(); i++) {
                ContaPagarParcelaItemDto item = dto.parcelas().get(i);

                if (item.dataVencimento().isBefore(contaPagar.getDataEmissao()))
                    throw new BadRequestException("Data de vencimento da parcela não pode ser anterior à data de emissão");

                ContaPagarParcela parcela = new ContaPagarParcela();
                parcela.setTenant(tenant);
                parcela.setContaPagar(contaPagar);
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

                contaPagar.getParcelas().add(parcelaRepository.save(parcela));
            }
        } else {
            if (dto.valorTotal() != null && !contaPagar.getParcelas().isEmpty()) {
                BigDecimal somaParcelas = contaPagar.getParcelas().stream()
                        .map(ContaPagarParcela::getValor)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (somaParcelas.compareTo(contaPagar.getValorTotal()) != 0)
                    throw new BadRequestException("A soma das parcelas deve ser igual ao valor total da conta");
            }

            if (dto.dataEmissao() != null) {
                boolean vencimentoAnterior = contaPagar.getParcelas().stream()
                        .anyMatch(p -> p.getDataVencimento().isBefore(contaPagar.getDataEmissao()));

                if (vencimentoAnterior)
                    throw new BadRequestException("Data de vencimento da parcela não pode ser anterior à data de emissão");
            }
        }

        return ContaPagarMapper.toResponseDto(repository.save(contaPagar));
    }

    @Transactional
    public ContaPagarResponseDto pagarParcela(UUID parcelaId, PagamentoCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        UUID contaPagarId = parcelaRepository.findContaPagarIdById(parcelaId, tenant.getId())
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        ContaPagar contaPagar = repository.findByIdForUpdate(contaPagarId)
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        ContaPagarParcela parcela = parcelaRepository.findById(parcelaId)
                .orElseThrow(() -> new NotFoundException("Parcela não encontrada"));

        if (!Boolean.TRUE.equals(contaPagar.getAtivo()))
            throw new BadRequestException("Conta a pagar inativa");

        if (contaPagar.getStatus() == StatusConta.CANCELADO)
            throw new BadRequestException("Conta a pagar cancelada");

        if (parcela.getStatus() == StatusConta.PAGO)
            throw new BadRequestException("Parcela já está paga");

        if (parcela.getStatus() == StatusConta.CANCELADO)
            throw new BadRequestException("Parcela cancelada");

        BigDecimal juros    = dto.juros()    != null ? dto.juros()    : BigDecimal.ZERO;
        BigDecimal multa    = dto.multa()    != null ? dto.multa()    : BigDecimal.ZERO;
        BigDecimal desconto = dto.desconto() != null ? dto.desconto() : BigDecimal.ZERO;

        BigDecimal saldo = parcela.getValor().subtract(parcela.getPagamentos().stream()
                .map(p -> p.getValor().add(p.getDesconto()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        BigDecimal abatido = dto.valor().add(desconto);

        if (abatido.compareTo(saldo) > 0)
            throw new BadRequestException("Valor pago maior que o saldo da parcela");

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
                contaPagar.getCategoria(),
                TipoLancamento.SAIDA,
                OrigemLancamento.PAGAMENTO,
                dto.valor().add(juros).add(multa),
                dto.dataPagamento(),
                "Pagamento parcela " + parcela.getNumeroParcela()
                        + (contaPagar.getDescricao() != null ? " - " + contaPagar.getDescricao() : ""));

        Pagamento pagamento = new Pagamento();
        pagamento.setTenant(tenant);
        pagamento.setContaPagarParcela(parcela);
        pagamento.setFormaPagamento(formaPagamento);
        pagamento.setContaFinanceira(contaFinanceira);
        pagamento.setLancamentoFinanceiro(lancamento);
        pagamento.setDataPagamento(dto.dataPagamento());
        pagamento.setValor(dto.valor());
        pagamento.setJuros(juros);
        pagamento.setMulta(multa);
        pagamento.setDesconto(desconto);
        pagamento.setObservacao(dto.observacao());

        parcela.getPagamentos().add(pagamentoRepository.save(pagamento));

        if (saldo.subtract(abatido).compareTo(BigDecimal.ZERO) <= 0)
            parcela.setStatus(StatusConta.PAGO);
        else
            parcela.setStatus(StatusConta.PARCIALMENTE_PAGO);

        parcelaRepository.save(parcela);

        long pagas = contaPagar.getParcelas().stream()
                .filter(p -> p.getStatus() == StatusConta.PAGO)
                .count();

        boolean possuiPagamentos = contaPagar.getParcelas().stream()
                .anyMatch(p -> p.getStatus() == StatusConta.PAGO || p.getStatus() == StatusConta.PARCIALMENTE_PAGO);

        if (pagas == contaPagar.getParcelas().size())
            contaPagar.setStatus(StatusConta.PAGO);
        else if (possuiPagamentos)
            contaPagar.setStatus(StatusConta.PARCIALMENTE_PAGO);
        else
            contaPagar.setStatus(StatusConta.ABERTO);

        return ContaPagarMapper.toResponseDto(repository.save(contaPagar));
    }

    @Transactional
    public ContaPagarResponseDto estornarPagamento(UUID pagamentoId) {
        Tenant tenant = usuarioService.getTenantLogado();

        UUID contaPagarId = pagamentoRepository.findContaPagarIdById(pagamentoId, tenant.getId())
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado"));

        ContaPagar contaPagar = repository.findByIdForUpdate(contaPagarId)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado"));

        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado"));

        if (contaPagar.getStatus() == StatusConta.CANCELADO)
            throw new BadRequestException("Conta a pagar cancelada");

        ContaPagarParcela parcela = pagamento.getContaPagarParcela();
        LancamentoFinanceiro lancamento = pagamento.getLancamentoFinanceiro();

        parcela.getPagamentos().remove(pagamento);
        pagamentoRepository.delete(pagamento);
        lancamentoFinanceiroRepository.delete(lancamento);

        BigDecimal saldo = parcela.getValor().subtract(parcela.getPagamentos().stream()
                .map(p -> p.getValor().add(p.getDesconto()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        if (parcela.getPagamentos().isEmpty())
            parcela.setStatus(StatusConta.ABERTO);
        else if (saldo.compareTo(BigDecimal.ZERO) <= 0)
            parcela.setStatus(StatusConta.PAGO);
        else
            parcela.setStatus(StatusConta.PARCIALMENTE_PAGO);

        parcelaRepository.save(parcela);

        long pagas = contaPagar.getParcelas().stream()
                .filter(p -> p.getStatus() == StatusConta.PAGO)
                .count();

        boolean possuiPagamentos = contaPagar.getParcelas().stream()
                .anyMatch(p -> p.getStatus() == StatusConta.PAGO || p.getStatus() == StatusConta.PARCIALMENTE_PAGO);

        if (pagas == contaPagar.getParcelas().size())
            contaPagar.setStatus(StatusConta.PAGO);
        else if (possuiPagamentos)
            contaPagar.setStatus(StatusConta.PARCIALMENTE_PAGO);
        else
            contaPagar.setStatus(StatusConta.ABERTO);

        return ContaPagarMapper.toResponseDto(repository.save(contaPagar));
    }
}
