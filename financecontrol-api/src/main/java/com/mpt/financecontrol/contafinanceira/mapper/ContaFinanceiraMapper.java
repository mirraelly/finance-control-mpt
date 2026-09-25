package com.mpt.financecontrol.contafinanceira.mapper;

import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraResponseDto;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;

public class ContaFinanceiraMapper {

    private ContaFinanceiraMapper() {}

    public static ContaFinanceiraResponseDto toResponseDto(ContaFinanceira conta) {
        return new ContaFinanceiraResponseDto(
                conta.getId(),
                conta.getNome(),
                conta.getAtivo(),
                conta.getCreatedAt(),
                conta.getUpdatedAt()
        );
    }
}
