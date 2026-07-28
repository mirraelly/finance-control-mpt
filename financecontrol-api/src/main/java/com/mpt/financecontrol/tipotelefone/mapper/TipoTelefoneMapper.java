package com.mpt.financecontrol.tipotelefone.mapper;

import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneResponseDto;
import com.mpt.financecontrol.tipotelefone.entity.TipoTelefone;

public class TipoTelefoneMapper {

    private TipoTelefoneMapper() {}

    public static TipoTelefoneResponseDto toResponseDto(TipoTelefone tipo) {
        return new TipoTelefoneResponseDto(
                tipo.getId(),
                tipo.getNome(),
                tipo.getAtivo(),
                tipo.getCreatedAt(),
                tipo.getUpdatedAt()
        );
    }
}
