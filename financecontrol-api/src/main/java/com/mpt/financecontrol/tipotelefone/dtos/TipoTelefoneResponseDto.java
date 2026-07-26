package com.mpt.financecontrol.tipotelefone.dtos;

import java.time.Instant;
import java.util.UUID;

public record TipoTelefoneResponseDto(
        UUID id,
        String nome,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
