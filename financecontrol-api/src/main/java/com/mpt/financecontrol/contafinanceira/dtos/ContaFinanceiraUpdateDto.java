package com.mpt.financecontrol.contafinanceira.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContaFinanceiraUpdateDto(

        @Schema(description = "Nome da conta financeira", example = "Banco do Brasil")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
        String nome,

        @Schema(description = "Definir se a conta financeira está ativa", example = "true")
        @NotNull(message = "Ativo é obrigatório")
        Boolean ativo
) {}
