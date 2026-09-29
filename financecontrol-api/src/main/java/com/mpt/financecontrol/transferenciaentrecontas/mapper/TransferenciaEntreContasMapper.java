package com.mpt.financecontrol.transferenciaentrecontas.mapper;

import com.mpt.financecontrol.transferenciaentrecontas.dtos.TransferenciaEntreContasResponseDto;
import com.mpt.financecontrol.transferenciaentrecontas.entity.TransferenciaEntreContas;

public class TransferenciaEntreContasMapper {

    private TransferenciaEntreContasMapper() {}

    public static TransferenciaEntreContasResponseDto toResponseDto(TransferenciaEntreContas transferencia) {
        return new TransferenciaEntreContasResponseDto(
                transferencia.getId(),
                transferencia.getContaOrigem().getId(),
                transferencia.getContaOrigem().getNome(),
                transferencia.getContaDestino().getId(),
                transferencia.getContaDestino().getNome(),
                transferencia.getValor(),
                transferencia.getData(),
                transferencia.getDescricao(),
                transferencia.getLancamentoSaida().getId(),
                transferencia.getLancamentoEntrada().getId(),
                transferencia.getCreatedAt()
        );
    }
}
