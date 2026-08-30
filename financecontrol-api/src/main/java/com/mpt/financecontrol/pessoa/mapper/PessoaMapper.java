package com.mpt.financecontrol.pessoa.mapper;

import com.mpt.financecontrol.endereco.mapper.EnderecoMapper;
import com.mpt.financecontrol.pessoa.dtos.PessoaResponseDto;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.telefone.mapper.TelefoneMapper;

public class PessoaMapper {

    private PessoaMapper() {}

    public static PessoaResponseDto toResponseDto(Pessoa pessoa) {
        return new PessoaResponseDto(
                pessoa.getId(),
                pessoa.getNome(),
                pessoa.getTipoPessoa(),
                pessoa.getDataNascimento(),
                pessoa.getCpf(),
                pessoa.getRg(),
                pessoa.getCnh(),
                pessoa.getCnhCategoria(),
                pessoa.getCnhValidade(),
                pessoa.getCnpj(),
                pessoa.getInscricaoEstadual(),
                pessoa.getInscricaoMunicipal(),
                pessoa.getNomeFantasia(),
                pessoa.getRazaoSocial(),
                pessoa.getAtivo(),
                TelefoneMapper.toResponseDtoList(pessoa.getTelefones()),
                EnderecoMapper.toResponseDtoList(pessoa.getEnderecos()),
                pessoa.getCreatedAt(),
                pessoa.getUpdatedAt()
        );
    }
}
