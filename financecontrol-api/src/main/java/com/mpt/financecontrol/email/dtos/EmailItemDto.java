package com.mpt.financecontrol.email.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record EmailItemDto(

        @Schema(description = "ID do email, nulo quando for um email novo")
        UUID id,

        @Schema(description = "ID do tipo de email", example = "comercial")
        @NotNull(message = "Tipo de email é obrigatório")
        UUID tipoEmailId,

        @Schema(description = "Endereço de e-mail", example = "joao@empresa.com")
        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 255, message = "E-mail deve ter no máximo 255 caracteres")
        String email,

        @Schema(description = "Observação sobre o email")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao,

        @Schema(description = "Define se é o email principal")
        Boolean principal
) {}
