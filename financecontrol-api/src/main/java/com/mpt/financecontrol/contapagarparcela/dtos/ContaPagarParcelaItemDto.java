package com.mpt.financecontrol.contapagarparcela.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarParcelaItemDto(

        @Schema(description = "Data de vencimento da parcela", example = "2026-02-10")
        @NotNull(message = "Data de vencimento é obrigatória")
        LocalDate dataVencimento,

        @Schema(description = "Valor da parcela", example = "500.00")
        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser maior que zero")
        @Digits(integer = 13, fraction = 2, message = "Valor deve ter no máximo 2 casas decimais")
        BigDecimal valor,

        @Schema(description = "ID da forma de pagamento")
        UUID formaPagamentoId,

        @Schema(description = "Observações da parcela")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao
) {}
