package com.mpt.financecontrol.contafinanceira.dtos;

import java.time.Instant;
import java.util.UUID;

public record ContaFinanceiraResponseDto(
        UUID id,
        String nome,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
