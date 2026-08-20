package com.mpt.financecontrol.estado.controller;

import com.mpt.financecontrol.estado.dtos.EstadoCreateDto;
import com.mpt.financecontrol.estado.dtos.EstadoResponseDto;
import com.mpt.financecontrol.estado.dtos.EstadoUpdateDto;
import com.mpt.financecontrol.estado.service.EstadoService;
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
@RequestMapping("/estados")
@Tag(name = "Estado", description = "Gerenciamento de estados")
public class EstadoController {

    private final EstadoService service;

    public EstadoController(EstadoService service) {
        this.service = service;
    }

    @Operation(summary = "Listar estados", description = "Retorna lista paginada de estados com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<EstadoResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome,

            @Parameter(description = "Filtro por sigla")
            @RequestParam(required = false) String sigla,

            @Parameter(description = "Filtro por código IBGE")
            @RequestParam(required = false) Integer codigoIbge,

            @Parameter(description = "Filtro por ativo")
            @RequestParam(required = false) Boolean ativo
    ) {
        return service.getAll(pageable, nome, sigla, codigoIbge, ativo);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de estados (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<EstadoResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um estado pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EstadoResponseDto> findById(
            @Parameter(description = "ID do estado")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar estado", description = "Cria um novo estado")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: sigla já existente)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<EstadoResponseDto> create(
            @RequestBody @Valid EstadoCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar estado", description = "Atualiza parcialmente um estado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<EstadoResponseDto> update(
            @Parameter(description = "ID do estado")
            @PathVariable UUID id,

            @RequestBody @Valid EstadoUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
