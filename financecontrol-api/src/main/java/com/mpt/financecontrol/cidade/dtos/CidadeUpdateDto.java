package com.mpt.financecontrol.cidade.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CidadeUpdateDto(

        @Schema(description = "Nome da cidade", example = "São Paulo")
        @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
        String nome,

        @Schema(description = "ID do estado")
        UUID estadoId,

        @Schema(description = "Código IBGE da cidade", example = "3550308")
        Integer codigoIbge,

        @Schema(description = "Definir se a cidade está ativa", example = "true")
        Boolean ativo
) {}
