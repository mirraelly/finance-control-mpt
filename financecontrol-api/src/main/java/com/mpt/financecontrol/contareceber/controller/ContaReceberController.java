package com.mpt.financecontrol.contareceber.controller;

import com.mpt.financecontrol.contareceber.dtos.ContaReceberCreateDto;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberResponseDto;
import com.mpt.financecontrol.contareceber.dtos.ContaReceberUpdateDto;
import com.mpt.financecontrol.contareceber.service.ContaReceberService;
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
@RequestMapping("/contas-receber")
@Tag(name = "Conta Receber", description = "Gerenciamento de contas a receber")
public class ContaReceberController {
    private final ContaReceberService service;

    public ContaReceberController(ContaReceberService service) {
        this.service = service;
    }

    @Operation(summary = "Listar contas a receber", description = "Retorna lista paginada de contas a receber com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<ContaReceberResponseDto> getAll(
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

    @Operation(summary = "Listar para select", description = "Retorna lista simples de contas a receber (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<ContaReceberResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma conta a receber pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaReceberResponseDto> findById(
            @Parameter(description = "ID da conta a receber")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar conta a receber", description = "Cria uma nova conta a receber")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pessoa ou categoria não encontrada")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaReceberResponseDto> create(
            @RequestBody @Valid ContaReceberCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar conta a receber", description = "Atualiza parcialmente uma conta a receber")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaReceberResponseDto> update(
            @Parameter(description = "ID da conta a receber")
            @PathVariable UUID id,

            @RequestBody @Valid ContaReceberUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

}