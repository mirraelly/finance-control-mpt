package com.mpt.financecontrol.tenant.dtos;

import java.util.UUID;

public record TenantResponseDto(
        UUID    id,
        String  nome
) {}
