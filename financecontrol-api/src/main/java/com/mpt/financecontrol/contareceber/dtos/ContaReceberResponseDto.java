package com.mpt.financecontrol.contareceber.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ContaReceberResponseDto(
        UUID id,
        UUID pessoaId,
        String pessoaNome,
        UUID categoriaId,
        String categoriaNome,
        String descricao,
        LocalDate dataEmissao,
        BigDecimal valorTotal,
        StatusConta status,
        String observacao,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {
}
