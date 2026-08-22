package com.mpt.financecontrol.email.dtos;

import com.mpt.financecontrol.email.TipoEmail;
import com.mpt.financecontrol.telefone.dtos.EmailItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record EmailCreateDto(

        @Schema(description = "Nome da email", example = "Email@guest")
        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @Schema(description = "Tipo de email", example = "EMAIL")
        @NotNull(message = "Tipo de email é obrigatório")
        TipoEmail tipoEmail,



        @Schema(description = "Definir se o email está ativo", example = "true")
        Boolean ativo,

        @Schema(description = "Emails das pessoas")
        List<@Valid EmailItemDto> emails
) {}
