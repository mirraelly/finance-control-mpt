package com.mpt.financecontrol.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.exceptions.ErroResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex) throws IOException {
        ErroResponseDto erro = new ErroResponseDto();
        erro.setErro("Acesso negado");
        erro.setCodigo(HttpServletResponse.SC_FORBIDDEN);
        erro.setTimestamp(new Date());
        erro.setPath(request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write(mapper.writeValueAsString(erro));
    }
}
