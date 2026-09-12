package com.mpt.financecontrol.usuario.dtos;

import com.mpt.financecontrol.usuario.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioCreateDto(
        @Schema(description = "Nome do usuário", example = "Eduardo Ohlweiler")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
        String nome,

        @Schema(description = "E-mail do usuário", example = "eduardo@example.com")
        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 255, message = "E-mail deve ter no máximo 255 caracteres")
        String email,

        @Schema(description = "Senha do usuário (texto puro, será criptografada)")
        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])\\S+$",
                message = "Senha deve conter letra maiúscula, minúscula, número e caractere especial, sem espaços"
        )
        String senha,

        @Schema(description = "Telefone do usuário", example = "51999999999")
        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String telefone,

        @Schema(description = "Código do país (DDI)", example = "55")
        @Size(max = 4, message = "Código do país deve ter no máximo 4 caracteres")
        String codigoPais,

        @Schema(description = "Papel do usuário no tenant (ignorado/forçado para USER se quem cria for USER)")
        Role role
) {}
