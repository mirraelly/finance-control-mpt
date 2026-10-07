package com.mpt.financecontrol.contapagarparcela.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarParcelaBaixaDto(
        UUID        id,
        UUID        contaPagarId,
        String      descricao,
        UUID        pessoaId,
        String      pessoaNome,
        Integer     numeroParcela,
        Integer     totalParcelas,
        LocalDate   dataVencimento,
        BigDecimal  valor,
        BigDecimal  saldo,
        UUID        formaPagamentoId,
        String      formaPagamentoNome,
        StatusConta status
) {}
