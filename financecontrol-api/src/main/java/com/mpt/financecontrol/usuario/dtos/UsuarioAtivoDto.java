package com.mpt.financecontrol.usuario.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UsuarioAtivoDto(
        @Schema(description = "Ativo/inativo", example = "false")
        @NotNull(message = "Informe se o usuário está ativo")
        Boolean ativo
) {}
