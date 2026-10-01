package com.mpt.financecontrol.loginlog.dtos;

import com.mpt.financecontrol.loginlog.entity.MotivoFalhaLogin;

import java.time.Instant;
import java.util.UUID;

public record LoginLogResponseDto(
        UUID             id,
        UUID             usuarioId,
        String           usuarioNome,
        String           email,
        Boolean          sucesso,
        MotivoFalhaLogin motivoFalha,
        String           enderecoIp,
        String           userAgent,
        Instant          dataLogin
) {}
