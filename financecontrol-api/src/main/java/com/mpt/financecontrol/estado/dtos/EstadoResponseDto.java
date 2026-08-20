package com.mpt.financecontrol.estado.dtos;

import java.time.Instant;
import java.util.UUID;

public record EstadoResponseDto(
        UUID id,
        String nome,
        String sigla,
        Integer codigoIbge,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
