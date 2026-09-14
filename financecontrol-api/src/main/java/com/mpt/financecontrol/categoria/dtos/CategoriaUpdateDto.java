package com.mpt.financecontrol.categoria.dtos;

import com.mpt.financecontrol.email.dtos.EmailItemDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaUpdateDto;
import com.mpt.financecontrol.categoria.TipoCategoria;
import com.mpt.financecontrol.telefone.dtos.TelefoneItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CategoriaUpdateDto(

        @Schema(description = "Nome da categoria", example = "Categorias...")
        @NotBlank(message = "Categoria é obrigatório")
        String nome,

        @Schema(description = "Tipo da categoria", example = "CATEGORIA")
        @NotNull(message = "Tipo de categoria é obrigatório")
        TipoCategoria tipoCategoria

) {}
