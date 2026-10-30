package com.mpt.financecontrol.dashboard.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record DashboardCategoriaValorDto(
        UUID categoriaId,
        String categoria,
        BigDecimal valor
) {
    public DashboardCategoriaValorDto(String categoria, BigDecimal valor) {
        this(null, categoria, valor);
    }
}
