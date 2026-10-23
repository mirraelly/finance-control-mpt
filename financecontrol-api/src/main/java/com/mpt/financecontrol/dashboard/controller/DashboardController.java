package com.mpt.financecontrol.dashboard.controller;

import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.dashboard.service.DashboardService;
import com.mpt.financecontrol.exceptions.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.YearMonth;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Indicadores financeiros do usuario autenticado")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @Operation(summary = "Consultar resumo do Dashboard por mês")
    @GetMapping("/resumo")
    @PreAuthorize("isAuthenticated()")
    public DashboardResumoDto resumo(
            @Parameter(
                    description = "Mês e ano de referência no formato AAAA-MM.",
                    example = "2026-10",
                    required = true
            )
            @RequestParam(name = "anoMes") String anoMes
    ) {
        return service.buscarResumo(parseAnoMes(anoMes));
    }

    private YearMonth parseAnoMes(String anoMes) {
        try {
            return YearMonth.parse(anoMes);
        } catch (DateTimeException exception) {
            throw new BadRequestException("O parâmetro anoMes deve estar no formato AAAA-MM");
        }
    }
}
