package com.mpt.financecontrol.loginlog.mapper;

import com.mpt.financecontrol.loginlog.dtos.LoginLogResponseDto;
import com.mpt.financecontrol.loginlog.entity.LoginLog;

public class LoginLogMapper {

    private LoginLogMapper() {}

    public static LoginLogResponseDto toResponseDto(LoginLog loginLog) {
        return new LoginLogResponseDto(
                loginLog.getId(),
                loginLog.getUsuario() != null ? loginLog.getUsuario().getId() : null,
                loginLog.getUsuario() != null ? loginLog.getUsuario().getNome() : null,
                loginLog.getEmail(),
                loginLog.getSucesso(),
                loginLog.getMotivoFalha(),
                loginLog.getEnderecoIp(),
                loginLog.getUserAgent(),
                loginLog.getCreatedAt()
        );
    }
}
