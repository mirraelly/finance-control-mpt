package com.mpt.financecontrol.telefone.dtos;

import java.util.UUID;

public record TelefoneResponseDto(
        UUID id,
        UUID tipoTelefoneId,
        String tipoTelefoneNome,
        String numero,
        String observacao,
        Boolean principal
) {}
