package com.mpt.financecontrol.estado.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EstadoCreateDto(

        @Schema(description = "Nome do estado", example = "São Paulo")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @Schema(description = "Sigla do estado", example = "SP")
        @NotBlank(message = "Sigla é obrigatória")
        @Size(min = 2, max = 2, message = "Sigla deve ter exatamente 2 caracteres")
        String sigla,

        @Schema(description = "Código IBGE do estado", example = "35")
        @NotNull(message = "Código IBGE é obrigatório")
        Integer codigoIbge,

        @Schema(description = "Definir se o estado está ativo", example = "true")
        Boolean ativo
) {}
