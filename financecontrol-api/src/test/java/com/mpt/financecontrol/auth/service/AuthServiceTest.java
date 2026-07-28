package com.mpt.financecontrol.auth.service;

import com.mpt.financecontrol.auth.dtos.AuthLoginDto;
import com.mpt.financecontrol.auth.dtos.AuthResponseDto;
import com.mpt.financecontrol.config.JwtUtil;
import com.mpt.financecontrol.exceptions.UnauthorizedException;
import com.mpt.financecontrol.usuario.dtos.UsuarioCreateDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.entity.Role;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService service;

    // Usuário "com id" (o id vem da BaseEntity, então setamos via reflexão em teste).
    private Usuario novoUsuario(UUID id, String nome, String email, String senhaHash, Role role, boolean ativo) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha(senhaHash);
        u.setRole(role);
        u.setAtivo(ativo);
        ReflectionTestUtils.setField(u, "id", id);
        return u;
    }

    // login
    @Test
    @DisplayName("login: com credenciais válidas, retorna token e dados do usuário")
    void login_comCredenciaisValidas_retornaTokenEDados() {
        UUID id = UUID.randomUUID();
        AuthLoginDto dto = new AuthLoginDto("eduardo@example.com", "senhaCorreta");
        Usuario usuario = novoUsuario(id, "Eduardo", "eduardo@example.com", "hashArmazenado", Role.USER, true);
        when(usuarioRepository.findByEmail("eduardo@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaCorreta", "hashArmazenado")).thenReturn(true);
        when(jwtUtil.gerar(id, Role.USER)).thenReturn("token-abc");

        AuthResponseDto resultado = service.login(dto);

        assertThat(resultado.token()).isEqualTo("token-abc");
        assertThat(resultado.id()).isEqualTo(id);
        assertThat(resultado.nome()).isEqualTo("Eduardo");
        assertThat(resultado.email()).isEqualTo("eduardo@example.com");
        assertThat(resultado.role()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("login: com e-mail inexistente, lança UnauthorizedException e não gera token")
    void login_comEmailInexistente_lancaUnauthorized() {
        AuthLoginDto dto = new AuthLoginDto("naoexiste@example.com", "senha");
        when(usuarioRepository.findByEmail("naoexiste@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(dto))
                .isInstanceOf(UnauthorizedException.class);

        verify(jwtUtil, never()).gerar(any(), any());
    }

    @Test
    @DisplayName("login: com usuário inativo, lança UnauthorizedException")
    void login_comUsuarioInativo_lancaUnauthorized() {
        AuthLoginDto dto = new AuthLoginDto("inativo@example.com", "senha");
        Usuario inativo = novoUsuario(UUID.randomUUID(), "Inativo", "inativo@example.com", "hash", Role.USER, false);
        when(usuarioRepository.findByEmail("inativo@example.com")).thenReturn(Optional.of(inativo));

        assertThatThrownBy(() -> service.login(dto))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Usuário inativo, contate o administrador");
    }

    @Test
    @DisplayName("login: com senha incorreta, lança UnauthorizedException e não gera token")
    void login_comSenhaIncorreta_lancaUnauthorized() {
        UUID id = UUID.randomUUID();
        AuthLoginDto dto = new AuthLoginDto("eduardo@example.com", "senhaErrada");
        Usuario usuario = novoUsuario(id, "Eduardo", "eduardo@example.com", "hashArmazenado", Role.USER, true);
        when(usuarioRepository.findByEmail("eduardo@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaErrada", "hashArmazenado")).thenReturn(false);

        assertThatThrownBy(() -> service.login(dto))
                .isInstanceOf(UnauthorizedException.class);

        verify(jwtUtil, never()).gerar(any(), any());
    }

    // register
    @Test
    @DisplayName("register: delega a criação para o UsuarioService")
    void register_delegaParaUsuarioServiceCreate() {
        UsuarioCreateDto dto = new UsuarioCreateDto("Eduardo", "eduardo@example.com", "senha12345", null, null, null);
        UsuarioResponseDto esperado = new UsuarioResponseDto(
                UUID.randomUUID(), UUID.randomUUID(), "Eduardo", "eduardo@example.com",
                null, "55", Role.USER, true, null, null);
        when(usuarioService.create(dto)).thenReturn(esperado);

        UsuarioResponseDto resultado = service.register(dto);

        assertThat(resultado).isSameAs(esperado);
        verify(usuarioService).create(dto);
    }
}
