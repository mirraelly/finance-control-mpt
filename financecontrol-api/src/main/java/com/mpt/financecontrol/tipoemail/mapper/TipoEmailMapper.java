package com.mpt.financecontrol.tipoemail.mapper;

import com.mpt.financecontrol.tipoemail.dtos.TipoEmailResponseDto;
import com.mpt.financecontrol.tipoemail.entity.TipoEmail;

public class TipoEmailMapper {

    private TipoEmailMapper() {}

    public static TipoEmailResponseDto toResponseDto(TipoEmail tipo) {
        return new TipoEmailResponseDto(
                tipo.getId(),
                tipo.getNome(),
                tipo.getAtivo(),
                tipo.getCreatedAt(),
                tipo.getUpdatedAt()
        );
    }
}
