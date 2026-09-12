package com.mpt.financecontrol.email.dtos;

import java.util.UUID;

public record EmailResponseDto(
        UUID id,
        UUID tipoEmailId,
        String tipoEmailNome,
        String email,
        String observacao,
        Boolean principal
) {}
