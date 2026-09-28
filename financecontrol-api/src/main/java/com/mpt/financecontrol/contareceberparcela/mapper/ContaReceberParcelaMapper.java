package com.mpt.financecontrol.contareceberparcela.mapper;

import com.mpt.financecontrol.contareceberparcela.dtos.ContaReceberParcelaResponseDto;
import com.mpt.financecontrol.contareceberparcela.entity.ContaReceberParcela;
import com.mpt.financecontrol.recebimento.mapper.RecebimentoMapper;

import java.util.List;

public class ContaReceberParcelaMapper {

    private ContaReceberParcelaMapper() {}

    public static ContaReceberParcelaResponseDto toResponseDto(ContaReceberParcela parcela) {
        return new ContaReceberParcelaResponseDto(
                parcela.getId(),
                parcela.getNumeroParcela(),
                parcela.getDataVencimento(),
                parcela.getValor(),
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getId() : null,
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getNome() : null,
                parcela.getStatus(),
                parcela.getObservacao(),
                RecebimentoMapper.toResponseDtoList(parcela.getRecebimentos())
        );
    }

    public static List<ContaReceberParcelaResponseDto> toResponseDtoList(List<ContaReceberParcela> parcelas) {
        return parcelas.stream().map(ContaReceberParcelaMapper::toResponseDto).toList();
    }
}
