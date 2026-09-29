package com.mpt.financecontrol.lancamentofinanceiro.dtos;

import com.mpt.financecontrol.financeiro.OrigemLancamento;
import com.mpt.financecontrol.financeiro.TipoLancamento;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record LancamentoFinanceiroResponseDto(
        UUID             id,
        UUID             contaFinanceiraId,
        String           contaFinanceiraNome,
        UUID             categoriaId,
        String           categoriaNome,
        TipoLancamento   tipo,
        OrigemLancamento origem,
        BigDecimal       valor,
        String           descricao,
        LocalDate        data,
        Instant          createdAt
) {}
