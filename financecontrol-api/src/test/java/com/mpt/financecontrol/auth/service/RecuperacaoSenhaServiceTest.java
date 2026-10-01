package com.mpt.financecontrol.auth.service;

import com.mpt.financecontrol.auth.dtos.EsqueciSenhaDto;
import com.mpt.financecontrol.auth.dtos.RedefinirSenhaDto;
import com.mpt.financecontrol.auth.entity.TokenRecuperacaoSenha;
import com.mpt.financecontrol.auth.repository.TokenRecuperacaoSenhaRepository;
import com.mpt.financecontrol.exceptions.ApplicationException;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecuperacaoSenhaServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TokenRecuperacaoSenhaRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JavaMailSender mailSender;

    private RecuperacaoSenhaService service;

    @BeforeEach
    void setUp() {
        service = new RecuperacaoSenhaService(
                usuarioRepository, tokenRepository, passwordEncoder, mailSender,
                "financecontrol@example.com", "http://localhost:5173");
    }

    private Usuario novoUsuario(String email, boolean ativo) {
        Usuario u = new Usuario();
        u.setNome("Eduardo");
        u.setEmail(email);
        u.setSenha("hashAntigo");
        u.setAtivo(ativo);
        return u;
    }

    private TokenRecuperacaoSenha novoToken(Usuario usuario, Instant expiraEm, boolean utilizado) {
        TokenRecuperacaoSenha t = new TokenRecuperacaoSenha();
        t.setUsuario(usuario);
        t.setToken("token-abc");
        t.setExpiraEm(expiraEm);
        t.setUtilizado(utilizado);
        return t;
    }

    @Test
    @DisplayName("solicitar: com e-mail inexistente, não gera token nem envia e-mail")
    void solicitar_comEmailInexistente_naoEnvia() {
        when(usuarioRepository.findByEmail("naoexiste@example.com")).thenReturn(Optional.empty());

        service.solicitar(new EsqueciSenhaDto("naoexiste@example.com"));

        verify(tokenRepository, never()).save(any());
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("solicitar: com usuário inativo, não gera token nem envia e-mail")
    void solicitar_comUsuarioInativo_naoEnvia() {
        when(usuarioRepository.findByEmail("inativo@example.com"))
                .thenReturn(Optional.of(novoUsuario("inativo@example.com", false)));

        service.solicitar(new EsqueciSenhaDto("inativo@example.com"));

        verify(tokenRepository, never()).save(any());
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("solicitar: com e-mail cadastrado, salva o token e envia o link por e-mail")
    void solicitar_comEmailCadastrado_salvaTokenEEnviaEmail() {
        Usuario usuario = novoUsuario("eduardo@example.com", true);
        when(usuarioRepository.findByEmail("eduardo@example.com")).thenReturn(Optional.of(usuario));

        service.solicitar(new EsqueciSenhaDto("eduardo@example.com"));

        ArgumentCaptor<TokenRecuperacaoSenha> tokenCaptor = ArgumentCaptor.forClass(TokenRecuperacaoSenha.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        TokenRecuperacaoSenha token = tokenCaptor.getValue();
        assertThat(token.getUsuario()).isSameAs(usuario);
        assertThat(token.getUtilizado()).isFalse();
        assertThat(token.getExpiraEm()).isAfter(Instant.now());

        ArgumentCaptor<SimpleMailMessage> emailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(emailCaptor.capture());
        SimpleMailMessage email = emailCaptor.getValue();
        assertThat(email.getTo()).containsExactly("eduardo@example.com");
        assertThat(email.getText()).contains("http://localhost:5173/redefinir-senha?token=" + token.getToken());
    }

    @Test
    @DisplayName("solicitar: quando o envio falha, lança ApplicationException")
    void solicitar_quandoEnvioFalha_lancaApplicationException() {
        when(usuarioRepository.findByEmail("eduardo@example.com"))
                .thenReturn(Optional.of(novoUsuario("eduardo@example.com", true)));
        doThrow(new MailSendException("falha")).when(mailSender).send(any(SimpleMailMessage.class));

        assertThatThrownBy(() -> service.solicitar(new EsqueciSenhaDto("eduardo@example.com")))
                .isInstanceOf(ApplicationException.class);
    }

    @Test
    @DisplayName("redefinir: com token inexistente, lança BadRequestException")
    void redefinir_comTokenInexistente_lancaBadRequest() {
        when(tokenRepository.findByToken("token-abc")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.redefinir(new RedefinirSenhaDto("token-abc", "NovaSenha@123")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("redefinir: com token expirado, lança BadRequestException e não altera a senha")
    void redefinir_comTokenExpirado_lancaBadRequest() {
        Usuario usuario = novoUsuario("eduardo@example.com", true);
        when(tokenRepository.findByToken("token-abc"))
                .thenReturn(Optional.of(novoToken(usuario, Instant.now().minusSeconds(60), false)));

        assertThatThrownBy(() -> service.redefinir(new RedefinirSenhaDto("token-abc", "NovaSenha@123")))
                .isInstanceOf(BadRequestException.class);

        assertThat(usuario.getSenha()).isEqualTo("hashAntigo");
    }

    @Test
    @DisplayName("redefinir: com token já utilizado, lança BadRequestException e não altera a senha")
    void redefinir_comTokenUtilizado_lancaBadRequest() {
        Usuario usuario = novoUsuario("eduardo@example.com", true);
        when(tokenRepository.findByToken("token-abc"))
                .thenReturn(Optional.of(novoToken(usuario, Instant.now().plusSeconds(600), true)));

        assertThatThrownBy(() -> service.redefinir(new RedefinirSenhaDto("token-abc", "NovaSenha@123")))
                .isInstanceOf(BadRequestException.class);

        assertThat(usuario.getSenha()).isEqualTo("hashAntigo");
    }

    @Test
    @DisplayName("redefinir: com token válido, altera a senha e marca o token como utilizado")
    void redefinir_comTokenValido_alteraSenhaEMarcaUtilizado() {
        Usuario usuario = novoUsuario("eduardo@example.com", true);
        TokenRecuperacaoSenha token = novoToken(usuario, Instant.now().plusSeconds(600), false);
        when(tokenRepository.findByToken("token-abc")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NovaSenha@123")).thenReturn("hashNovo");

        service.redefinir(new RedefinirSenhaDto("token-abc", "NovaSenha@123"));

        assertThat(usuario.getSenha()).isEqualTo("hashNovo");
        assertThat(token.getUtilizado()).isTrue();
        verify(usuarioRepository).save(usuario);
        verify(tokenRepository).save(token);
    }
}
