package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DashboardSaldoContaDiarioDto(
        UUID contaId,
        String conta,
        LocalDate data,
        BigDecimal movimentacao
) {
}
