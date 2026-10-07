package com.mpt.financecontrol.pagamento.mapper;

import com.mpt.financecontrol.pagamento.dtos.PagamentoResponseDto;
import com.mpt.financecontrol.pagamento.entity.Pagamento;

import java.util.List;

public class PagamentoMapper {

    private PagamentoMapper() {}

    public static PagamentoResponseDto toResponseDto(Pagamento pagamento) {
        return new PagamentoResponseDto(
                pagamento.getId(),
                pagamento.getFormaPagamento().getId(),
                pagamento.getFormaPagamento().getNome(),
                pagamento.getContaFinanceira().getId(),
                pagamento.getContaFinanceira().getNome(),
                pagamento.getLancamentoFinanceiro().getId(),
                pagamento.getDataPagamento(),
                pagamento.getValor(),
                pagamento.getJuros(),
                pagamento.getMulta(),
                pagamento.getDesconto(),
                pagamento.getObservacao(),
                pagamento.getCreatedAt()
        );
    }

    public static List<PagamentoResponseDto> toResponseDtoList(List<Pagamento> pagamentos) {
        return pagamentos.stream().map(PagamentoMapper::toResponseDto).toList();
    }
}
