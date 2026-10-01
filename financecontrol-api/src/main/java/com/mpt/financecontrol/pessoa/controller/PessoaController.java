package com.mpt.financecontrol.pessoa.controller;

import com.mpt.financecontrol.pessoa.TipoPessoa;
import com.mpt.financecontrol.pessoa.dtos.PessoaAtivoDto;
import com.mpt.financecontrol.pessoa.dtos.PessoaCreateDto;
import com.mpt.financecontrol.pessoa.dtos.PessoaResponseDto;
import com.mpt.financecontrol.pessoa.dtos.PessoaUpdateDto;
import com.mpt.financecontrol.pessoa.service.PessoaService;
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
@RequestMapping("/pessoas")
@Tag(name = "Pessoa", description = "Gerenciamento de pessoas")
public class PessoaController {

    private final PessoaService service;

    public PessoaController(PessoaService service) {
        this.service = service;
    }

    @Operation(summary = "Listar pessoas", description = "Retorna lista paginada de pessoas com filtros por nome, CPF/CNPJ, tipo de pessoa e situação")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<PessoaResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome,

            @Parameter(description = "Filtro por CPF ou CNPJ, com ou sem pontuação")
            @RequestParam(required = false) String documento,

            @Parameter(description = "Filtro por tipo de pessoa")
            @RequestParam(required = false) TipoPessoa tipoPessoa,

            @Parameter(description = "Filtro por situação")
            @RequestParam(required = false) Boolean ativo
    ) {
        return service.getAll(pageable, nome, documento, tipoPessoa, ativo);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de pessoas (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<PessoaResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma pessoa pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PessoaResponseDto> findById(
            @Parameter(description = "ID da pessoa")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar pessoa", description = "Cria uma nova pessoa")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PessoaResponseDto> create(
            @RequestBody @Valid PessoaCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar pessoa", description = "Atualiza (substitui) uma pessoa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PessoaResponseDto> update(
            @Parameter(description = "ID da pessoa")
            @PathVariable UUID id,

            @RequestBody @Valid PessoaUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Operation(summary = "Ativa ou inativa uma pessoa")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Situação alterada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @PatchMapping("/{id}/ativo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> alterarAtivo(
            @Parameter(description = "ID da pessoa")
            @PathVariable UUID id,

            @RequestBody @Valid PessoaAtivoDto dto
    ) {
        service.alterarAtivo(id, dto.ativo());
        return ResponseEntity.noContent().build();
    }
}
