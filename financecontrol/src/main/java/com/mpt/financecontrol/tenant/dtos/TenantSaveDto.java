package com.mpt.financecontrol.tenant.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TenantSaveDto(
        @Schema(description = "Nome do Tenant", example = "Eduardo Ohlweiler")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
        String nome
) {}
