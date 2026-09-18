package com.mpt.financecontrol.categoria.dtos;

import java.time.Instant;
import java.util.UUID;

public record CategoriaResponseDto(
        UUID    id,
        String  nome,
        String  descricao,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
