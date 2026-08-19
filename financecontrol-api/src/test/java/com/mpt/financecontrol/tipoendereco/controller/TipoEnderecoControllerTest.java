package com.mpt.financecontrol.tipoendereco.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mpt.financecontrol.config.JwtFilter;
import com.mpt.financecontrol.config.SecurityConfig;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoCreateDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoResponseDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoUpdateDto;
import com.mpt.financecontrol.tipoendereco.service.TipoEnderecoService;
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

@WebMvcTest(controllers = TipoEnderecoController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { SecurityConfig.class, JwtFilter.class }))
@AutoConfigureMockMvc(addFilters = false)
@Import(SpringDataWebAutoConfiguration.class)
class TipoEnderecoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TipoEnderecoService service;

    private TipoEnderecoResponseDto dto(String nome, Boolean ativo) {
        return new TipoEnderecoResponseDto(UUID.randomUUID(), nome, ativo, null, null);
    }

    // GET (lista / select / por id)
    @Test
    @DisplayName("GET /tipos/endereco -> 200 com lista paginada")
    void getAll_retorna200() throws Exception {
        Page<TipoEnderecoResponseDto> pagina = new PageImpl<>(List.of(dto("Residencial", true)));
        when(service.getAll(any(), any())).thenReturn(pagina);

        mockMvc.perform(get("/tipos/endereco"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("Residencial"));
    }

    @Test
    @DisplayName("GET /tipos/endereco/select -> 200 com lista simples")
    void select_retorna200() throws Exception {
        when(service.select()).thenReturn(List.of(dto("Residencial", true)));

        mockMvc.perform(get("/tipos/endereco/select"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Residencial"));
    }

    @Test
    @DisplayName("GET /tipos/endereco/{id} -> 200 quando encontrado")
    void findById_quandoExiste_retorna200() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findByIdResponse(id)).thenReturn(dto("Residencial", true));

        mockMvc.perform(get("/tipos/endereco/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Residencial"));
    }

    @Test
    @DisplayName("GET /tipos/endereco/{id} -> 404 quando o service lança NotFound")
    void findById_quandoNaoExiste_retorna404() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findByIdResponse(id))
                .thenThrow(new NotFoundException("Tipo de endereço não encontrado"));

        mockMvc.perform(get("/tipos/endereco/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value(404));
    }

    // POST (create)
    @Test
    @DisplayName("POST /tipos/endereco -> 201 quando o corpo é válido")
    void create_comDadosValidos_retorna201() throws Exception {
        TipoEnderecoCreateDto body = new TipoEnderecoCreateDto("Residencial", true);
        when(service.create(any())).thenReturn(dto("Residencial", true));

        mockMvc.perform(post("/tipos/endereco")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Residencial"));
    }

    @Test
    @DisplayName("POST /tipos/endereco -> 400 quando o nome está em branco")
    void create_comNomeEmBranco_retorna400() throws Exception {
        TipoEnderecoCreateDto body = new TipoEnderecoCreateDto("", true);

        mockMvc.perform(post("/tipos/endereco")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /tipos/endereco -> 409 quando o service lança Conflict")
    void create_comNomeDuplicado_retorna409() throws Exception {
        TipoEnderecoCreateDto body = new TipoEnderecoCreateDto("Residencial", true);
        when(service.create(any()))
                .thenThrow(new ConflictException("Já existe um tipo de endereço com esse nome"));

        mockMvc.perform(post("/tipos/endereco")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    // PUT (update)
    @Test
    @DisplayName("PUT /tipos/endereco/{id} -> 200 quando o corpo é válido")
    void update_comDadosValidos_retorna200() throws Exception {
        UUID id = UUID.randomUUID();
        TipoEnderecoUpdateDto body = new TipoEnderecoUpdateDto("Comercial", false);
        when(service.update(eq(id), any())).thenReturn(dto("Comercial", false));

        mockMvc.perform(put("/tipos/endereco/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Comercial"));
    }

    @Test
    @DisplayName("PUT /tipos/endereco/{id} -> 404 quando o service lança NotFound")
    void update_quandoNaoExiste_retorna404() throws Exception {
        UUID id = UUID.randomUUID();
        TipoEnderecoUpdateDto body = new TipoEnderecoUpdateDto("Comercial", true);
        when(service.update(eq(id), any()))
                .thenThrow(new NotFoundException("Tipo de endereço não encontrado"));

        mockMvc.perform(put("/tipos/endereco/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }
}
