package com.mpt.financecontrol.tipoendereco.mapper;

import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoResponseDto;
import com.mpt.financecontrol.tipoendereco.entity.TipoEndereco;

public class TipoEnderecoMapper {

    private TipoEnderecoMapper() {}

    public static TipoEnderecoResponseDto toResponseDto(TipoEndereco tipo) {
        return new TipoEnderecoResponseDto(
                tipo.getId(),
                tipo.getNome(),
                tipo.getAtivo(),
                tipo.getCreatedAt(),
                tipo.getUpdatedAt()
        );
    }
}
