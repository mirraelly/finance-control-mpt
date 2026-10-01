package com.mpt.financecontrol.usuario.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioAlterarSenhaDto(
        @Schema(description = "Senha atual do usuário")
        @NotBlank(message = "Senha atual é obrigatória")
        String senhaAtual,

        @Schema(description = "Nova senha do usuário (texto puro, será criptografada)")
        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])\\S+$",
                message = "Senha deve conter letra maiúscula, minúscula, número e caractere especial, sem espaços"
        )
        String novaSenha
) {}
