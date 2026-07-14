package com.mpt.financecontrol.auth.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthLoginDto(
        @Schema(description = "E-mail do usuário", example = "eduardo@example.com")
        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @Schema(description = "Senha do usuário")
        @NotBlank(message = "Senha é obrigatória")
        String senha
) {}
