package com.mpt.financecontrol.tipoendereco.service;

import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoCreateDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoResponseDto;
import com.mpt.financecontrol.tipoendereco.dtos.TipoEnderecoUpdateDto;
import com.mpt.financecontrol.tipoendereco.entity.TipoEndereco;
import com.mpt.financecontrol.tipoendereco.repository.TipoEnderecoRepository;
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
class TipoEnderecoServiceTest {

    @Mock
    private TipoEnderecoRepository repository;

    @InjectMocks
    private TipoEnderecoService service;

    private UUID id;
    private TipoEndereco tipo;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        tipo = novoTipo(id, "Residencial", true);
    }

    private TipoEndereco novoTipo(UUID id, String nome, boolean ativo) {
        TipoEndereco t = new TipoEndereco();
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
        TipoEndereco resultado = service.findById(id);
        assertThat(resultado).isSameAs(tipo);
    }

    @Test
    @DisplayName("findById: quando não existe, lança NotFoundException")
    void findById_quandoNaoExiste_lancaNotFound() {
        when(repository.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Tipo de endereço não encontrado");
    }

    @Test
    @DisplayName("findByIdResponse: quando existe, retorna o DTO mapeado")
    void findByIdResponse_quandoExiste_retornaDto() {
        when(repository.findById(id)).thenReturn(Optional.of(tipo));

        TipoEnderecoResponseDto resultado = service.findByIdResponse(id);

        assertThat(resultado.id()).isEqualTo(id);
        assertThat(resultado.nome()).isEqualTo("Residencial");
        assertThat(resultado.ativo()).isTrue();
    }

    // create
    @Test
    @DisplayName("create: com nome novo, salva e retorna o DTO")
    void create_comNomeNovo_salvaERetornaDto() {
        TipoEnderecoCreateDto dto = new TipoEnderecoCreateDto("Comercial", true);
        when(repository.existsByNomeNormalizado("Comercial")).thenReturn(false);
        when(repository.save(any(TipoEndereco.class))).thenAnswer(returnsFirstArg());

        TipoEnderecoResponseDto resultado = service.create(dto);

        assertThat(resultado.nome()).isEqualTo("Comercial");
        assertThat(resultado.ativo()).isTrue();
        verify(repository).save(any(TipoEndereco.class));
    }

    @Test
    @DisplayName("create: sem informar ativo, usa o padrão true")
    void create_semAtivo_usaPadraoTrue() {
        TipoEnderecoCreateDto dto = new TipoEnderecoCreateDto("Cobrança", null);
        when(repository.existsByNomeNormalizado("Cobrança")).thenReturn(false);
        when(repository.save(any(TipoEndereco.class))).thenAnswer(returnsFirstArg());

        TipoEnderecoResponseDto resultado = service.create(dto);
        assertThat(resultado.ativo()).isTrue();
    }

    @Test
    @DisplayName("create: com nome já existente, lança ConflictException e não salva")
    void create_comNomeExistente_lancaConflict() {
        TipoEnderecoCreateDto dto = new TipoEnderecoCreateDto("Residencial", true);
        when(repository.existsByNomeNormalizado("Residencial")).thenReturn(true);

        assertThatThrownBy(() -> service.create(dto))
                .isInstanceOf(ConflictException.class);

        verify(repository, never()).save(any());
    }

    // update
    @Test
    @DisplayName("update: com dados válidos, atualiza e retorna o DTO")
    void update_comDadosValidos_atualizaERetornaDto() {
        TipoEnderecoUpdateDto dto = new TipoEnderecoUpdateDto("Comercial", false);
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        when(repository.findByNomeNormalizado("Comercial")).thenReturn(Optional.empty());
        when(repository.save(any(TipoEndereco.class))).thenAnswer(returnsFirstArg());

        TipoEnderecoResponseDto resultado = service.update(id, dto);

        assertThat(resultado.nome()).isEqualTo("Comercial");
        assertThat(resultado.ativo()).isFalse();
    }

    @Test
    @DisplayName("update: quando não existe, lança NotFoundException e não salva")
    void update_quandoNaoExiste_lancaNotFound() {
        TipoEnderecoUpdateDto dto = new TipoEnderecoUpdateDto("Comercial", true);
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(NotFoundException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: com nome que já pertence a OUTRO registro, lança ConflictException")
    void update_comNomeDeOutro_lancaConflict() {
        TipoEnderecoUpdateDto dto = new TipoEnderecoUpdateDto("Comercial", true);
        TipoEndereco outro = novoTipo(UUID.randomUUID(), "Comercial", true); // id diferente
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        when(repository.findByNomeNormalizado("Comercial")).thenReturn(Optional.of(outro));

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(ConflictException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: mantendo o mesmo nome do próprio registro, não dá conflito")
    void update_comMesmoNome_permite() {
        TipoEnderecoUpdateDto dto = new TipoEnderecoUpdateDto("Residencial", false);
        when(repository.findById(id)).thenReturn(Optional.of(tipo));
        when(repository.findByNomeNormalizado("Residencial")).thenReturn(Optional.of(tipo)); // é ele mesmo
        when(repository.save(any(TipoEndereco.class))).thenAnswer(returnsFirstArg());

        TipoEnderecoResponseDto resultado = service.update(id, dto);

        assertThat(resultado.nome()).isEqualTo("Residencial");
        assertThat(resultado.ativo()).isFalse();
    }

    // getAll / select
    @Test
    @DisplayName("getAll: retorna uma página de DTOs")
    void getAll_retornaPaginaDeDtos() {
        Pageable pageable = PageRequest.of(0, 15);
        Page<TipoEndereco> pagina = new PageImpl<>(List.of(tipo));
        when(repository.findAllWithFilters(pageable, null)).thenReturn(pagina);

        Page<TipoEnderecoResponseDto> resultado = service.getAll(pageable, null);

        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).nome()).isEqualTo("Residencial");
    }

    @Test
    @DisplayName("select: retorna uma lista de DTOs")
    void select_retornaListaDeDtos() {
        when(repository.findForSelect()).thenReturn(List.of(tipo));

        List<TipoEnderecoResponseDto> resultado = service.select();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).nome()).isEqualTo("Residencial");
    }
}
