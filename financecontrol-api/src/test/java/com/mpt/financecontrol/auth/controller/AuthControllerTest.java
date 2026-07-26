package com.mpt.financecontrol.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.auth.dtos.AuthLoginDto;
import com.mpt.financecontrol.auth.dtos.AuthResponseDto;
import com.mpt.financecontrol.auth.service.AuthService;
import com.mpt.financecontrol.config.JwtFilter;
import com.mpt.financecontrol.config.SecurityConfig;
import com.mpt.financecontrol.exceptions.UnauthorizedException;
import com.mpt.financecontrol.usuario.dtos.UsuarioCreateDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.entity.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { SecurityConfig.class, JwtFilter.class }))
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    // login
    @Test
    @DisplayName("POST /auth/login -> 200 com token quando as credenciais são válidas")
    void login_comCredenciaisValidas_retorna200() throws Exception {
        AuthLoginDto body = new AuthLoginDto("eduardo@example.com", "senha12345");
        AuthResponseDto resposta =
                new AuthResponseDto("token-abc", UUID.randomUUID(), "Eduardo", "eduardo@example.com", Role.USER);
        when(authService.login(any())).thenReturn(resposta);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-abc"))
                .andExpect(jsonPath("$.email").value("eduardo@example.com"));
    }

    @Test
    @DisplayName("POST /auth/login -> 401 quando o service lança Unauthorized")
    void login_comCredenciaisInvalidas_retorna401() throws Exception {
        AuthLoginDto body = new AuthLoginDto("eduardo@example.com", "senhaErrada");
        when(authService.login(any()))
                .thenThrow(new UnauthorizedException("E-mail ou senha inválidos"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value(401));
    }

    @Test
    @DisplayName("POST /auth/login -> 400 quando o e-mail é inválido")
    void login_comEmailInvalido_retorna400() throws Exception {
        AuthLoginDto body = new AuthLoginDto("naoehemail", "senha12345");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    // register
    @Test
    @DisplayName("POST /auth/register -> 201 quando o corpo é válido")
    void register_comDadosValidos_retorna201() throws Exception {
        UsuarioCreateDto body =
                new UsuarioCreateDto("Eduardo", "eduardo@example.com", "senha12345", null, null, null);
        UsuarioResponseDto resposta = new UsuarioResponseDto(
                UUID.randomUUID(), UUID.randomUUID(), "Eduardo", "eduardo@example.com",
                null, "55", Role.USER, true, null, null);
        when(authService.register(any())).thenReturn(resposta);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Eduardo"));
    }
}
