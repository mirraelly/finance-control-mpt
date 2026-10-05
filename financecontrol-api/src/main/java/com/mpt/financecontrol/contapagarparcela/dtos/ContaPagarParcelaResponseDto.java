package com.mpt.financecontrol.contapagarparcela.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarParcelaResponseDto (

        UUID id,
        UUID contaPagarId,
        Integer numeroParcela,
        LocalDate dataVencimento,
        BigDecimal valor,
        UUID formaPagamentoId,
        String formaPagamentoNome,
        StatusConta status,
        String observacao,
        Instant createdAt,
        Instant updatedAt

    ){}

