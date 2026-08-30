package com.mpt.financecontrol.email.mapper;

import com.mpt.financecontrol.endereco.mapper.EnderecoMapper;
import com.mpt.financecontrol.email.dtos.EmailResponseDto;
import com.mpt.financecontrol.email.entity.Email;
import com.mpt.financecontrol.telefone.mapper.TelefoneMapper;

public class EmailMapper {

    private EmailMapper() {}

    public static PessoaResponseDto toResponseDto(Email email) {
        return new EmailResponseDto(
                email.getId(),
                email.getNome(),
                email.getTipoEmail(),
                email.getAtivo(),
                TelefoneMapper.toResponseDtoList(email.getTelefones()),
                EnderecoMapper.toResponseDtoList(email.getEnderecos()),
                email.getCreatedAt(),
                email.getUpdatedAt()
        );
    }
}
