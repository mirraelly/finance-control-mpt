package com.mpt.financecontrol.contafinanceira.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.config.JwtFilter;
import com.mpt.financecontrol.config.SecurityConfig;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraCreateDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraResponseDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraUpdateDto;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ContaFinanceiraController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { SecurityConfig.class, JwtFilter.class }))
@AutoConfigureMockMvc(addFilters = false)
@Import(SpringDataWebAutoConfiguration.class)
class ContaFinanceiraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ContaFinanceiraService service;

    private ContaFinanceiraResponseDto dto(String nome, Boolean ativo) {
        return new ContaFinanceiraResponseDto(UUID.randomUUID(), nome, ativo, null, null);
    }

    @Test
    @DisplayName("GET /contas-financeiras -> 200 com lista paginada")
    void getAll_retorna200() throws Exception {
        Page<ContaFinanceiraResponseDto> pagina = new PageImpl<>(List.of(dto("Banco do Brasil", true)));
        when(service.getAll(any(), any())).thenReturn(pagina);

        mockMvc.perform(get("/contas-financeiras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("Banco do Brasil"));
    }

    @Test
    @DisplayName("GET /contas-financeiras/select -> 200 com lista simples")
    void select_retorna200() throws Exception {
        when(service.select()).thenReturn(List.of(dto("Banco do Brasil", true)));

        mockMvc.perform(get("/contas-financeiras/select"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Banco do Brasil"));
    }

    @Test
    @DisplayName("GET /contas-financeiras/{id} -> 200 quando encontrado")
    void findById_quandoExiste_retorna200() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findByIdResponse(id)).thenReturn(dto("Banco do Brasil", true));

        mockMvc.perform(get("/contas-financeiras/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Banco do Brasil"));
    }

    @Test
    @DisplayName("GET /contas-financeiras/{id} -> 404 quando o service lança NotFound")
    void findById_quandoNaoExiste_retorna404() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findByIdResponse(id))
                .thenThrow(new NotFoundException("Conta financeira não encontrada"));

        mockMvc.perform(get("/contas-financeiras/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value(404));
    }

    @Test
    @DisplayName("POST /contas-financeiras -> 201 quando o corpo é válido")
    void create_comDadosValidos_retorna201() throws Exception {
        ContaFinanceiraCreateDto body = new ContaFinanceiraCreateDto("Banco do Brasil", true);
        when(service.create(any())).thenReturn(dto("Banco do Brasil", true));

        mockMvc.perform(post("/contas-financeiras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Banco do Brasil"));
    }

    @Test
    @DisplayName("POST /contas-financeiras -> 400 quando o nome está em branco")
    void create_comNomeEmBranco_retorna400() throws Exception {
        ContaFinanceiraCreateDto body = new ContaFinanceiraCreateDto("", true);

        mockMvc.perform(post("/contas-financeiras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /contas-financeiras -> 409 quando o service lança Conflict")
    void create_comNomeDuplicado_retorna409() throws Exception {
        ContaFinanceiraCreateDto body = new ContaFinanceiraCreateDto("Banco do Brasil", true);
        when(service.create(any()))
                .thenThrow(new ConflictException("Já existe uma conta financeira com esse nome"));

        mockMvc.perform(post("/contas-financeiras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT /contas-financeiras/{id} -> 200 quando o corpo é válido")
    void update_comDadosValidos_retorna200() throws Exception {
        UUID id = UUID.randomUUID();
        ContaFinanceiraUpdateDto body = new ContaFinanceiraUpdateDto("Caixa Econômica", false);
        when(service.update(eq(id), any())).thenReturn(dto("Caixa Econômica", false));

        mockMvc.perform(put("/contas-financeiras/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Caixa Econômica"));
    }

    @Test
    @DisplayName("PUT /contas-financeiras/{id} -> 404 quando o service lança NotFound")
    void update_quandoNaoExiste_retorna404() throws Exception {
        UUID id = UUID.randomUUID();
        ContaFinanceiraUpdateDto body = new ContaFinanceiraUpdateDto("Caixa Econômica", true);
        when(service.update(eq(id), any()))
                .thenThrow(new NotFoundException("Conta financeira não encontrada"));

        mockMvc.perform(put("/contas-financeiras/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }
}
