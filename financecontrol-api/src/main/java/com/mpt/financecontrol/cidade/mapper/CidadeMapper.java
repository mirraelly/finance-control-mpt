package com.mpt.financecontrol.cidade.mapper;

import com.mpt.financecontrol.cidade.dtos.CidadeResponseDto;
import com.mpt.financecontrol.cidade.entity.Cidade;

public class CidadeMapper {

    private CidadeMapper() {}

    public static CidadeResponseDto toResponseDto(Cidade cidade) {
        return new CidadeResponseDto(
                cidade.getId(),
                cidade.getNome(),
                cidade.getEstado().getId(),
                cidade.getEstado().getNome(),
                cidade.getEstado().getSigla(),
                cidade.getCodigoIbge(),
                cidade.getAtivo(),
                cidade.getCreatedAt(),
                cidade.getUpdatedAt()
        );
    }
}
