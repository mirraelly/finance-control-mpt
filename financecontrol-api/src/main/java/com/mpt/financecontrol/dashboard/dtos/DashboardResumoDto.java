package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.time.YearMonth;

public record DashboardResumoDto(
        YearMonth mes,
        BigDecimal saldoTotal,
        BigDecimal receitasMes,
        BigDecimal despesasMes,
        BigDecimal saldoMes
) {
}
