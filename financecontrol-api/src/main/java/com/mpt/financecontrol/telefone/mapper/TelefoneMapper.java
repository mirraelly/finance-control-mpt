package com.mpt.financecontrol.telefone.mapper;

import com.mpt.financecontrol.telefone.dtos.TelefoneResponseDto;
import com.mpt.financecontrol.telefone.entity.Telefone;

import java.util.List;

public class TelefoneMapper {

    private TelefoneMapper() {}

    public static TelefoneResponseDto toResponseDto(Telefone telefone) {
        return new TelefoneResponseDto(
                telefone.getId(),
                telefone.getTipoTelefone().getId(),
                telefone.getTipoTelefone().getNome(),
                telefone.getNumero(),
                telefone.getObservacao(),
                telefone.getPrincipal()
        );
    }

    public static List<TelefoneResponseDto> toResponseDtoList(List<Telefone> telefones) {
        return telefones.stream().map(TelefoneMapper::toResponseDto).toList();
    }
}
