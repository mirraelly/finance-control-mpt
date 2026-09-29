package com.mpt.financecontrol.transferenciaentrecontas.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TransferenciaEntreContasResponseDto(
        UUID       id,
        UUID       contaOrigemId,
        String     contaOrigemNome,
        UUID       contaDestinoId,
        String     contaDestinoNome,
        BigDecimal valor,
        LocalDate  data,
        String     descricao,
        UUID       lancamentoSaidaId,
        UUID       lancamentoEntradaId,
        Instant    createdAt
) {}
