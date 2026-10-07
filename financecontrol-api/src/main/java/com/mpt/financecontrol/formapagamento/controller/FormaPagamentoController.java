package com.mpt.financecontrol.formapagamento.controller;

import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoCreateDto;
import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoResponseDto;
import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoUpdateDto;
import com.mpt.financecontrol.formapagamento.service.FormaPagamentoService;
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
@RequestMapping("/formas-pagamento")
@Tag(name = "Forma Pagamento", description = "Gerenciamento de formas de pagamento")
public class FormaPagamentoController {

    private final FormaPagamentoService service;

    public FormaPagamentoController(FormaPagamentoService service) {
        this.service = service;
    }

    @Operation(summary = "Listar formas de pagamento", description = "Retorna lista paginada de formas de pagamento com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<FormaPagamentoResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome,

            @Parameter(description = "Filtro por ativo")
            @RequestParam(required = false) Boolean ativo
    ) {
        return service.getAll(pageable, nome, ativo);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de formas de pagamento (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<FormaPagamentoResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma forma de pagamento pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FormaPagamentoResponseDto> findById(
            @Parameter(description = "ID da forma de pagamento")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar forma de pagamento", description = "Cria uma nova forma de pagamento")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou conta financeira inativa"),
            @ApiResponse(responseCode = "404", description = "Conta financeira não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: nome já existente)")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FormaPagamentoResponseDto> create(
            @RequestBody @Valid FormaPagamentoCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar forma de pagamento", description = "Atualiza (substitui) uma forma de pagamento")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou conta financeira inativa"),
            @ApiResponse(responseCode = "404", description = "Não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FormaPagamentoResponseDto> update(
            @Parameter(description = "ID da forma de pagamento")
            @PathVariable UUID id,

            @RequestBody @Valid FormaPagamentoUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
