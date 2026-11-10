package com.mpt.financecontrol.assistente.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AssistenteAnexoDto(

        @Schema(description = "Nome do arquivo anexado", example = "comprovante.pdf")
        @Size(max = 255, message = "Nome do anexo deve ter no máximo 255 caracteres")
        String nome,

        @Schema(description = "Tipo do arquivo anexado", example = "application/pdf")
        @NotBlank(message = "Tipo do anexo é obrigatório")
        @Pattern(regexp = "image/jpeg|image/png|image/webp|application/pdf",
                message = "Anexo deve ser uma imagem JPG, PNG, WEBP ou um PDF")
        String tipo,

        @Schema(description = "Conteúdo do arquivo em Base64")
        @NotBlank(message = "Conteúdo do anexo é obrigatório")
        @Size(max = 7000000, message = "Anexo deve ter no máximo 5 MB")
        String conteudo
) {}
