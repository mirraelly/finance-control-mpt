package com.mpt.financecontrol.lancamentofinanceiro.controller;

import com.mpt.financecontrol.financeiro.OrigemLancamento;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroCreateDto;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroResponseDto;
import com.mpt.financecontrol.lancamentofinanceiro.service.LancamentoFinanceiroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/lancamentos")
@Tag(name = "Lançamento Financeiro", description = "Extrato e lançamentos rápidos das contas financeiras")
public class LancamentoFinanceiroController {

    private final LancamentoFinanceiroService service;

    public LancamentoFinanceiroController(LancamentoFinanceiroService service) {
        this.service = service;
    }

    @Operation(summary = "Listar lançamentos", description = "Retorna o extrato paginado de lançamentos com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<LancamentoFinanceiroResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "data", direction = Sort.Direction.DESC) Pageable pageable,

            @Parameter(description = "Filtro por conta financeira")
            @RequestParam(required = false) UUID contaFinanceiraId,

            @Parameter(description = "Filtro por tipo")
            @RequestParam(required = false) TipoLancamento tipo,

            @Parameter(description = "Filtro por origem")
            @RequestParam(required = false) OrigemLancamento origem,

            @Parameter(description = "Data inicial")
            @RequestParam(required = false) LocalDate dataInicio,

            @Parameter(description = "Data final")
            @RequestParam(required = false) LocalDate dataFim
    ) {
        return service.getAll(pageable, contaFinanceiraId, tipo, origem, dataInicio, dataFim);
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um lançamento pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LancamentoFinanceiroResponseDto> findById(
            @Parameter(description = "ID do lançamento")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar lançamento rápido", description = "Registra uma entrada ou saída manual em uma conta financeira")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou conta financeira inativa"),
            @ApiResponse(responseCode = "404", description = "Conta financeira ou categoria não encontrada")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LancamentoFinanceiroResponseDto> create(
            @RequestBody @Valid LancamentoFinanceiroCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Excluir lançamento", description = "Exclui um lançamento manual")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Excluído com sucesso"),
            @ApiResponse(responseCode = "400", description = "Lançamento gerado automaticamente"),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do lançamento")
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
