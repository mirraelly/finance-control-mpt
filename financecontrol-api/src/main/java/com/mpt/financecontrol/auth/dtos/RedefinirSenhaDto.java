package com.mpt.financecontrol.auth.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaDto(
        @Schema(description = "Token recebido no link de recuperação")
        @NotBlank(message = "Token é obrigatório")
        String token,

        @Schema(description = "Nova senha do usuário (texto puro, será criptografada)")
        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])\\S+$",
                message = "Senha deve conter letra maiúscula, minúscula, número e caractere especial, sem espaços"
        )
        String novaSenha
) {}
