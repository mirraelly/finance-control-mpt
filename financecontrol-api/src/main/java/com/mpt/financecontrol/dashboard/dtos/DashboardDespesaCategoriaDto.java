package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;

public record DashboardDespesaCategoriaDto(
        String categoria,
        BigDecimal valor
) {
}
