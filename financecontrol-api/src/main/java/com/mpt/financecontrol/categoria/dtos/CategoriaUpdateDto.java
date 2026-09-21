package com.mpt.financecontrol.categoria.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaUpdateDto(

        @Schema(description = "Nome da categoria", example = "Alimentação")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @Schema(description = "Descrição da categoria", example = "Gastos com mercado e refeições")
        @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
        String descricao,

        @Schema(description = "Definir se a categoria está ativa", example = "true")
        Boolean ativo
) {}
