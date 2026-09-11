package com.mpt.financecontrol.contapagar.controller;

import com.mpt.financecontrol.contapagar.dtos.ContaPagarCreateDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarResponseDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarUpdateDto;
import com.mpt.financecontrol.contapagar.service.ContaPagarService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contas-pagar")
@Tag(name = "Conta Pagar", description = "Gerenciamento de contas a pagar")
public class ContaPagarController {

    private final ContaPagarService service;

    public ContaPagarController(ContaPagarService service) {
        this.service = service;
    }

    @Operation(summary = "Listar contas a pagar", description = "Retorna lista paginada de contas a pagar com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<ContaPagarResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "dataEmissao") Pageable pageable,

            @Parameter(description = "Filtro por pessoa")
            @RequestParam(required = false) UUID pessoaId,

            @Parameter(description = "Filtro por categoria")
            @RequestParam(required = false) UUID categoriaId,

            @Parameter(description = "Filtro por status")
            @RequestParam(required = false) StatusConta status,

            @Parameter(description = "Filtro por ativo")
            @RequestParam(required = false) Boolean ativo
    ) {
        return service.getAll(pageable, pessoaId, categoriaId, status, ativo);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de contas a pagar (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<ContaPagarResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma conta a pagar pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> findById(
            @Parameter(description = "ID da conta a pagar")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar conta a pagar", description = "Cria uma nova conta a pagar")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pessoa ou categoria não encontrada")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> create(
            @RequestBody @Valid ContaPagarCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar conta a pagar", description = "Atualiza parcialmente uma conta a pagar")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> update(
            @Parameter(description = "ID da conta a pagar")
            @PathVariable UUID id,

            @RequestBody @Valid ContaPagarUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
