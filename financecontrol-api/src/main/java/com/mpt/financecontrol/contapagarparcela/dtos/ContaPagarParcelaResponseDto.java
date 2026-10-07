package com.mpt.financecontrol.contapagarparcela.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.pagamento.dtos.PagamentoResponseDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContaPagarParcelaResponseDto(
        UUID                       id,
        Integer                    numeroParcela,
        LocalDate                  dataVencimento,
        BigDecimal                 valor,
        UUID                       formaPagamentoId,
        String                     formaPagamentoNome,
        StatusConta                status,
        String                     observacao,
        List<PagamentoResponseDto> pagamentos
) {}
