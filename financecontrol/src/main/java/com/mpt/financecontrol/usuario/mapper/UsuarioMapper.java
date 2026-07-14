package com.mpt.financecontrol.usuario.mapper;

import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.entity.Usuario;

public class UsuarioMapper {
    private UsuarioMapper() {}

    public static UsuarioResponseDto toResponseDto(Usuario usuario) {
        return new UsuarioResponseDto(
                usuario.getId(),
                usuario.getTenant().getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getCodigoPais(),
                usuario.getRole(),
                usuario.getAtivo(),
                usuario.getCreatedAt(),
                usuario.getUpdatedAt()
        );
    }
}
