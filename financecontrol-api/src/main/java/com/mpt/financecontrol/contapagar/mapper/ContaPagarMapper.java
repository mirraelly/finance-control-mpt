package com.mpt.financecontrol.contapagar.mapper;

import com.mpt.financecontrol.contapagar.dtos.ContaPagarResponseDto;
import com.mpt.financecontrol.contapagar.entity.ContaPagar;

public class ContaPagarMapper {

    private ContaPagarMapper() {}

    public static ContaPagarResponseDto toResponseDto(ContaPagar contaPagar) {
        return new ContaPagarResponseDto(
                contaPagar.getId(),
                contaPagar.getPessoa().getId(),
                contaPagar.getPessoa().getNome(),
                contaPagar.getCategoria() != null ? contaPagar.getCategoria().getId() : null,
                contaPagar.getCategoria() != null ? contaPagar.getCategoria().getNome() : null,
                contaPagar.getDescricao(),
                contaPagar.getDataEmissao(),
                contaPagar.getValorTotal(),
                contaPagar.getStatus(),
                contaPagar.getObservacao(),
                contaPagar.getAtivo(),
                contaPagar.getCreatedAt(),
                contaPagar.getUpdatedAt()
        );
    }
}
