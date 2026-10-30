package com.mpt.financecontrol.dashboard.dtos;

import java.util.List;

public record DashboardPatrimonioDto(
        List<Integer> anosDisponiveis,
        List<DashboardPatrimonioMensalDto> meses
) {
}
