package com.mpt.financecontrol.contareceber.mapper;

import com.mpt.financecontrol.contareceber.dtos.ContaReceberResponseDto;
import com.mpt.financecontrol.contareceber.entity.ContaReceber;

public class ContaReceberMapper {

    private ContaReceberMapper() {}

    public static ContaReceberResponseDto toResponseDto(ContaReceber contaReceber) {
        return new ContaReceberResponseDto(
                contaReceber.getId(),
                contaReceber.getPessoa().getId(),
                contaReceber.getPessoa().getNome(),
                contaReceber.getCategoria() != null ? contaReceber.getCategoria().getId() : null,
                contaReceber.getCategoria() != null ? contaReceber.getCategoria().getNome() : null,
                contaReceber.getDescricao(),
                contaReceber.getDataEmissao(),
                contaReceber.getValorTotal(),
                contaReceber.getStatus(),
                contaReceber.getObservacao(),
                contaReceber.getAtivo(),
                contaReceber.getCreatedAt(),
                contaReceber.getUpdatedAt()
        );
    }
}
