package com.mpt.financecontrol.telefone.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TelefoneItemDto(

        @Schema(description = "ID do telefone, nulo quando for um telefone novo")
        UUID id,

        @Schema(description = "ID do tipo de telefone", example = "whatsapp")
        @NotNull(message = "Tipo de telefone é obrigatório")
        UUID tipoTelefoneId,

        @Schema(description = "Número do telefone", example = "11999998888")
        @NotBlank(message = "Número é obrigatório")
        @Size(max = 20, message = "Número deve ter no máximo 20 caracteres")
        String numero,

        @Schema(description = "Observação sobre o telefone")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao,

        @Schema(description = "Define se é o telefone principal")
        Boolean principal
) {}
