package com.mpt.financecontrol.categoria.controller;

import com.mpt.financecontrol.categoria.dtos.CategoriaCreateDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaResponseDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaUpdateDto;
import com.mpt.financecontrol.categoria.service.CategoriaService;
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
@RequestMapping("/categorias")
@Tag(name = "Categoria", description = "Gerenciamento de categorias")
public class CategoriaController {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @Operation(summary = "Listar categorias", description = "Retorna lista paginada de categorias com filtro por nome")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<CategoriaResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome
    ) {
        return service.getAll(pageable, nome);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de categorias (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<CategoriaResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma categoria pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CategoriaResponseDto> findById(
            @Parameter(description = "ID da categoria")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar categoria", description = "Cria uma nova categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: nome já existente)")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CategoriaResponseDto> create(
            @RequestBody @Valid CategoriaCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar categoria", description = "Atualiza (substitui) uma categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CategoriaResponseDto> update(
            @Parameter(description = "ID da categoria")
            @PathVariable UUID id,

            @RequestBody @Valid CategoriaUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
