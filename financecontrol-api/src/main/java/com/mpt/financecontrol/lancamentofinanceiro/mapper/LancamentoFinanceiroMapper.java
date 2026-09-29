package com.mpt.financecontrol.lancamentofinanceiro.mapper;

import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroResponseDto;
import com.mpt.financecontrol.lancamentofinanceiro.entity.LancamentoFinanceiro;

public class LancamentoFinanceiroMapper {

    private LancamentoFinanceiroMapper() {}

    public static LancamentoFinanceiroResponseDto toResponseDto(LancamentoFinanceiro lancamento) {
        return new LancamentoFinanceiroResponseDto(
                lancamento.getId(),
                lancamento.getContaFinanceira().getId(),
                lancamento.getContaFinanceira().getNome(),
                lancamento.getCategoria() != null ? lancamento.getCategoria().getId() : null,
                lancamento.getCategoria() != null ? lancamento.getCategoria().getNome() : null,
                lancamento.getTipo(),
                lancamento.getOrigem(),
                lancamento.getValor(),
                lancamento.getDescricao(),
                lancamento.getData(),
                lancamento.getCreatedAt()
        );
    }
}
