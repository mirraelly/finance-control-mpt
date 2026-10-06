package com.mpt.financecontrol.contapagarparcela.controller;

import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaCreateDto;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaResponseDto;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaUpdateDto;
import com.mpt.financecontrol.contapagarparcela.service.ContaPagarParcelaService;
import com.mpt.financecontrol.financeiro.StatusConta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/contas-pagar-parcelas")
@Tag(name = "Conta Pagar Parcela", description = "Gerenciamento de parcelas de contas a pagar")
public class ContaPagarParcelaController {

    private final ContaPagarParcelaService service;

    public ContaPagarParcelaController(ContaPagarParcelaService service) {
        this.service = service;
    }

    @Operation(summary = "Listar parcelas", description = "Retorna lista paginada de parcelas com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<ContaPagarParcelaResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "dataVencimento") Pageable pageable,

            @Parameter(description = "Filtro por pessoa")
            @RequestParam(required = false) UUID pessoaId,

            @Parameter(description = "Filtro por status")
            @RequestParam(required = false) StatusConta status,

            @Parameter(description = "Filtro por vencimento a partir de")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVencimentoInicio,

            @Parameter(description = "Filtro por vencimento até")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVencimentoFim
    ) {
        return service.getAll(pageable, pessoaId, status, dataVencimentoInicio, dataVencimentoFim);
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma parcela pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarParcelaResponseDto> findById(
        @Parameter(description = "ID da parcela")
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar parcela", description = "Cria uma nova parcela de conta a pagar")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Conta a pagar ou forma de pagamento não encontrada")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarParcelaResponseDto> create(
        @RequestBody @Valid ContaPagarParcelaCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar parcela", description = "Atualiza parcialmente uma parcela")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarParcelaResponseDto> update(
        @Parameter(description = "ID da parcela")
        @PathVariable UUID id,

        @RequestBody @Valid ContaPagarParcelaUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

}
