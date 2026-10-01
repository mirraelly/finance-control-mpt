package com.mpt.financecontrol.usuario.service;

import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.tenant.dtos.TenantSaveDto;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tenant.service.TenantService;
import com.mpt.financecontrol.usuario.dtos.UsuarioAlterarSenhaDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioCreateDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioUpdateDto;
import com.mpt.financecontrol.usuario.entity.Role;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TenantService tenantService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        UUID id = UUID.randomUUID();
        usuario = new Usuario();
        usuario.setNome("Eduardo");
        usuario.setEmail("eduardo@example.com");
        usuario.setSenha("hashAtual");
        usuario.setRole(Role.USER);
        ReflectionTestUtils.setField(usuario, "id", id);

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(id, null, List.of()));
        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("alterarSenha: com senha atual incorreta, lança BadRequestException e não salva")
    void alterarSenha_comSenhaAtualIncorreta_lancaBadRequest() {
        when(passwordEncoder.matches("SenhaErrada@1", "hashAtual")).thenReturn(false);

        assertThatThrownBy(() -> service.alterarSenha(new UsuarioAlterarSenhaDto("SenhaErrada@1", "NovaSenha@123")))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("A senha atual informada está incorreta, verifique!");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("alterarSenha: com nova senha igual à atual, lança BadRequestException e não salva")
    void alterarSenha_comNovaSenhaIgualAtual_lancaBadRequest() {
        when(passwordEncoder.matches("SenhaAtual@1", "hashAtual")).thenReturn(true);

        assertThatThrownBy(() -> service.alterarSenha(new UsuarioAlterarSenhaDto("SenhaAtual@1", "SenhaAtual@1")))
                .isInstanceOf(BadRequestException.class);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("alterarSenha: com dados válidos, grava o novo hash da senha")
    void alterarSenha_comDadosValidos_gravaNovoHash() {
        when(passwordEncoder.matches("SenhaAtual@1", "hashAtual")).thenReturn(true);
        when(passwordEncoder.matches("NovaSenha@123", "hashAtual")).thenReturn(false);
        when(passwordEncoder.encode("NovaSenha@123")).thenReturn("hashNovo");

        service.alterarSenha(new UsuarioAlterarSenhaDto("SenhaAtual@1", "NovaSenha@123"));

        assertThat(usuario.getSenha()).isEqualTo("hashNovo");
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("alterarAtivo: no próprio usuário, lança BadRequestException e não salva")
    void alterarAtivo_noProprioUsuario_lancaBadRequest() {
        assertThatThrownBy(() -> service.alterarAtivo(usuario.getId(), false))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Você não pode desativar o seu próprio usuário, verifique!");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("alterarAtivo: em outro usuário, grava a nova situação")
    void alterarAtivo_emOutroUsuario_gravaSituacao() {
        Usuario outro = novoUsuario("Outro", "outro@example.com", Role.USER, novoTenant());
        when(usuarioRepository.findById(outro.getId())).thenReturn(Optional.of(outro));

        service.alterarAtivo(outro.getId(), false);

        assertThat(outro.getAtivo()).isFalse();
        verify(usuarioRepository).save(outro);
    }

    @Test
    @DisplayName("create: feito pelo SUPERADMIN, cria um tenant novo e usa a role informada")
    void create_peloSuperadmin_criaTenantNovo() {
        usuario.setRole(Role.SUPERADMIN);
        usuario.setTenant(novoTenant());
        Tenant tenantNovo = novoTenant();
        UsuarioCreateDto dto = new UsuarioCreateDto("Maria", "maria@example.com", "Senha@123", null, null, Role.USER);
        when(usuarioRepository.findByEmail("maria@example.com")).thenReturn(Optional.empty());
        when(tenantService.create(any(TenantSaveDto.class))).thenReturn(tenantNovo);
        when(passwordEncoder.encode("Senha@123")).thenReturn("hashMaria");

        UsuarioResponseDto resultado = service.create(dto);

        assertThat(resultado.tenantId()).isEqualTo(tenantNovo.getId());
        assertThat(resultado.tenantId()).isNotEqualTo(usuario.getTenant().getId());
        assertThat(resultado.role()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("update: feito pelo SUPERADMIN, altera usuário de outro tenant")
    void update_peloSuperadmin_alteraUsuarioDeOutroTenant() {
        usuario.setRole(Role.SUPERADMIN);
        usuario.setTenant(novoTenant());
        Usuario outro = novoUsuario("Outro", "outro@example.com", Role.USER, novoTenant());
        when(usuarioRepository.findById(outro.getId())).thenReturn(Optional.of(outro));

        UsuarioResponseDto resultado = service.update(outro.getId(),
                new UsuarioUpdateDto("Outro Nome", "51999999999", "55", true, Role.USER));

        assertThat(resultado.nome()).isEqualTo("Outro Nome");
        verify(usuarioRepository).saveAndFlush(outro);
    }

    @Test
    @DisplayName("update: SUPERADMIN não pode remover o próprio acesso de super administrador")
    void update_superadminRemovendoPropriaRole_lancaBadRequest() {
        usuario.setRole(Role.SUPERADMIN);
        usuario.setTenant(novoTenant());

        assertThatThrownBy(() -> service.update(usuario.getId(),
                new UsuarioUpdateDto("Eduardo", null, "55", true, Role.USER)))
                .isInstanceOf(BadRequestException.class);

        verify(usuarioRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("update: sem telefone no corpo, mantém o telefone atual")
    void update_semTelefone_mantemTelefoneAtual() {
        usuario.setTenant(novoTenant());
        usuario.setTelefone("(51)99999-8888");

        service.update(usuario.getId(), new UsuarioUpdateDto("Eduardo", null, "55", null, null));

        assertThat(usuario.getTelefone()).isEqualTo("(51)99999-8888");
    }

    @Test
    @DisplayName("update: com telefone vazio, limpa o telefone")
    void update_comTelefoneVazio_limpaTelefone() {
        usuario.setTenant(novoTenant());
        usuario.setTelefone("(51)99999-8888");

        service.update(usuario.getId(), new UsuarioUpdateDto("Eduardo", "", "55", null, null));

        assertThat(usuario.getTelefone()).isEmpty();
    }

    private Tenant novoTenant() {
        Tenant tenant = new Tenant();
        ReflectionTestUtils.setField(tenant, "id", UUID.randomUUID());
        return tenant;
    }

    private Usuario novoUsuario(String nome, String email, Role role, Tenant tenant) {
        Usuario novo = new Usuario();
        novo.setNome(nome);
        novo.setEmail(email);
        novo.setRole(role);
        novo.setTenant(tenant);
        ReflectionTestUtils.setField(novo, "id", UUID.randomUUID());
        return novo;
    }
}
