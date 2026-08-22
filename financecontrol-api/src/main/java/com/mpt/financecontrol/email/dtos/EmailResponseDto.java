package com.mpt.financecontrol.email.dtos;

import com.mpt.financecontrol.email.TipoEmail;

import java.util.UUID;

public record EmailResponseDto(
        UUID                        id,
        String                      nome,
        tipoEmail                  tipoEmail
) {}
