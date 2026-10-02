package com.mpt.financecontrol.pessoa.dtos;

import com.mpt.financecontrol.email.dtos.EmailItemDto;
import com.mpt.financecontrol.endereco.dtos.EnderecoItemDto;
import com.mpt.financecontrol.pessoa.TipoPessoa;
import com.mpt.financecontrol.telefone.dtos.TelefoneItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record PessoaCreateDto(

        @Schema(description = "Nome da pessoa", example = "João da Silva")
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
        String nome,

        @Schema(description = "Tipo da pessoa", example = "PESSOA_FISICA")
        @NotNull(message = "Tipo de pessoa é obrigatório")
        TipoPessoa tipoPessoa,

        LocalDate dataNascimento,
        String cpf,

        @Size(max = 20, message = "RG deve ter no máximo 20 caracteres")
        String rg,

        @Size(max = 11, message = "CNH deve ter no máximo 11 caracteres")
        String cnh,

        @Size(max = 5, message = "Categoria da CNH deve ter no máximo 5 caracteres")
        String cnhCategoria,

        LocalDate cnhValidade,
        String cnpj,

        @Size(max = 50, message = "Inscrição estadual deve ter no máximo 50 caracteres")
        String inscricaoEstadual,

        @Size(max = 50, message = "Inscrição municipal deve ter no máximo 50 caracteres")
        String inscricaoMunicipal,

        @Size(max = 255, message = "Nome fantasia deve ter no máximo 255 caracteres")
        String nomeFantasia,

        @Size(max = 255, message = "Razão social deve ter no máximo 255 caracteres")
        String razaoSocial,

        @Schema(description = "Definir se a pessoa está ativa", example = "true")
        Boolean ativo,

        @Schema(description = "Telefones da pessoa")
        List<@Valid TelefoneItemDto> telefones,

        @Schema(description = "Endereços da pessoa")
        List<@Valid EnderecoItemDto> enderecos,

        @Schema(description = "Emails da pessoa")
        List<@Valid EmailItemDto> emails
) {}
