package com.mpt.financecontrol.auth.service;

import com.mpt.financecontrol.auth.dtos.AuthLoginDto;
import com.mpt.financecontrol.auth.dtos.AuthResponseDto;
import com.mpt.financecontrol.config.JwtUtil;
import com.mpt.financecontrol.exceptions.UnauthorizedException;
import com.mpt.financecontrol.loginlog.entity.MotivoFalhaLogin;
import com.mpt.financecontrol.loginlog.service.LoginLogService;
import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioCreateDto;
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
    private final LoginLogService loginLogService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            UsuarioService usuarioService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            LoginLogService loginLogService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginLogService = loginLogService;
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(AuthLoginDto dto, String enderecoIp, String userAgent) {
        Usuario usuario = usuarioRepository.findByEmail(dto.email()).orElse(null);

        if (usuario == null) {
            loginLogService.registrar(null, dto.email(), false, MotivoFalhaLogin.USUARIO_INEXISTENTE, enderecoIp, userAgent);
            throw new UnauthorizedException("E-mail ou senha inválidos");
        }

        if (!usuario.getAtivo()) {
            loginLogService.registrar(usuario, dto.email(), false, MotivoFalhaLogin.USUARIO_INATIVO, enderecoIp, userAgent);
            throw new UnauthorizedException("Usuário inativo, contate o administrador");
        }

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            loginLogService.registrar(usuario, dto.email(), false, MotivoFalhaLogin.SENHA_INVALIDA, enderecoIp, userAgent);
            throw new UnauthorizedException("E-mail ou senha inválidos");
        }

        loginLogService.registrar(usuario, dto.email(), true, null, enderecoIp, userAgent);

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
    public UsuarioResponseDto register(UsuarioCreateDto dto) {
        return usuarioService.create(dto);
    }
}
