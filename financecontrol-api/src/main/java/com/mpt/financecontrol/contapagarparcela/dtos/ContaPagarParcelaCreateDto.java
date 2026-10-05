package com.mpt.financecontrol.contapagarparcela.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarParcelaCreateDto (

        @Schema (description = "ID da conta a pagar que essa parcela pertence")
        @NotNull (message = "Conta a pagar é obrigatória")
        UUID contaPagarId,

        @Schema(description = "Número da parcela", example = "1")
        @NotNull(message = "Número da parcela é obrigatória")
        Integer numeroParcela,

        @Schema(description = "Data de vencimento da parcela", example = "2026-02-10")
        @NotNull(message = "Data de vencimento é obrigatória")
        LocalDate dataVencimento,

        @Schema(description = "Valor da parcela", example = "500.00")
        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser maior que zero")
        BigDecimal valor,

        @Schema(description = "ID da forma de pagamento")
        UUID formaPagamentoId,

        @Schema(description = "Status da parcela", example = "ABERTO")
        StatusConta status,

        @Schema(description = "Observações da parcela")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao
    ){}

