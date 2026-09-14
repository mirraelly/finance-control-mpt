package com.mpt.financecontrol.categoria.dtos;

import com.mpt.financecontrol.email.dtos.EmailItemDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaUpdateDtoDto;
import com.mpt.financecontrol.categoria.TipoCategoria;
import com.mpt.financecontrol.telefone.dtos.TelefoneItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CategoriaCreateDto(

        @Schema(description = "Nome da categoria", example = "Categorias...")
        @NotBlank(message = "Selecionar a categoria é obrigatório");
) {}
