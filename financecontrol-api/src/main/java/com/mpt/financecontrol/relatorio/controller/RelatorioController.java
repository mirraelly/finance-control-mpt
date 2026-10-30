package com.mpt.financecontrol.relatorio.controller;

import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.relatorio.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/relatorios")
@Tag(name = "Relatório", description = "Relatórios em PDF")
public class RelatorioController {

    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    @Operation(summary = "Relatório de vencimentos", description = "Gera o PDF das parcelas em aberto por período de vencimento")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Relatório gerado com sucesso")
    })
    @GetMapping("/vencimentos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> vencimentos(
            @Parameter(description = "PAGAR, RECEBER ou AMBOS")
            @RequestParam(required = false) String tipo,

            @Parameter(description = "Data inicial do vencimento")
            @RequestParam(required = false) LocalDate dataInicio,

            @Parameter(description = "Data final do vencimento")
            @RequestParam(required = false) LocalDate dataFim
    ) {
        return pdf(service.vencimentos(tipo, dataInicio, dataFim), "relatorio-vencimentos.pdf");
    }

    @Operation(summary = "Relatório de lançamentos", description = "Gera o PDF dos lançamentos financeiros do período")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Relatório gerado com sucesso")
    })
    @GetMapping("/lancamentos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> lancamentos(
            @Parameter(description = "Filtro por tipo")
            @RequestParam(required = false) TipoLancamento tipo,

            @Parameter(description = "Data inicial")
            @RequestParam(required = false) LocalDate dataInicio,

            @Parameter(description = "Data final")
            @RequestParam(required = false) LocalDate dataFim
    ) {
        return pdf(service.lancamentos(tipo, dataInicio, dataFim), "relatorio-lancamentos.pdf");
    }

    @Operation(summary = "Relatório de saldos", description = "Gera o PDF com o saldo atual das contas financeiras")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Relatório gerado com sucesso")
    })
    @GetMapping("/saldos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> saldos() {
        return pdf(service.saldos(), "relatorio-saldos.pdf");
    }

    private ResponseEntity<byte[]> pdf(byte[] conteudo, String nomeArquivo) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(nomeArquivo).build().toString())
                .body(conteudo);
    }
}
