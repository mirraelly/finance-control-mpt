package com.mpt.financecontrol.formapagamento.mapper;

import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoResponseDto;
import com.mpt.financecontrol.formapagamento.entity.FormaPagamento;

public class FormaPagamentoMapper {

    private FormaPagamentoMapper() {}

    public static FormaPagamentoResponseDto toResponseDto(FormaPagamento formaPagamento) {
        return new FormaPagamentoResponseDto(
                formaPagamento.getId(),
                formaPagamento.getNome(),
                formaPagamento.getContaFinanceira().getId(),
                formaPagamento.getContaFinanceira().getNome(),
                formaPagamento.getAtivo(),
                formaPagamento.getCreatedAt(),
                formaPagamento.getUpdatedAt()
        );
    }
}
