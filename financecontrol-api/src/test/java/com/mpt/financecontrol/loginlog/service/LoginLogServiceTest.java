package com.mpt.financecontrol.loginlog.service;

import com.mpt.financecontrol.loginlog.entity.LoginLog;
import com.mpt.financecontrol.loginlog.entity.MotivoFalhaLogin;
import com.mpt.financecontrol.loginlog.repository.LoginLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginLogServiceTest {

    @Mock
    private LoginLogRepository repository;

    @InjectMocks
    private LoginLogService service;

    @Test
    @DisplayName("registrar: grava a tentativa e corta o user agent em 512 caracteres")
    void registrar_gravaTentativaECortaUserAgent() {
        service.registrar(null, "teste@example.com", false, MotivoFalhaLogin.USUARIO_INEXISTENTE, "127.0.0.1", "a".repeat(600));

        ArgumentCaptor<LoginLog> captor = ArgumentCaptor.forClass(LoginLog.class);
        verify(repository).save(captor.capture());

        LoginLog salvo = captor.getValue();
        assertThat(salvo.getEmail()).isEqualTo("teste@example.com");
        assertThat(salvo.getSucesso()).isFalse();
        assertThat(salvo.getMotivoFalha()).isEqualTo(MotivoFalhaLogin.USUARIO_INEXISTENTE);
        assertThat(salvo.getUserAgent()).hasSize(512);
    }

    @Test
    @DisplayName("getAll: converte o período do horário de Brasília para UTC")
    void getAll_convertePeriodoParaUtc() {
        Pageable pageable = PageRequest.of(0, 15);
        when(repository.findAllWithFilters(
                pageable, null, null,
                LocalDateTime.of(2026, 9, 30, 3, 0),
                LocalDateTime.of(2026, 10, 1, 3, 0)
        )).thenReturn(Page.empty());

        Page<?> resultado = service.getAll(pageable, null, null, LocalDate.of(2026, 9, 30), LocalDate.of(2026, 9, 30));

        assertThat(resultado).isEmpty();
    }
}
