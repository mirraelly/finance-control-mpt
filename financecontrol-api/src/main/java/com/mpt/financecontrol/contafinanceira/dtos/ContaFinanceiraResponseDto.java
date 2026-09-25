package com.mpt.financecontrol.contafinanceira.dtos;

import com.mpt.financecontrol.financeiro.TipoContaFinanceira;

import java.time.Instant;
import java.util.UUID;

public record ContaFinanceiraResponseDto(
        UUID id,
        String nome,
        TipoContaFinanceira tipo,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
