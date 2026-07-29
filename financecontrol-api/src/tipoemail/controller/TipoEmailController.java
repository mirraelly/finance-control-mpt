package com.mpt.financecontrol.tipoemail.controller;

import com.mpt.financecontrol.tipoemail.dtos.TipoEmailCreateDto;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailResponseDto;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailUpdateDto;
import com.mpt.financecontrol.tipoemail.service.TipoEmailService;
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
@RequestMapping("/tipos/emails")
@Tag(name = "Tipo Email", description = "Gerenciamento de tipos de emails")
public class TipoEmailController {

    private final TipoEmailService service;

    public TipoEmailController(TipoEmailService service) {
        this.service = service;
    }

    @Operation(summary = "Listar tipos de emails", description = "Retorna lista paginada de tipos de emails com filtro por nome")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<TipoEmailResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,

            @Parameter(description = "Filtro por nome")
            @RequestParam(required = false) String nome
    ) {
        return service.getAll(pageable, nome);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de tipos de emails (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<TipoEmailResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Buscar por ID", description = "Retorna um tipo de email pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TipoEmailResponseDto> findById(
            @Parameter(description = "ID do tipo de email")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar tipo de email", description = "Cria um novo tipo de email")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criado com sucesso"),
            @ApiResponse(responseCode = "409", description = "Conflito (ex: nome já existente)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<TipoEmailResponseDto> create(
            @RequestBody @Valid TipoEmailCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar tipo de email", description = "Atualiza (substitui) um tipo de email")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ORGANIZER')")
    public ResponseEntity<TipoEmailResponseDto> update(
            @Parameter(description = "ID do tipo de email")
            @PathVariable UUID id,

            @RequestBody @Valid TipoEmailUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }
}
