package com.mpt.financecontrol.tipoemail.service;

import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailCreateDto;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailResponseDto;
import com.mpt.financecontrol.tipoemail.dtos.TipoEmailUpdateDto;
import com.mpt.financecontrol.tipoemail.entity.TipoEmail;
import com.mpt.financecontrol.tipoemail.repository.TipoEmailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TipoEmailServiceTest {

    @Mock
    private TipoEmailRepository repository;

    @InjectMocks
    private TipoEmailService service;

    private UUID id;
    private TipoEmail tipo;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        tipo = novoTipo(id, "Comercial", true);
    }

    private TipoEmail novoTipo(UUID id, String nome, boolean ativo) {
        TipoEmail t = new TipoEmail();
        t.setNome(nome);
        t.setAtivo(ativo);
        ReflectionTestUtils.setField(t, "id", id);
        return t;
    }

    // findById
    @Test
    @DisplayName("findById: quando existe, retorna a entidade")
    void findById_quandoExiste_retornaEntidade() {
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        TipoEmail resultado = service.findById(id);
        assertThat(resultado).isSameAs(tipo);
    }

    @Test
    @DisplayName("findById: quando não existe, lança NotFoundException")
    void findById_quandoNaoExiste_lancaNotFound() {
        when(repository.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Tipo de email não encontrado");
    }

    @Test
    @DisplayName("findByIdResponse: quando existe, retorna o DTO mapeado")
    void findByIdResponse_quandoExiste_retornaDto() {
        when(repository.findById(id)).thenReturn(Optional.of(tipo));

        TipoEmailResponseDto resultado = service.findByIdResponse(id);

        assertThat(resultado.id()).isEqualTo(id);
        assertThat(resultado.nome()).isEqualTo("Comercial");
        assertThat(resultado.ativo()).isTrue();
    }

    // create
    @Test
    @DisplayName("create: com nome novo, salva e retorna o DTO")
    void create_comNomeNovo_salvaERetornaDto() {
        TipoEmailCreateDto dto = new TipoEmailCreateDto("Particular", true);
        when(repository.existsByNomeNormalizado("Particular")).thenReturn(false);
        when(repository.save(any(TipoEmail.class))).thenAnswer(returnsFirstArg());

        TipoEmailResponseDto resultado = service.create(dto);

        assertThat(resultado.nome()).isEqualTo("Particular");
        assertThat(resultado.ativo()).isTrue();
        verify(repository).save(any(TipoEmail.class));
    }

    @Test
    @DisplayName("create: sem informar ativo, usa o padrão true")
    void create_semAtivo_usaPadraoTrue() {
        TipoEmailCreateDto dto = new TipoEmailCreateDto("Financeiro", null);
        when(repository.existsByNomeNormalizado("Financeiro")).thenReturn(false);
        when(repository.save(any(TipoEmail.class))).thenAnswer(returnsFirstArg());

        TipoEmailResponseDto resultado = service.create(dto);
        assertThat(resultado.ativo()).isTrue();
    }

    @Test
    @DisplayName("create: com nome já existente, lança ConflictException e não salva")
    void create_comNomeExistente_lancaConflict() {
        TipoEmailCreateDto dto = new TipoEmailCreateDto("Comercial", true);
        when(repository.existsByNomeNormalizado("Comercial")).thenReturn(true);

        assertThatThrownBy(() -> service.create(dto))
                .isInstanceOf(ConflictException.class);

        verify(repository, never()).save(any());
    }

    // update
    @Test
    @DisplayName("update: com dados válidos, atualiza e retorna o DTO")
    void update_comDadosValidos_atualizaERetornaDto() {
        TipoEmailUpdateDto dto = new TipoEmailUpdateDto("Particular", false);
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        when(repository.findByNomeNormalizado("Particular")).thenReturn(Optional.empty());
        when(repository.save(any(TipoEmail.class))).thenAnswer(returnsFirstArg());

        TipoEmailResponseDto resultado = service.update(id, dto);

        assertThat(resultado.nome()).isEqualTo("Particular");
        assertThat(resultado.ativo()).isFalse();
    }

    @Test
    @DisplayName("update: quando não existe, lança NotFoundException e não salva")
    void update_quandoNaoExiste_lancaNotFound() {
        TipoEmailUpdateDto dto = new TipoEmailUpdateDto("Particular", true);
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(NotFoundException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: com nome que já pertence a OUTRO registro, lança ConflictException")
    void update_comNomeDeOutro_lancaConflict() {
        TipoEmailUpdateDto dto = new TipoEmailUpdateDto("Particular", true);
        TipoEmail outro = novoTipo(UUID.randomUUID(), "Particular", true); // id diferente
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        when(repository.findByNomeNormalizado("Particular")).thenReturn(Optional.of(outro));

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(ConflictException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: mantendo o mesmo nome do próprio registro, não dá conflito")
    void update_comMesmoNome_permite() {
        TipoEmailUpdateDto dto = new TipoEmailUpdateDto("Comercial", false);
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        when(repository.findByNomeNormalizado("Comercial")).thenReturn(Optional.of(tipo)); // é ele mesmo
        when(repository.save(any(TipoEmail.class))).thenAnswer(returnsFirstArg());

        TipoEmailResponseDto resultado = service.update(id, dto);

        assertThat(resultado.nome()).isEqualTo("Comercial");
        assertThat(resultado.ativo()).isFalse();
    }

    // getAll / select
    @Test
    @DisplayName("getAll: retorna uma página de DTOs")
    void getAll_retornaPaginaDeDtos() {
        Pageable pageable = PageRequest.of(0, 15);
        Page<TipoEmail> pagina = new PageImpl<>(List.of(tipo));
        when(repository.findAllWithFilters(pageable, null)).thenReturn(pagina);

        Page<TipoEmailResponseDto> resultado = service.getAll(pageable, null);

        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).nome()).isEqualTo("Comercial");
    }

    @Test
    @DisplayName("select: retorna uma lista de DTOs")
    void select_retornaListaDeDtos() {
        when(repository.findForSelect()).thenReturn(List.of(tipo));

        List<TipoEmailResponseDto> resultado = service.select();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).nome()).isEqualTo("Comercial");
    }
}
