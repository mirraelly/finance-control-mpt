package com.mpt.financecontrol.contareceberparcela.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.recebimento.dtos.RecebimentoResponseDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContaReceberParcelaResponseDto(
        UUID                         id,
        Integer                      numeroParcela,
        LocalDate                    dataVencimento,
        BigDecimal                   valor,
        UUID                         formaPagamentoId,
        String                       formaPagamentoNome,
        StatusConta                  status,
        String                       observacao,
        List<RecebimentoResponseDto> recebimentos
) {}
