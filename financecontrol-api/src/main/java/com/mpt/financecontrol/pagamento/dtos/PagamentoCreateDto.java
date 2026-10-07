package com.mpt.financecontrol.pagamento.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PagamentoCreateDto(

        @Schema(description = "Data do pagamento", example = "2026-02-10")
        @NotNull(message = "Data de pagamento é obrigatória")
        @PastOrPresent(message = "Data de pagamento não pode ser futura")
        LocalDate dataPagamento,

        @Schema(description = "Valor pago", example = "500.00")
        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser maior que zero")
        @Digits(integer = 13, fraction = 2, message = "Valor deve ter no máximo 2 casas decimais")
        BigDecimal valor,

        @Schema(description = "Valor de juros", example = "0.00")
        @PositiveOrZero(message = "Juros não pode ser negativo")
        @Digits(integer = 13, fraction = 2, message = "Juros deve ter no máximo 2 casas decimais")
        BigDecimal juros,

        @Schema(description = "Valor de multa", example = "0.00")
        @PositiveOrZero(message = "Multa não pode ser negativa")
        @Digits(integer = 13, fraction = 2, message = "Multa deve ter no máximo 2 casas decimais")
        BigDecimal multa,

        @Schema(description = "Valor de desconto", example = "0.00")
        @PositiveOrZero(message = "Desconto não pode ser negativo")
        @Digits(integer = 13, fraction = 2, message = "Desconto deve ter no máximo 2 casas decimais")
        BigDecimal desconto,

        @Schema(description = "ID da forma de pagamento")
        @NotNull(message = "Forma de pagamento é obrigatória")
        UUID formaPagamentoId,

        @Schema(description = "ID da conta financeira (se não informado, usa a conta da forma de pagamento)")
        UUID contaFinanceiraId,

        @Schema(description = "Observações do pagamento")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao
) {}
