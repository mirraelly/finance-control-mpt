package com.mpt.financecontrol.contapagar.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarCreateDto(

        @Schema(description = "ID da pessoa (fornecedor/credor)")
        @NotNull(message = "Pessoa é obrigatória")
        UUID pessoaId,

        @Schema(description = "ID da categoria")
        UUID categoriaId,

        @Schema(description = "Descrição da conta", example = "Compra de material de escritório")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
        String descricao,

        @Schema(description = "Data de emissão da conta", example = "2026-01-10")
        @NotNull(message = "Data de emissão é obrigatória")
        LocalDate dataEmissao,

        @Schema(description = "Valor total da conta", example = "1500.00")
        @NotNull(message = "Valor total é obrigatório")
        @Positive(message = "Valor total deve ser maior que zero")
        BigDecimal valorTotal,

        @Schema(description = "Status da conta", example = "ABERTO")
        StatusConta status,

        @Schema(description = "Observações da conta")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao,

        @Schema(description = "Definir se a conta está ativa", example = "true")
        Boolean ativo
) {}
