package com.mpt.financecontrol.dashboard.dtos;

import com.mpt.financecontrol.financeiro.TipoLancamento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardLancamentoDiarioDto(
        LocalDate data,
        TipoLancamento tipo,
        BigDecimal total
) {
}
