package com.mpt.financecontrol.pessoa.dtos;

import com.mpt.financecontrol.pessoa.TipoPessoa;
import com.mpt.financecontrol.telefone.dtos.TelefoneItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record PessoaUpdateDto(

        @Schema(description = "Nome da pessoa", example = "João da Silva")
        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @Schema(description = "Tipo da pessoa", example = "PESSOA_FISICA")
        @NotNull(message = "Tipo de pessoa é obrigatório")
        TipoPessoa tipoPessoa,

        LocalDate dataNascimento,
        String cpf,
        String rg,
        String cnh,
        String cnhCategoria,
        LocalDate cnhValidade,
        String cnpj,
        String inscricaoEstadual,
        String inscricaoMunicipal,
        String nomeFantasia,
        String razaoSocial,

        @Schema(description = "Definir se a pessoa está ativa", example = "true")
        @NotNull(message = "Ativo é obrigatório")
        Boolean ativo,

        @Schema(description = "Telefones da pessoa")
        List<@Valid TelefoneItemDto> telefones
) {}
