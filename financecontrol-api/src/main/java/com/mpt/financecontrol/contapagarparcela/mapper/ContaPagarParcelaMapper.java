package com.mpt.financecontrol.contapagarparcela.mapper;

import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaResponseDto;
import com.mpt.financecontrol.contapagarparcela.entity.ContaPagarParcela;

public class ContaPagarParcelaMapper {

    private ContaPagarParcelaMapper() {}

    public static ContaPagarParcelaResponseDto toResponseDto(ContaPagarParcela parcela) {
        return new ContaPagarParcelaResponseDto(
                parcela.getId(),
                parcela.getContaPagar().getId(),
                parcela.getNumeroParcela(),
                parcela.getDataVencimento(),
                parcela.getValor(),
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getId() : null,
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getNome() : null,
                parcela.getStatus(),
                parcela.getObservacao(),
                parcela.getCreatedAt(),
                parcela.getUpdatedAt()
        );
    }

}
