package com.mpt.financecontrol.estado.mapper;

import com.mpt.financecontrol.estado.dtos.EstadoResponseDto;
import com.mpt.financecontrol.estado.entity.Estado;

public class EstadoMapper {

    private EstadoMapper() {}

    public static EstadoResponseDto toResponseDto(Estado estado) {
        return new EstadoResponseDto(
                estado.getId(),
                estado.getNome(),
                estado.getSigla(),
                estado.getCodigoIbge(),
                estado.getAtivo(),
                estado.getCreatedAt(),
                estado.getUpdatedAt()
        );
    }
}
