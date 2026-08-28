package com.mpt.financecontrol.cidade.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CidadeCreateDto(

        @Schema(description = "Nome da cidade", example = "São Paulo")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
        String nome,

        @Schema(description = "ID do estado")
        @NotNull(message = "Estado é obrigatório")
        UUID estadoId,

        @Schema(description = "Código IBGE da cidade", example = "3550308")
        Integer codigoIbge,

        @Schema(description = "Definir se a cidade está ativa", example = "true")
        Boolean ativo
) {}
