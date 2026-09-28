package com.mpt.financecontrol.contareceber.dtos;

import com.mpt.financecontrol.contareceberparcela.dtos.ContaReceberParcelaResponseDto;
import com.mpt.financecontrol.financeiro.StatusConta;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContaReceberResponseDto(
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
        List<ContaReceberParcelaResponseDto> parcelas,
        Instant     createdAt,
        Instant     updatedAt
) {}
