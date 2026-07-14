package com.mpt.financecontrol.usuario.dtos;

import com.mpt.financecontrol.usuario.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateDto(
        @Schema(description = "Nome do usuário", example = "Eduardo Ohlweiler")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
        String nome,

        @Schema(description = "Telefone do usuário", example = "51999999999")
        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String telefone,

        @Schema(description = "Código do país (DDI)", example = "55")
        @Size(max = 4, message = "Código do país deve ter no máximo 4 caracteres")
        String codigoPais,

        @Schema(description = "Ativo/inativo")
        Boolean ativo,

        @Schema(description = "Papel do usuário no tenant (ignorado/forçado para USER se quem edita for USER)")
        Role role
) {}
