package com.mpt.financecontrol.loginlog.controller;

import com.mpt.financecontrol.loginlog.dtos.LoginLogResponseDto;
import com.mpt.financecontrol.loginlog.service.LoginLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/login-logs")
@Tag(name = "Log de login", description = "Consulta das tentativas de login no sistema")
public class LoginLogController {

    private final LoginLogService service;

    public LoginLogController(LoginLogService service) {
        this.service = service;
    }

    @Operation(summary = "Listar logs de login", description = "Retorna as tentativas de login paginadas, das mais recentes para as mais antigas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public Page<LoginLogResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable,

            @Parameter(description = "Filtro por resultado do login")
            @RequestParam(required = false) Boolean sucesso,

            @Parameter(description = "Filtro por e-mail informado no login")
            @RequestParam(required = false) String email,

            @Parameter(description = "Data inicial")
            @RequestParam(required = false) LocalDate dataInicio,

            @Parameter(description = "Data final")
            @RequestParam(required = false) LocalDate dataFim
    ) {
        return service.getAll(pageable, sucesso, email, dataInicio, dataFim);
    }
}
