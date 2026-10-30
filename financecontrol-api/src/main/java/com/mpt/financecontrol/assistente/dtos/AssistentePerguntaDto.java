package com.mpt.financecontrol.assistente.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AssistentePerguntaDto(

        @Schema(description = "Mensagem enviada ao assistente", example = "Quais contas vencem esta semana?")
        @NotBlank(message = "Mensagem é obrigatória")
        @Size(max = 1000, message = "Mensagem deve ter no máximo 1000 caracteres")
        String mensagem,

        @Schema(description = "Mensagens anteriores da conversa")
        @Size(max = 20, message = "Histórico deve ter no máximo 20 mensagens")
        List<@Valid AssistenteMensagemDto> historico
) {}
