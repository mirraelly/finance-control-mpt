package com.mpt.financecontrol.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.exceptions.ErroResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex) throws IOException {
        ErroResponseDto erro = new ErroResponseDto();
        erro.setErro("Não autenticado");
        erro.setCodigo(HttpServletResponse.SC_UNAUTHORIZED);
        erro.setTimestamp(new Date());
        erro.setPath(request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(mapper.writeValueAsString(erro));
    }
}
