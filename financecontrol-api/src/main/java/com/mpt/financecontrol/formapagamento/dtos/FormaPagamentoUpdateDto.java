package com.mpt.financecontrol.formapagamento.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record FormaPagamentoUpdateDto(

        @Schema(description = "Nome da forma de pagamento", example = "PIX")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
        String nome,

        @Schema(description = "ID da conta financeira vinculada")
        @NotNull(message = "Conta financeira é obrigatória")
        UUID contaFinanceiraId,

        @Schema(description = "Definir se a forma de pagamento está ativa", example = "true")
        @NotNull(message = "Ativo é obrigatório")
        Boolean ativo
) {}
