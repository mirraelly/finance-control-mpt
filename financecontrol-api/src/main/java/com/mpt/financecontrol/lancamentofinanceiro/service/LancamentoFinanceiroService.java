package com.mpt.financecontrol.lancamentofinanceiro.service;

import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.service.CategoriaService;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.financeiro.OrigemLancamento;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroCreateDto;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroResponseDto;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroUpdateDto;
import com.mpt.financecontrol.lancamentofinanceiro.entity.LancamentoFinanceiro;
import com.mpt.financecontrol.lancamentofinanceiro.mapper.LancamentoFinanceiroMapper;
import com.mpt.financecontrol.lancamentofinanceiro.repository.LancamentoFinanceiroRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class LancamentoFinanceiroService {

    private final LancamentoFinanceiroRepository repository;
    private final UsuarioService usuarioService;
    private final ContaFinanceiraService contaFinanceiraService;
    private final CategoriaService categoriaService;

    public LancamentoFinanceiroService(
            LancamentoFinanceiroRepository repository,
            UsuarioService                 usuarioService,
            ContaFinanceiraService         contaFinanceiraService,
            CategoriaService               categoriaService
    ) {
        this.repository             = repository;
        this.usuarioService         = usuarioService;
        this.contaFinanceiraService = contaFinanceiraService;
        this.categoriaService       = categoriaService;
    }

    @Transactional(readOnly = true)
    public LancamentoFinanceiro findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        LancamentoFinanceiro lancamento = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lançamento financeiro não encontrado"));

        if (!lancamento.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Lançamento financeiro não encontrado");

        return lancamento;
    }

    @Transactional(readOnly = true)
    public LancamentoFinanceiroResponseDto findByIdResponse(UUID id) {
        return LancamentoFinanceiroMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<LancamentoFinanceiroResponseDto> getAll(
            Pageable         pageable,
            UUID             contaFinanceiraId,
            TipoLancamento   tipo,
            OrigemLancamento origem,
            LocalDate        dataInicio,
            LocalDate        dataFim
    ) {
        Tenant tenant = usuarioService.getTenantLogado();
        return repository.findAllWithFilters(
                        pageable,
                        tenant.getId(),
                        contaFinanceiraId,
                        tipo != null ? tipo.name() : null,
                        origem != null ? origem.name() : null,
                        dataInicio,
                        dataFim)
                .map(LancamentoFinanceiroMapper::toResponseDto);
    }

    @Transactional
    public LancamentoFinanceiro registrar(
            Tenant           tenant,
            ContaFinanceira  contaFinanceira,
            Categoria        categoria,
            TipoLancamento   tipo,
            OrigemLancamento origem,
            BigDecimal       valor,
            LocalDate        data,
            String           descricao
    ) {
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro();
        lancamento.setTenant(tenant);
        lancamento.setContaFinanceira(contaFinanceira);
        lancamento.setCategoria(categoria);
        lancamento.setTipo(tipo);
        lancamento.setOrigem(origem);
        lancamento.setValor(valor);
        lancamento.setData(data);
        lancamento.setDescricao(descricao != null && descricao.length() > 255 ? descricao.substring(0, 255) : descricao);

        return repository.save(lancamento);
    }

    @Transactional
    public LancamentoFinanceiroResponseDto create(LancamentoFinanceiroCreateDto dto) {
        Tenant tenant = usuarioService.getTenantLogado();

        ContaFinanceira contaFinanceira = contaFinanceiraService.findById(dto.contaFinanceiraId());

        if (!Boolean.TRUE.equals(contaFinanceira.getAtivo()))
            throw new BadRequestException("Conta financeira inativa");

        Categoria categoria = dto.categoriaId() != null ? categoriaService.findById(dto.categoriaId()) : null;

        return LancamentoFinanceiroMapper.toResponseDto(registrar(
                tenant,
                contaFinanceira,
                categoria,
                dto.tipo(),
                OrigemLancamento.MANUAL,
                dto.valor(),
                dto.data(),
                dto.descricao()));
    }

    @Transactional
    public LancamentoFinanceiroResponseDto update(UUID id, LancamentoFinanceiroUpdateDto dto) {
        LancamentoFinanceiro lancamento = findById(id);

        if (lancamento.getOrigem() != OrigemLancamento.MANUAL)
            throw new BadRequestException("Lançamento gerado automaticamente não pode ser editado por aqui");

        ContaFinanceira contaFinanceira = contaFinanceiraService.findById(dto.contaFinanceiraId());
        if (!Boolean.TRUE.equals(contaFinanceira.getAtivo()))
            throw new BadRequestException("Conta financeira inativa");

        Categoria categoria = dto.categoriaId() != null
                ? categoriaService.findById(dto.categoriaId())
                : null;

        lancamento.setContaFinanceira(contaFinanceira);
        lancamento.setCategoria(categoria);
        lancamento.setTipo(dto.tipo());
        lancamento.setValor(dto.valor());
        lancamento.setData(dto.data());
        lancamento.setDescricao(dto.descricao());

        return LancamentoFinanceiroMapper.toResponseDto(repository.save(lancamento));
    }

    @Transactional
    public void delete(UUID id) {
        LancamentoFinanceiro lancamento = findById(id);

        if (lancamento.getOrigem() != OrigemLancamento.MANUAL)
            throw new BadRequestException("Lançamento gerado por recebimento, pagamento ou transferência não pode ser excluído por aqui");

        repository.delete(lancamento);
    }
}
