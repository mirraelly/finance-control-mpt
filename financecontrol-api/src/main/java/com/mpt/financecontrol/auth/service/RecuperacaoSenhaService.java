package com.mpt.financecontrol.auth.service;

import com.mpt.financecontrol.auth.dtos.EsqueciSenhaDto;
import com.mpt.financecontrol.auth.dtos.RedefinirSenhaDto;
import com.mpt.financecontrol.auth.entity.TokenRecuperacaoSenha;
import com.mpt.financecontrol.auth.repository.TokenRecuperacaoSenhaRepository;
import com.mpt.financecontrol.exceptions.ApplicationException;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecuperacaoSenhaService {

    private static final Logger log = LoggerFactory.getLogger(RecuperacaoSenhaService.class);

    private static final Duration VALIDADE_TOKEN = Duration.ofMinutes(30);

    private final UsuarioRepository               usuarioRepository;
    private final TokenRecuperacaoSenhaRepository tokenRepository;
    private final PasswordEncoder                 passwordEncoder;
    private final JavaMailSender                  mailSender;
    private final String                          remetente;
    private final String                          frontUrl;

    public RecuperacaoSenhaService(
            UsuarioRepository               usuarioRepository,
            TokenRecuperacaoSenhaRepository tokenRepository,
            PasswordEncoder                 passwordEncoder,
            JavaMailSender                  mailSender,
            @Value("${spring.mail.username}") String remetente,
            @Value("${app.front-url}")        String frontUrl
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository   = tokenRepository;
        this.passwordEncoder   = passwordEncoder;
        this.mailSender        = mailSender;
        this.remetente         = remetente;
        this.frontUrl          = frontUrl;
    }

    @Transactional
    public void solicitar(EsqueciSenhaDto dto) {
        Optional<Usuario> encontrado = usuarioRepository.findByEmail(dto.email());
        if (encontrado.isEmpty() || !encontrado.get().getAtivo())
            return;

        Usuario usuario = encontrado.get();

        TokenRecuperacaoSenha token = new TokenRecuperacaoSenha();
        token.setUsuario(usuario);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiraEm(Instant.now().plus(VALIDADE_TOKEN));
        tokenRepository.save(token);

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom(remetente);
        mensagem.setTo(usuario.getEmail());
        mensagem.setSubject("FinanceControl - Recuperação de senha");
        mensagem.setText(
                "Olá, " + usuario.getNome() + "!\n\n"
                + "Recebemos uma solicitação para redefinir a senha da sua conta no FinanceControl.\n"
                + "Para criar uma nova senha, acesse o link abaixo:\n\n"
                + frontUrl + "/redefinir-senha?token=" + token.getToken() + "\n\n"
                + "O link é válido por " + VALIDADE_TOKEN.toMinutes() + " minutos e pode ser usado apenas uma vez.\n"
                + "Se você não solicitou a alteração, ignore este e-mail."
        );

        try {
            mailSender.send(mensagem);
        } catch (MailException e) {
            log.error("Erro ao enviar e-mail de recuperação de senha", e);
            throw new ApplicationException("Não foi possível enviar o e-mail de recuperação, tente novamente!");
        }
    }

    @Transactional
    public void redefinir(RedefinirSenhaDto dto) {
        TokenRecuperacaoSenha token = tokenRepository.findByToken(dto.token())
                .filter(t -> !t.getUtilizado() && t.getExpiraEm().isAfter(Instant.now()))
                .orElseThrow(() -> new BadRequestException("Link de recuperação inválido ou expirado, solicite um novo!"));

        Usuario usuario = token.getUsuario();
        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuario.setUpdatedBy(usuario);
        usuarioRepository.save(usuario);

        token.setUtilizado(true);
        tokenRepository.save(token);
    }
}
