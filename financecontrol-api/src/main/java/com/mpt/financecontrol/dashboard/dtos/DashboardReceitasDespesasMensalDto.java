package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.time.YearMonth;

public record DashboardReceitasDespesasMensalDto(
        YearMonth anoMes,
        BigDecimal receitas,
        BigDecimal despesas
) {
}
