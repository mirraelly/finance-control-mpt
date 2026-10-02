package com.mpt.financecontrol.loginlog.service;

import com.mpt.financecontrol.loginlog.dtos.LoginLogResponseDto;
import com.mpt.financecontrol.loginlog.entity.LoginLog;
import com.mpt.financecontrol.loginlog.entity.MotivoFalhaLogin;
import com.mpt.financecontrol.loginlog.mapper.LoginLogMapper;
import com.mpt.financecontrol.loginlog.repository.LoginLogRepository;
import com.mpt.financecontrol.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

@Service
public class LoginLogService {

    private static final int    TAMANHO_MAXIMO_USER_AGENT = 512;
    private static final ZoneId FUSO_HORARIO              = ZoneId.of("America/Sao_Paulo");

    private final LoginLogRepository repository;

    public LoginLogService(LoginLogRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(
            Usuario          usuario,
            String           email,
            boolean          sucesso,
            MotivoFalhaLogin motivoFalha,
            String           enderecoIp,
            String           userAgent
    ) {
        LoginLog loginLog = new LoginLog();
        loginLog.setUsuario(usuario);
        loginLog.setEmail(email);
        loginLog.setSucesso(sucesso);
        loginLog.setMotivoFalha(motivoFalha);
        loginLog.setEnderecoIp(enderecoIp);
        loginLog.setUserAgent(limitarUserAgent(userAgent));

        repository.save(loginLog);
    }

    @Transactional(readOnly = true)
    public Page<LoginLogResponseDto> getAll(
            Pageable  pageable,
            Boolean   sucesso,
            String    email,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        LocalDateTime inicio = dataInicio != null ? inicioDoDiaEmUtc(dataInicio) : null;
        LocalDateTime fim    = dataFim    != null ? inicioDoDiaEmUtc(dataFim.plusDays(1)) : null;

        return repository.findAllWithFilters(pageable, sucesso, email, inicio, fim)
                .map(LoginLogMapper::toResponseDto);
    }

    private LocalDateTime inicioDoDiaEmUtc(LocalDate data) {
        return LocalDateTime.ofInstant(data.atStartOfDay(FUSO_HORARIO).toInstant(), ZoneOffset.UTC);
    }

    private String limitarUserAgent(String userAgent) {
        if (userAgent == null || userAgent.length() <= TAMANHO_MAXIMO_USER_AGENT)
            return userAgent;

        return userAgent.substring(0, TAMANHO_MAXIMO_USER_AGENT);
    }
}
