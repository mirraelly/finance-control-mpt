package com.mpt.financecontrol.formapagamento.dtos;

import java.time.Instant;
import java.util.UUID;

public record FormaPagamentoResponseDto(
        UUID id,
        String nome,
        UUID contaFinanceiraId,
        String contaFinanceiraNome,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
