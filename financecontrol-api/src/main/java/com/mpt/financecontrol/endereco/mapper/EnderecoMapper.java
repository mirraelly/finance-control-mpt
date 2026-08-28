package com.mpt.financecontrol.endereco.mapper;

import com.mpt.financecontrol.cidade.entity.Cidade;
import com.mpt.financecontrol.endereco.dtos.EnderecoResponseDto;
import com.mpt.financecontrol.endereco.entity.Endereco;

import java.util.List;

public class EnderecoMapper {

    private EnderecoMapper() {}

    public static EnderecoResponseDto toResponseDto(Endereco endereco) {
        Cidade cidade = endereco.getCidade();

        return new EnderecoResponseDto(
                endereco.getId(),
                endereco.getTipoEndereco().getId(),
                endereco.getTipoEndereco().getNome(),
                endereco.getCep(),
                endereco.getRua(),
                endereco.getNumero(),
                endereco.getBairro(),
                endereco.getComplemento(),
                cidade == null ? null : cidade.getId(),
                cidade == null ? null : cidade.getNome(),
                cidade == null ? null : cidade.getEstado().getSigla(),
                endereco.getPrincipal()
        );
    }

    public static List<EnderecoResponseDto> toResponseDtoList(List<Endereco> enderecos) {
        return enderecos.stream().map(EnderecoMapper::toResponseDto).toList();
    }
}
