package com.mpt.financecontrol.contapagarparcela.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarParcelaUpdateDto (

    @Schema(description = "Data de vencimento da parcela", example = "2026-02-15")
    LocalDate dataVencimento,

    @Schema(description = "Valor da parcela", example = "500.00")
    @Positive(message = "Valor deve ser maior que zero")
    BigDecimal valor,

    @Schema(description = "ID da forma de pagamento")
    UUID formaPagamentoId,

    @Schema(description = "Status da parcela", example = "PAGO")
    StatusConta status,

    @Schema(description = "Observação da parcela")
    @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
    String observacao
    ) {}
