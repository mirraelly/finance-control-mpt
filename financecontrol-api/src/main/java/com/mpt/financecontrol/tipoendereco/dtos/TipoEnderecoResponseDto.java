package com.mpt.financecontrol.tipoendereco.dtos;

import java.time.Instant;
import java.util.UUID;

public record TipoEnderecoResponseDto(
        UUID id,
        String nome,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
