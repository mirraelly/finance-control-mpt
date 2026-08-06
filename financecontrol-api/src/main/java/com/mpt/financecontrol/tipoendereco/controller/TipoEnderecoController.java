package com.mpt.financecontrol.tipoendereco.controller;

import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoCreateDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoResponseDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoUpdateDto;
import com.mpt.financecontrol.tipoendereco.service.TipoEnderecoService;
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
@RequestMapping("/tipos/endereco")
@Tag(name = "Tipo Endereco", description = "Gerenciamento de tipos de endereco")
public class TipoEnderecoController {

    private final TipoEnderecoService service;

    public TipoEnderecoController(TipoEnderecoService service) {
        this.service = service;
    }

    @Operation(summary = "Listar tipos de endereco", description = "Retorna lista paginada de tipos de endereco com filtro por nome")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<TipoEnderecoResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome
    ) {
        return service.getAll(pageable, nome);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de tipos de endereco (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<TipoEnderecoResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um tipo de endereco pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TipoEnderecoResponseDto> findById(
            @Parameter(description = "ID do tipo de endereco")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar tipo de endereco", description = "Cria um novo tipo de endereco")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: nome já existente)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<TipoEnderecoResponseDto> create(
            @RequestBody @Valid TipoEnderecoCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar tipo de endereco", description = "Atualiza (substitui) um tipo de endereco")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<TipoEnderecoResponseDto> update(
            @Parameter(description = "ID do tipo de endereco")
            @PathVariable UUID id,

            @RequestBody @Valid TipoEnderecoUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
