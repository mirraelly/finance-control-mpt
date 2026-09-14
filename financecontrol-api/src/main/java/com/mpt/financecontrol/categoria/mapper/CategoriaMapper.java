package com.mpt.financecontrol.categoria.mapper;

import com.mpt.financecontrol.categoria.dtos.CategoriaResponseDto;
import com.mpt.financecontrol.categoria.entity.Categoria;

public class CategoriaMapper {

    private CategoriaMapper() {
    }

    public static CategoriaResponseDto toResponseDto(Categoria categoria) {
        return new CategoriaResponseDto(
                categoria.getId(),
                categoria.getNome(),
                categoria.getDescricao(),
                categoria.getAtivo(),
                categoria.getCreatedAt(),
                categoria.getUpdatedAt()
        );
    }
}