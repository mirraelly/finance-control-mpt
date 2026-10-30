package com.mpt.financecontrol.dashboard.controller;

import com.mpt.financecontrol.dashboard.dtos.DashboardCategoriaValorDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaAtualDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaMensalDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardPatrimonioDto;
import com.mpt.financecontrol.dashboard.service.DashboardService;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import com.mpt.financecontrol.dashboard.dtos.DashboardReceitasDespesasMensalDto;

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

    @Operation(summary = "Consultar receitas e despesas agrupadas por mes")
    @GetMapping("/receitas-despesas")
    @PreAuthorize("isAuthenticated()")
    public List<DashboardReceitasDespesasMensalDto> receitasDespesas(
            @Parameter(
                    description = "Data inicial do período no formato AAAA-MM-DD.",
                    example = "2026-05-01",
                    required = true
            )
            @RequestParam(name = "dataInicio")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(
                    description = "Data final do período no formato AAAA-MM-DD.",
                    example = "2026-10-31",
                    required = true
            )
            @RequestParam(name = "dataFim")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return service.buscarReceitasDespesas(dataInicio, dataFim);
    }

    @Operation(summary = "Consultar saldos mensais por conta financeira")
    @GetMapping("/saldos-por-conta")
    @PreAuthorize("isAuthenticated()")
    public List<DashboardSaldoContaMensalDto> saldosPorConta(
            @RequestParam(name = "dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(name = "dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return service.buscarSaldosPorConta(dataInicio, dataFim);
    }

    @Operation(summary = "Consultar saldo atual por conta financeira")
    @GetMapping("/saldo-atual-por-conta")
    @PreAuthorize("isAuthenticated()")
    public List<DashboardSaldoContaAtualDto> saldoAtualPorConta() {
        return service.buscarSaldoAtualPorConta();
    }

    @Operation(summary = "Consultar crescimento patrimonial mensal")
    @GetMapping("/patrimonio")
    @PreAuthorize("isAuthenticated()")
    public DashboardPatrimonioDto patrimonio(
            @Parameter(description = "Ano a ser exibido", example = "2026", required = true)
            @RequestParam(name = "ano") int ano
    ) {
        return service.buscarPatrimonio(ano);
    }

    @Operation(summary = "Consultar despesas agrupadas por categoria")
    @GetMapping("/despesas-por-categoria")
    @PreAuthorize("isAuthenticated()")
    public List<DashboardCategoriaValorDto> despesasPorCategoria(
            @Parameter(
                    description = "Data inicial do período no formato AAAA-MM-DD.",
                    example = "2026-05-01",
                    required = true
            )
            @RequestParam(name = "dataInicio")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(
                    description = "Data final do período no formato AAAA-MM-DD.",
                    example = "2026-10-25",
                    required = true
            )
            @RequestParam(name = "dataFim")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return service.buscarTotaisPorCategoria(TipoLancamento.SAIDA, dataInicio, dataFim);
    }

    @Operation(summary = "Consultar receitas agrupadas por categoria")
    @GetMapping("/receitas-por-categoria")
    @PreAuthorize("isAuthenticated()")
    public List<DashboardCategoriaValorDto> receitasPorCategoria(
            @Parameter(
                    description = "Data inicial do período no formato AAAA-MM-DD.",
                    example = "2026-05-01",
                    required = true
            )
            @RequestParam(name = "dataInicio")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(
                    description = "Data final do período no formato AAAA-MM-DD.",
                    example = "2026-10-25",
                    required = true
            )
            @RequestParam(name = "dataFim")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return service.buscarTotaisPorCategoria(TipoLancamento.ENTRADA, dataInicio, dataFim);
    }

    private YearMonth parseAnoMes(String anoMes) {
        try {
            return YearMonth.parse(anoMes);
        } catch (DateTimeException exception) {
            throw new BadRequestException("O parâmetro anoMes deve estar no formato AAAA-MM");
        }
    }
}
