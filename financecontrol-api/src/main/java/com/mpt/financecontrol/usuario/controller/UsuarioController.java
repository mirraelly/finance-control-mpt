package com.mpt.financecontrol.usuario.controller;

import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioUpdateDto;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/usuario")
@Tag(name = "Usuário", description = "Operações relacionadas aos usuários do sistema")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Busca usuário por id")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN')")
    public ResponseEntity<UsuarioResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.findByIdResponse(id));
    }

    @Operation(
            summary = "Lista todos os usuarios",
            description = "Exemplo: /usuarios?page=0&size=10"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN')")
    public Page<UsuarioResponseDto> getAll(
            @PageableDefault(size = 15, sort = "nome") Pageable pageable,
            @RequestParam(required = false) UUID   tenantId,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String email
    ) {
        return usuarioService.getAll(pageable, tenantId, nome, email);
    }

    @Operation(
            summary = "Lista todos os usuarios sem paginação",
            description = "Exemplo: /usuarios/select"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    @GetMapping("/select")
    @PreAuthorize("hasAnyRole('SUPERADMIN')")
    public List<UsuarioResponseDto> select(
            @RequestParam(required = false) String nome
    ) {
        return usuarioService.select(nome);
    }

    @Operation(summary = "Atualiza um usuário")
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponseDto> update(
            @PathVariable       UUID id,
            @Valid @RequestBody UsuarioUpdateDto dto
    ) {
        return ResponseEntity.ok(usuarioService.update(id, dto));
    }
}
