package com.mpt.financecontrol.contafinanceira.controller;

import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraCreateDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraResponseDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraUpdateDto;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
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
@RequestMapping("/contas-financeiras")
@Tag(name = "Conta Financeira", description = "Gerenciamento de contas financeiras")
public class ContaFinanceiraController {

    private final ContaFinanceiraService service;

    public ContaFinanceiraController(ContaFinanceiraService service) {
        this.service = service;
    }

    @Operation(summary = "Listar contas financeiras", description = "Retorna lista paginada de contas financeiras com filtro por nome")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<ContaFinanceiraResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome
    ) {
        return service.getAll(pageable, nome);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de contas financeiras (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<ContaFinanceiraResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma conta financeira pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaFinanceiraResponseDto> findById(
            @Parameter(description = "ID da conta financeira")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar conta financeira", description = "Cria uma nova conta financeira")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: nome já existente)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<ContaFinanceiraResponseDto> create(
            @RequestBody @Valid ContaFinanceiraCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar conta financeira", description = "Atualiza (substitui) uma conta financeira")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<ContaFinanceiraResponseDto> update(
            @Parameter(description = "ID da conta financeira")
            @PathVariable UUID id,

            @RequestBody @Valid ContaFinanceiraUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
