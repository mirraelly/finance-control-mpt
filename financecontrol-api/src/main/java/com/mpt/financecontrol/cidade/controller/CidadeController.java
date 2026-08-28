package com.mpt.financecontrol.cidade.controller;

import com.mpt.financecontrol.cidade.dtos.CidadeCreateDto;
import com.mpt.financecontrol.cidade.dtos.CidadeResponseDto;
import com.mpt.financecontrol.cidade.dtos.CidadeUpdateDto;
import com.mpt.financecontrol.cidade.service.CidadeService;
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
@RequestMapping("/cidades")
@Tag(name = "Cidade", description = "Gerenciamento de cidades")
public class CidadeController {

    private final CidadeService service;

    public CidadeController(CidadeService service) {
        this.service = service;
    }

    @Operation(summary = "Listar cidades", description = "Retorna lista paginada de cidades com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<CidadeResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome,

            @Parameter(description = "Filtro por estado")
            @RequestParam(required = false) UUID estadoId,

            @Parameter(description = "Filtro por código IBGE")
            @RequestParam(required = false) Integer codigoIbge,

            @Parameter(description = "Filtro por ativo")
            @RequestParam(required = false) Boolean ativo
    ) {
        return service.getAll(pageable, nome, estadoId, codigoIbge, ativo);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de cidades (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<CidadeResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma cidade pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CidadeResponseDto> findById(
            @Parameter(description = "ID da cidade")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar cidade", description = "Cria uma nova cidade")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Estado não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: cidade já existente no estado)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<CidadeResponseDto> create(
            @RequestBody @Valid CidadeCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar cidade", description = "Atualiza parcialmente uma cidade")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<CidadeResponseDto> update(
            @Parameter(description = "ID da cidade")
            @PathVariable UUID id,

            @RequestBody @Valid CidadeUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
