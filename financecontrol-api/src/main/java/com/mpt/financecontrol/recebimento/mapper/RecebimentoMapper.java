package com.mpt.financecontrol.recebimento.mapper;

import com.mpt.financecontrol.recebimento.dtos.RecebimentoResponseDto;
import com.mpt.financecontrol.recebimento.entity.Recebimento;

import java.util.List;

public class RecebimentoMapper {

    private RecebimentoMapper() {}

    public static RecebimentoResponseDto toResponseDto(Recebimento recebimento) {
        return new RecebimentoResponseDto(
                recebimento.getId(),
                recebimento.getFormaPagamento().getId(),
                recebimento.getFormaPagamento().getNome(),
                recebimento.getContaFinanceira().getId(),
                recebimento.getContaFinanceira().getNome(),
                recebimento.getDataRecebimento(),
                recebimento.getValor(),
                recebimento.getJuros(),
                recebimento.getMulta(),
                recebimento.getDesconto(),
                recebimento.getObservacao(),
                recebimento.getCreatedAt()
        );
    }

    public static List<RecebimentoResponseDto> toResponseDtoList(List<Recebimento> recebimentos) {
        return recebimentos.stream().map(RecebimentoMapper::toResponseDto).toList();
    }
}
