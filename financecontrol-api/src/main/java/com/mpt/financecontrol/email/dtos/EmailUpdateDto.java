package com.mpt.financecontrol.email.entity.mapper;

import com.mpt.financecontrol.endereco.dtos.EnderecoItemDto;
import com.mpt.financecontrol.email.TipoEmail;
import com.mpt.financecontrol.telefone.dtos.TelefoneItemDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record EmailUpdateDto(

        @Schema(description = "Nome do email", example = "joao@")
        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @Schema(description = "Tipo da email", example = "EMAIL@.COM")
        @NotNull(message = "Tipo de email é obrigatório")
        TipoEmail tipoEmail,

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

        @Schema(description = "Definir se o email está ativo", example = "true")
        @NotNull(message = "Ativo é obrigatório")
        Boolean ativo,

        @Schema(description = "Telefones da pessoa")
        List<@Valid TelefoneItemDto> telefones,

        @Schema(description = "Endereços da pessoa")
        List<@Valid EnderecoItemDto> enderecos
) {}
