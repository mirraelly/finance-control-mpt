package com.mpt.financecontrol.tipotelefone.controller;

import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneCreateDto;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneResponseDto;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneUpdateDto;
import com.mpt.financecontrol.tipotelefone.service.TipoTelefoneService;
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
@RequestMapping("/tipos/telefone")
@Tag(name = "Tipo Telefone", description = "Gerenciamento de tipos de telefone")
public class TipoTelefoneController {

    private final TipoTelefoneService service;

    public TipoTelefoneController(TipoTelefoneService service) {
        this.service = service;
    }

    @Operation(summary = "Listar tipos de telefone", description = "Retorna lista paginada de tipos de telefone com filtro por nome")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<TipoTelefoneResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome
    ) {
        return service.getAll(pageable, nome);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de tipos de telefone (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<TipoTelefoneResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um tipo de telefone pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TipoTelefoneResponseDto> findById(
            @Parameter(description = "ID do tipo de telefone")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar tipo de telefone", description = "Cria um novo tipo de telefone")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: nome já existente)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<TipoTelefoneResponseDto> create(
            @RequestBody @Valid TipoTelefoneCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar tipo de telefone", description = "Atualiza (substitui) um tipo de telefone")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<TipoTelefoneResponseDto> update(
            @Parameter(description = "ID do tipo de telefone")
            @PathVariable UUID id,

            @RequestBody @Valid TipoTelefoneUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
