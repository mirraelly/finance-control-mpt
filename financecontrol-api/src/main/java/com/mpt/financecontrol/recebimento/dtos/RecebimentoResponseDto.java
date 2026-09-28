package com.mpt.financecontrol.recebimento.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RecebimentoResponseDto(
        UUID       id,
        UUID       formaPagamentoId,
        String     formaPagamentoNome,
        UUID       contaFinanceiraId,
        String     contaFinanceiraNome,
        LocalDate  dataRecebimento,
        BigDecimal valor,
        BigDecimal juros,
        BigDecimal multa,
        BigDecimal desconto,
        String     observacao,
        Instant    createdAt
) {}
