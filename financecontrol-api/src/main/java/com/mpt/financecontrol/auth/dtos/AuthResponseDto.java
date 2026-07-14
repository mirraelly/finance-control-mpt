package com.mpt.financecontrol.auth.dtos;

import com.mpt.financecontrol.usuario.entity.Role;

import java.util.UUID;

public record AuthResponseDto(
        String token,
        UUID id,
        String nome,
        String email,
        Role role
) {}
