package com.mpt.financecontrol.contafinanceira.dtos;

import com.mpt.financecontrol.financeiro.TipoContaFinanceira;

import java.math.BigDecimal;
import java.util.UUID;

public record ContaFinanceiraSaldoDto(
        UUID                id,
        String              nome,
        TipoContaFinanceira tipo,
        BigDecimal          saldo
) {}
