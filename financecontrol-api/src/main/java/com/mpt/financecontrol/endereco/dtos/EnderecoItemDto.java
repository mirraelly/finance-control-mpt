package com.mpt.financecontrol.endereco.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record EnderecoItemDto(

        @Schema(description = "ID do endereço, nulo quando for um endereço novo")
        UUID id,

        @Schema(description = "ID do tipo de endereço")
        @NotNull(message = "Tipo de endereço é obrigatório")
        UUID tipoEnderecoId,

        @Schema(description = "CEP, somente números", example = "01001000")
        @Size(max = 8, message = "CEP deve ter no máximo 8 caracteres")
        String cep,

        @Schema(description = "Rua", example = "Praça da Sé")
        @Size(max = 255, message = "Rua deve ter no máximo 255 caracteres")
        String rua,

        @Schema(description = "Número", example = "100")
        @Size(max = 20, message = "Número deve ter no máximo 20 caracteres")
        String numero,

        @Schema(description = "Bairro", example = "Sé")
        @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
        String bairro,

        @Schema(description = "Complemento", example = "Apto 21")
        @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
        String complemento,

        @Schema(description = "ID da cidade, opcional. Quando nulo, é resolvido pelo CEP")
        UUID cidadeId,

        @Schema(description = "Define se é o endereço principal")
        Boolean principal
) {}
