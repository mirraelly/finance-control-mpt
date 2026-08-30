package com.mpt.financecontrol.pessoa.dtos;

import com.mpt.financecontrol.endereco.dtos.EnderecoResponseDto;
import com.mpt.financecontrol.pessoa.TipoPessoa;
import com.mpt.financecontrol.telefone.dtos.TelefoneResponseDto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PessoaResponseDto(
        UUID                        id,
        String                      nome,
        TipoPessoa                  tipoPessoa,
        LocalDate                   dataNascimento,
        String                      cpf,
        String                      rg,
        String                      cnh,
        String                      cnhCategoria,
        LocalDate                   cnhValidade,
        String                      cnpj,
        String                      inscricaoEstadual,
        String                      inscricaoMunicipal,
        String                      nomeFantasia,
        String                      razaoSocial,
        Boolean                     ativo,
        List<TelefoneResponseDto>   telefones,
        List<EnderecoResponseDto>   enderecos,
        Instant                     createdAt,
        Instant                     updatedAt
) {}
