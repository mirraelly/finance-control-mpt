package com.mpt.financecontrol.contapagar.dtos;

import com.mpt.financecontrol.financeiro.StatusConta;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContaPagarUpdateDto(

        @Schema(description = "ID da pessoa (fornecedor/credor)")
        UUID pessoaId,

        @Schema(description = "ID da categoria")
        UUID categoriaId,

        @Schema(description = "Descrição da conta", example = "Compra de material de escritório")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
        String descricao,

        @Schema(description = "Data de emissão da conta", example = "2026-01-10")
        LocalDate dataEmissao,

        @Schema(description = "Valor total da conta", example = "1500.00")
        @Positive(message = "Valor total deve ser maior que zero")
        BigDecimal valorTotal,

        @Schema(description = "Status da conta", example = "PAGO")
        StatusConta status,

        @Schema(description = "Observações da conta")
        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao,

        @Schema(description = "Definir se a conta está ativa", example = "true")
        Boolean ativo
) {}
