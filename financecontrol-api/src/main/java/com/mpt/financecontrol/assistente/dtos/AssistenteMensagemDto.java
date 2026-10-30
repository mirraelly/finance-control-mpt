package com.mpt.financecontrol.assistente.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AssistenteMensagemDto(

        @Schema(description = "Autor da mensagem", example = "usuario")
        @NotBlank(message = "Papel é obrigatório")
        @Pattern(regexp = "usuario|assistente", message = "Papel deve ser usuario ou assistente")
        String papel,

        @Schema(description = "Texto da mensagem", example = "Quais contas vencem hoje?")
        @NotBlank(message = "Texto é obrigatório")
        @Size(max = 4000, message = "Texto deve ter no máximo 4000 caracteres")
        String texto
) {}
