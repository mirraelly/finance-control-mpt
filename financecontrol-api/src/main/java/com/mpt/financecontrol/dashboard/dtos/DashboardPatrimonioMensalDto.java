package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.time.YearMonth;

public record DashboardPatrimonioMensalDto(
        YearMonth anoMes,
        BigDecimal patrimonio,
        BigDecimal variacaoNoMes
) {
}
