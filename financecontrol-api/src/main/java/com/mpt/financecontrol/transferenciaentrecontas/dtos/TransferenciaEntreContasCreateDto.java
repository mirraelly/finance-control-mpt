package com.mpt.financecontrol.transferenciaentrecontas.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransferenciaEntreContasCreateDto(

        @Schema(description = "ID da conta financeira de origem")
        @NotNull(message = "Conta de origem é obrigatória")
        UUID contaOrigemId,

        @Schema(description = "ID da conta financeira de destino")
        @NotNull(message = "Conta de destino é obrigatória")
        UUID contaDestinoId,

        @Schema(description = "Valor transferido", example = "300.00")
        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser maior que zero")
        @Digits(integer = 13, fraction = 2, message = "Valor deve ter no máximo 2 casas decimais")
        BigDecimal valor,

        @Schema(description = "Data da transferência", example = "2026-02-10")
        @NotNull(message = "Data é obrigatória")
        @PastOrPresent(message = "Data não pode ser futura")
        LocalDate data,

        @Schema(description = "Descrição da transferência", example = "Depósito do caixa no banco")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
        String descricao
) {}
