package com.mpt.financecontrol.usuario.dtos;

import com.mpt.financecontrol.usuario.entity.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record UsuarioResponseDto(
        UUID id,
        UUID tenantId,
        String nome,
        String email,
        String telefone,
        String codigoPais,
        Role role,
        Boolean ativo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
