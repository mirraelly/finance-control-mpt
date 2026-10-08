package com.mpt.financecontrol.contapagarparcela.mapper;

import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaBaixaDto;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaResponseDto;
import com.mpt.financecontrol.contapagarparcela.entity.ContaPagarParcela;
import com.mpt.financecontrol.pagamento.mapper.PagamentoMapper;

import java.math.BigDecimal;
import java.util.List;

public class ContaPagarParcelaMapper {

    private ContaPagarParcelaMapper() {}

    public static ContaPagarParcelaResponseDto toResponseDto(ContaPagarParcela parcela) {
        return new ContaPagarParcelaResponseDto(
                parcela.getId(),
                parcela.getNumeroParcela(),
                parcela.getDataVencimento(),
                parcela.getValor(),
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getId() : null,
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getNome() : null,
                parcela.getStatus(),
                parcela.getObservacao(),
                PagamentoMapper.toResponseDtoList(parcela.getPagamentos())
        );
    }

    public static List<ContaPagarParcelaResponseDto> toResponseDtoList(List<ContaPagarParcela> parcelas) {
        return parcelas.stream().map(ContaPagarParcelaMapper::toResponseDto).toList();
    }

    public static ContaPagarParcelaBaixaDto toBaixaDto(ContaPagarParcela parcela) {
        BigDecimal saldo = parcela.getValor().subtract(parcela.getPagamentos().stream()
                .map(p -> p.getValor().add(p.getDesconto()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return new ContaPagarParcelaBaixaDto(
                parcela.getId(),
                parcela.getContaPagar().getId(),
                parcela.getContaPagar().getDescricao(),
                parcela.getContaPagar().getPessoa().getId(),
                parcela.getContaPagar().getPessoa().getNome(),
                parcela.getNumeroParcela(),
                parcela.getContaPagar().getParcelas().size(),
                parcela.getDataVencimento(),
                parcela.getValor(),
                saldo,
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getId() : null,
                parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getNome() : null,
                parcela.getStatus()
        );
    }
}
