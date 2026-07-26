package com.mpt.financecontrol.tipotelefone.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.config.JwtFilter;
import com.mpt.financecontrol.config.SecurityConfig;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneCreateDto;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneResponseDto;
import com.mpt.financecontrol.tipotelefone.dtos.TipoTelefoneUpdateDto;
import com.mpt.financecontrol.tipotelefone.service.TipoTelefoneService;
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

@WebMvcTest(controllers = TipoTelefoneController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { SecurityConfig.class, JwtFilter.class }))
@AutoConfigureMockMvc(addFilters = false)
@Import(SpringDataWebAutoConfiguration.class)
class TipoTelefoneControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TipoTelefoneService service;

    private TipoTelefoneResponseDto dto(String nome, Boolean ativo) {
        return new TipoTelefoneResponseDto(UUID.randomUUID(), nome, ativo, null, null);
    }

    // GET (lista / select / por id)
    @Test
    @DisplayName("GET /tipos/telefone -> 200 com lista paginada")
    void getAll_retorna200() throws Exception {
        Page<TipoTelefoneResponseDto> pagina = new PageImpl<>(List.of(dto("Celular", true)));
        when(service.getAll(any(), any())).thenReturn(pagina);

        mockMvc.perform(get("/tipos/telefone"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("Celular"));
    }

    @Test
    @DisplayName("GET /tipos/telefone/select -> 200 com lista simples")
    void select_retorna200() throws Exception {
        when(service.select()).thenReturn(List.of(dto("Celular", true)));

        mockMvc.perform(get("/tipos/telefone/select"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Celular"));
    }

    @Test
    @DisplayName("GET /tipos/telefone/{id} -> 200 quando encontrado")
    void findById_quandoExiste_retorna200() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findByIdResponse(id)).thenReturn(dto("Celular", true));

        mockMvc.perform(get("/tipos/telefone/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Celular"));
    }

    @Test
    @DisplayName("GET /tipos/telefone/{id} -> 404 quando o service lança NotFound")
    void findById_quandoNaoExiste_retorna404() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findByIdResponse(id))
                .thenThrow(new NotFoundException("Tipo de telefone não encontrado"));

        mockMvc.perform(get("/tipos/telefone/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value(404));
    }

    // POST (create)
    @Test
    @DisplayName("POST /tipos/telefone -> 201 quando o corpo é válido")
    void create_comDadosValidos_retorna201() throws Exception {
        TipoTelefoneCreateDto body = new TipoTelefoneCreateDto("Celular", true);
        when(service.create(any())).thenReturn(dto("Celular", true));

        mockMvc.perform(post("/tipos/telefone")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Celular"));
    }

    @Test
    @DisplayName("POST /tipos/telefone -> 400 quando o nome está em branco")
    void create_comNomeEmBranco_retorna400() throws Exception {
        TipoTelefoneCreateDto body = new TipoTelefoneCreateDto("", true);

        mockMvc.perform(post("/tipos/telefone")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /tipos/telefone -> 409 quando o service lança Conflict")
    void create_comNomeDuplicado_retorna409() throws Exception {
        TipoTelefoneCreateDto body = new TipoTelefoneCreateDto("Celular", true);
        when(service.create(any()))
                .thenThrow(new ConflictException("Já existe um tipo de telefone com esse nome"));

        mockMvc.perform(post("/tipos/telefone")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    // PUT (update)
    @Test
    @DisplayName("PUT /tipos/telefone/{id} -> 200 quando o corpo é válido")
    void update_comDadosValidos_retorna200() throws Exception {
        UUID id = UUID.randomUUID();
        TipoTelefoneUpdateDto body = new TipoTelefoneUpdateDto("Comercial", false);
        when(service.update(eq(id), any())).thenReturn(dto("Comercial", false));

        mockMvc.perform(put("/tipos/telefone/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Comercial"));
    }

    @Test
    @DisplayName("PUT /tipos/telefone/{id} -> 404 quando o service lança NotFound")
    void update_quandoNaoExiste_retorna404() throws Exception {
        UUID id = UUID.randomUUID();
        TipoTelefoneUpdateDto body = new TipoTelefoneUpdateDto("Comercial", true);
        when(service.update(eq(id), any()))
                .thenThrow(new NotFoundException("Tipo de telefone não encontrado"));

        mockMvc.perform(put("/tipos/telefone/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }
}
