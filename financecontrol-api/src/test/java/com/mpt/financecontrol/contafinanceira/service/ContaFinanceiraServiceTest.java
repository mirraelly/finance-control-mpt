package com.mpt.financecontrol.contafinanceira.service;

import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraCreateDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraResponseDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraUpdateDto;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.repository.ContaFinanceiraRepository;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
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
class ContaFinanceiraServiceTest {

    @Mock
    private ContaFinanceiraRepository repository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private ContaFinanceiraService service;

    private UUID tenantId;
    private UUID id;
    private Tenant tenant;
    private ContaFinanceira conta;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        id = UUID.randomUUID();
        tenant = novoTenant(tenantId);
        conta = novaConta(id, "Banco do Brasil", true, tenant);
        when(usuarioService.getTenantLogado()).thenReturn(tenant);
    }

    private Tenant novoTenant(UUID tenantId) {
        Tenant t = new Tenant();
        ReflectionTestUtils.setField(t, "id", tenantId);
        return t;
    }

    private ContaFinanceira novaConta(UUID id, String nome, boolean ativo, Tenant tenant) {
        ContaFinanceira c = new ContaFinanceira();
        c.setNome(nome);
        c.setAtivo(ativo);
        c.setTenant(tenant);
        ReflectionTestUtils.setField(c, "id", id);
        return c;
    }

    @Test
    @DisplayName("findById: quando existe e pertence ao tenant, retorna a entidade")
    void findById_quandoExiste_retornaEntidade() {
        when(repository.findById(id)).thenReturn(Optional.of(conta));

        ContaFinanceira resultado = service.findById(id);

        assertThat(resultado).isSameAs(conta);
    }

    @Test
    @DisplayName("findById: quando não existe, lança NotFoundException")
    void findById_quandoNaoExiste_lancaNotFound() {
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Conta financeira não encontrada");
    }

    @Test
    @DisplayName("findById: quando pertence a outro tenant, lança NotFoundException")
    void findById_quandoPertenceOutroTenant_lancaNotFound() {
        Tenant outroTenant = novoTenant(UUID.randomUUID());
        conta.setTenant(outroTenant);
        when(repository.findById(id)).thenReturn(Optional.of(conta));

        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Conta financeira não encontrada");
    }

    @Test
    @DisplayName("findByIdResponse: quando existe, retorna o DTO mapeado")
    void findByIdResponse_quandoExiste_retornaDto() {
        when(repository.findById(id)).thenReturn(Optional.of(conta));

        ContaFinanceiraResponseDto resultado = service.findByIdResponse(id);

        assertThat(resultado.id()).isEqualTo(id);
        assertThat(resultado.nome()).isEqualTo("Banco do Brasil");
        assertThat(resultado.ativo()).isTrue();
    }

    @Test
    @DisplayName("create: com nome novo, salva e retorna o DTO")
    void create_comNomeNovo_salvaERetornaDto() {
        ContaFinanceiraCreateDto dto = new ContaFinanceiraCreateDto("Caixa Econômica", true);
        when(repository.existsByTenantIdAndNomeNormalizado(tenantId, "Caixa Econômica")).thenReturn(false);
        when(repository.save(any(ContaFinanceira.class))).thenAnswer(returnsFirstArg());

        ContaFinanceiraResponseDto resultado = service.create(dto);

        assertThat(resultado.nome()).isEqualTo("Caixa Econômica");
        assertThat(resultado.ativo()).isTrue();
        verify(repository).save(any(ContaFinanceira.class));
    }

    @Test
    @DisplayName("create: sem informar ativo, usa o padrão true")
    void create_semAtivo_usaPadraoTrue() {
        ContaFinanceiraCreateDto dto = new ContaFinanceiraCreateDto("Santander", null);
        when(repository.existsByTenantIdAndNomeNormalizado(tenantId, "Santander")).thenReturn(false);
        when(repository.save(any(ContaFinanceira.class))).thenAnswer(returnsFirstArg());

        ContaFinanceiraResponseDto resultado = service.create(dto);

        assertThat(resultado.ativo()).isTrue();
    }

    @Test
    @DisplayName("create: com nome já existente no tenant, lança ConflictException e não salva")
    void create_comNomeExistente_lancaConflict() {
        ContaFinanceiraCreateDto dto = new ContaFinanceiraCreateDto("Banco do Brasil", true);
        when(repository.existsByTenantIdAndNomeNormalizado(tenantId, "Banco do Brasil")).thenReturn(true);

        assertThatThrownBy(() -> service.create(dto))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Já existe uma conta financeira com esse nome");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: com dados válidos, atualiza e retorna o DTO")
    void update_comDadosValidos_atualizaERetornaDto() {
        ContaFinanceiraUpdateDto dto = new ContaFinanceiraUpdateDto("Caixa Econômica", false);
        when(repository.findById(id)).thenReturn(Optional.of(conta));
        when(repository.findByTenantIdAndNomeNormalizado(tenantId, "Caixa Econômica")).thenReturn(Optional.empty());
        when(repository.save(any(ContaFinanceira.class))).thenAnswer(returnsFirstArg());

        ContaFinanceiraResponseDto resultado = service.update(id, dto);

        assertThat(resultado.nome()).isEqualTo("Caixa Econômica");
        assertThat(resultado.ativo()).isFalse();
    }

    @Test
    @DisplayName("update: quando não existe, lança NotFoundException e não salva")
    void update_quandoNaoExiste_lancaNotFound() {
        ContaFinanceiraUpdateDto dto = new ContaFinanceiraUpdateDto("Caixa Econômica", true);
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Conta financeira não encontrada");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: com nome que já pertence a OUTRO registro do tenant, lança ConflictException")
    void update_comNomeDeOutro_lancaConflict() {
        ContaFinanceiraUpdateDto dto = new ContaFinanceiraUpdateDto("Caixa Econômica", true);
        ContaFinanceira outra = novaConta(UUID.randomUUID(), "Caixa Econômica", true, tenant);
        when(repository.findById(id)).thenReturn(Optional.of(conta));
        when(repository.findByTenantIdAndNomeNormalizado(tenantId, "Caixa Econômica")).thenReturn(Optional.of(outra));

        assertThatThrownBy(() -> service.update(id, dto))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Já existe outra conta financeira com esse nome");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update: mantendo o mesmo nome do próprio registro, não dá conflito")
    void update_comMesmoNome_permite() {
        ContaFinanceiraUpdateDto dto = new ContaFinanceiraUpdateDto("Banco do Brasil", false);
        when(repository.findById(id)).thenReturn(Optional.of(conta));
        when(repository.findByTenantIdAndNomeNormalizado(tenantId, "Banco do Brasil")).thenReturn(Optional.of(conta));
        when(repository.save(any(ContaFinanceira.class))).thenAnswer(returnsFirstArg());

        ContaFinanceiraResponseDto resultado = service.update(id, dto);

        assertThat(resultado.nome()).isEqualTo("Banco do Brasil");
        assertThat(resultado.ativo()).isFalse();
    }

    @Test
    @DisplayName("getAll: retorna uma página de DTOs")
    void getAll_retornaPaginaDeDtos() {
        Pageable pageable = PageRequest.of(0, 15);
        Page<ContaFinanceira> pagina = new PageImpl<>(List.of(conta));
        when(repository.findAllWithFilters(pageable, tenantId, null)).thenReturn(pagina);

        Page<ContaFinanceiraResponseDto> resultado = service.getAll(pageable, null);

        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).nome()).isEqualTo("Banco do Brasil");
    }

    @Test
    @DisplayName("select: retorna uma lista de DTOs")
    void select_retornaListaDeDtos() {
        when(repository.findForSelect(tenantId)).thenReturn(List.of(conta));

        List<ContaFinanceiraResponseDto> resultado = service.select();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).nome()).isEqualTo("Banco do Brasil");
    }
}
