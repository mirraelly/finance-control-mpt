package com.mpt.financecontrol.cidade.dtos;

import java.time.Instant;
import java.util.UUID;

public record CidadeResponseDto(
        UUID    id,
        String  nome,
        UUID    estadoId,
        String  estadoNome,
        String  estadoSigla,
        Integer codigoIbge,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
