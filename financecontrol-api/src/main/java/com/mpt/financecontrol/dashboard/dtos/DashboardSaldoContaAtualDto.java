package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record DashboardSaldoContaAtualDto(
        UUID contaId,
        String conta,
        BigDecimal saldo
) {
}
