package com.mpt.financecontrol.usuario.service;

import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.tenant.service.TenantService;
import com.mpt.financecontrol.usuario.dtos.UsuarioAlterarSenhaDto;
import com.mpt.financecontrol.usuario.entity.Role;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TenantService tenantService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        UUID id = UUID.randomUUID();
        usuario = new Usuario();
        usuario.setNome("Eduardo");
        usuario.setEmail("eduardo@example.com");
        usuario.setSenha("hashAtual");
        usuario.setRole(Role.USER);
        ReflectionTestUtils.setField(usuario, "id", id);

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(id, null, List.of()));
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("alterarSenha: com senha atual incorreta, lança BadRequestException e não salva")
    void alterarSenha_comSenhaAtualIncorreta_lancaBadRequest() {
        when(passwordEncoder.matches("SenhaErrada@1", "hashAtual")).thenReturn(false);

        assertThatThrownBy(() -> service.alterarSenha(new UsuarioAlterarSenhaDto("SenhaErrada@1", "NovaSenha@123")))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("A senha atual informada está incorreta, verifique!");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("alterarSenha: com nova senha igual à atual, lança BadRequestException e não salva")
    void alterarSenha_comNovaSenhaIgualAtual_lancaBadRequest() {
        when(passwordEncoder.matches("SenhaAtual@1", "hashAtual")).thenReturn(true);

        assertThatThrownBy(() -> service.alterarSenha(new UsuarioAlterarSenhaDto("SenhaAtual@1", "SenhaAtual@1")))
                .isInstanceOf(BadRequestException.class);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("alterarSenha: com dados válidos, grava o novo hash da senha")
    void alterarSenha_comDadosValidos_gravaNovoHash() {
        when(passwordEncoder.matches("SenhaAtual@1", "hashAtual")).thenReturn(true);
        when(passwordEncoder.matches("NovaSenha@123", "hashAtual")).thenReturn(false);
        when(passwordEncoder.encode("NovaSenha@123")).thenReturn("hashNovo");

        service.alterarSenha(new UsuarioAlterarSenhaDto("SenhaAtual@1", "NovaSenha@123"));

        assertThat(usuario.getSenha()).isEqualTo("hashNovo");
        verify(usuarioRepository).save(usuario);
    }
}
