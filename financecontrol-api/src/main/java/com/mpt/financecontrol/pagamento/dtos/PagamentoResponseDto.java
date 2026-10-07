package com.mpt.financecontrol.pagamento.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PagamentoResponseDto(
        UUID       id,
        UUID       formaPagamentoId,
        String     formaPagamentoNome,
        UUID       contaFinanceiraId,
        String     contaFinanceiraNome,
        UUID       lancamentoFinanceiroId,
        LocalDate  dataPagamento,
        BigDecimal valor,
        BigDecimal juros,
        BigDecimal multa,
        BigDecimal desconto,
        String     observacao,
        Instant    createdAt
) {}
