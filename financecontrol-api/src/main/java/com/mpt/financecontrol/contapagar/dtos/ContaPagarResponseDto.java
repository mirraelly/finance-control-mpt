package com.mpt.financecontrol.contapagar.dtos;

import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaResponseDto;
import com.mpt.financecontrol.financeiro.StatusConta;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContaPagarResponseDto(
        UUID        id,
        UUID        pessoaId,
        String      pessoaNome,
        UUID        categoriaId,
        String      categoriaNome,
        String      descricao,
        LocalDate   dataEmissao,
        BigDecimal  valorTotal,
        StatusConta status,
        String      observacao,
        Boolean     ativo,
        List<ContaPagarParcelaResponseDto> parcelas,
        Instant     createdAt,
        Instant     updatedAt
) {}
