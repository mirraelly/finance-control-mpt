package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.UUID;

public record DashboardSaldoContaMensalDto(
        YearMonth anoMes,
        UUID contaId,
        String conta,
        BigDecimal saldo
) {
}
