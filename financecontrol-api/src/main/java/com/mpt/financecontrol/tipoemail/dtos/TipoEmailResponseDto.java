package com.mpt.financecontrol.tipoemail.dtos;

import java.time.Instant;
import java.util.UUID;

public record TipoEmailResponseDto(
        UUID id,
        String nome,
        Boolean ativo,
        Instant createdAt,
        Instant updatedAt
) {}
