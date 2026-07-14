package com.mpt.financecontrol.auth.service;

import com.mpt.financecontrol.auth.dtos.AuthLoginDto;
import com.mpt.financecontrol.auth.dtos.AuthResponseDto;
import com.mpt.financecontrol.config.JwtUtil;
import com.mpt.financecontrol.exceptions.UnauthorizedException;
import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioSaveDto;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UsuarioRepository usuarioRepository,
            UsuarioService usuarioService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(AuthLoginDto dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.email())
                .orElseThrow(() -> new UnauthorizedException("E-mail ou senha inválidos"));

        if (!usuario.getAtivo())
            throw new UnauthorizedException("Usuário inativo, contate o administrador");

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha()))
            throw new UnauthorizedException("E-mail ou senha inválidos");

        String token = jwtUtil.gerar(usuario.getId(), usuario.getRole());

        return new AuthResponseDto(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole()
        );
    }

    @Transactional
    public UsuarioResponseDto register(UsuarioSaveDto dto) {
        return usuarioService.create(dto);
    }
}
