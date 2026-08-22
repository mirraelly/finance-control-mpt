package com.mpt.financecontrol.email.dtos;

import com.mpt.financecontrol.email.TipoEmail;
import com.mpt.financecontrol.email.dtos.EmailItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record EmailUpdateDto(

        @Schema(description = "Nome do email", example = "Email@guest)
        @NotBlank(message = "Nome do email é obrigatório")
        String nome


) {}
