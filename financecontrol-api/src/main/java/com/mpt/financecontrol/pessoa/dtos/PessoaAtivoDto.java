package com.mpt.financecontrol.pessoa.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record PessoaAtivoDto(
        @Schema(description = "Ativo/inativo", example = "false")
        @NotNull(message = "Informe se a pessoa está ativa")
        Boolean ativo
) {}