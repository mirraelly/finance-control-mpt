package com.mpt.financecontrol.lancamentofinanceiro.dtos;

import com.mpt.financecontrol.financeiro.TipoLancamento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LancamentoFinanceiroUpdateDto(

        @Schema(description = "Tipo do lançamento", example = "ENTRADA")
        @NotNull(message = "Tipo é obrigatório")
        TipoLancamento tipo,

        @Schema(description = "ID da conta financeira")
        @NotNull(message = "Conta financeira é obrigatória")
        UUID contaFinanceiraId,

        @Schema(description = "ID da categoria")
        UUID categoriaId,

        @Schema(description = "Valor do lançamento", example = "150.00")
        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser maior que zero")
        @Digits(integer = 13, fraction = 2, message = "Valor deve ter no máximo 2 casas decimais")
        BigDecimal valor,

        @Schema(description = "Data do lançamento", example = "2026-02-10")
        @NotNull(message = "Data é obrigatória")
        @PastOrPresent(message = "Data não pode ser futura")
        LocalDate data,

        @Schema(description = "Descrição do lançamento", example = "Tarifa bancária")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
        String descricao
) {}
