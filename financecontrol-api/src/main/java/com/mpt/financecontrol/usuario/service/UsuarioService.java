package com.mpt.financecontrol.usuario.service;

import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.exceptions.UnauthorizedException;
import com.mpt.financecontrol.tenant.dtos.TenantSaveDto;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tenant.service.TenantService;
import com.mpt.financecontrol.usuario.dtos.UsuarioResponseDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioCreateDto;
import com.mpt.financecontrol.usuario.dtos.UsuarioUpdateDto;
import com.mpt.financecontrol.usuario.entity.Role;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.mapper.UsuarioMapper;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final TenantService     tenantService;
    private final PasswordEncoder   passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            TenantService     tenantService,
            PasswordEncoder   passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tenantService     = tenantService;
        this.passwordEncoder   = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Usuario findById(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado, verifique!"));
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDto findByIdResponse(UUID id) {
        Usuario usuario =  this.findById(id);
        return UsuarioMapper.toResponseDto(usuario);
    }

    @Transactional
    public UsuarioResponseDto create(UsuarioCreateDto dto) {
        if (dto.nome() == null || dto.nome().isBlank())
            throw new BadRequestException("O nome do usuário é obrigatório, verifique!");
        if (dto.email() == null || dto.email().isBlank())
            throw new BadRequestException("O e-mail do usuário é obrigatório, verifique!");
        if (dto.senha() == null || dto.senha().isBlank())
            throw new BadRequestException("A senha do usuário é obrigatória, verifique!");

        usuarioRepository.findByEmail(dto.email()).ifPresent(u -> {
            throw new ConflictException("Já existe um usuário cadastrado com este e-mail, verifique!");
        });

        Usuario actingUser = getUsuarioLogado();

        Tenant tenant;
        Role role;
        if (actingUser != null) {
            tenant = actingUser.getTenant();
            role   = actingUser.getRole() == Role.SUPERADMIN && dto.role() != null ? dto.role() : Role.USER;
        } else {
            tenant = tenantService.create(new TenantSaveDto(dto.nome()));
            role = Role.USER;
        }

        Usuario usuario = new Usuario();
        usuario.setTenant(tenant);
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setTelefone(dto.telefone());
        usuario.setCodigoPais(dto.codigoPais() == null || dto.codigoPais().isBlank() ? "55" : dto.codigoPais());
        usuario.setRole(role);
        usuario.setCreatedBy(actingUser);
        usuario.setUpdatedBy(actingUser);

        usuarioRepository.save(usuario);
        return UsuarioMapper.toResponseDto(usuario);
    }

    @Transactional
    public UsuarioResponseDto update(UUID id, UsuarioUpdateDto dto) {
        Usuario actingUser = getUsuarioLogado();
        if (actingUser == null)
            throw new UnauthorizedException("Usuário não autenticado, verifique!");

        Usuario usuario = findById(id);

        boolean isSuperadmin = actingUser.getRole() == Role.SUPERADMIN;
        boolean isSelf       = usuario.getId().equals(actingUser.getId());

        if (!usuario.getTenant().getId().equals(actingUser.getTenant().getId()))
            throw new NotFoundException("Usuário não encontrado, verifique!");
        if (!isSuperadmin && !isSelf)
            throw new NotFoundException("Usuário não encontrado, verifique!");
        if (dto.nome() == null || dto.nome().isBlank())
            throw new BadRequestException("O nome do usuário é obrigatório, verifique!");

        usuario.setNome(dto.nome());
        usuario.setTelefone(dto.telefone());
        if (dto.codigoPais() != null && !dto.codigoPais().isBlank())
            usuario.setCodigoPais(dto.codigoPais());

        // Somente SUPERADMIN altera campos administrativos (ativo/role).
        // Um não-SUPERADMIN edita apenas o próprio perfil e não pode mudar a role
        if (isSuperadmin) {
            if (dto.ativo() != null)
                usuario.setAtivo(dto.ativo());
            if (dto.role() != null)
                usuario.setRole(dto.role());
        }

        usuario.setUpdatedBy(actingUser);
        usuarioRepository.saveAndFlush(usuario);

        return UsuarioMapper.toResponseDto(usuario);
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponseDto> getAll(Pageable pageable, UUID tenantId, String nome, String email) {
        return usuarioRepository.findAllWithFilters(pageable, tenantId, nome, email)
                .map(UsuarioMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> select(String nome) {
        return usuarioRepository.findForSelect(nome)
                .stream()
                .map(UsuarioMapper::toResponseDto)
                .toList();
    }

    private Usuario getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID id))
            return null;

        return usuarioRepository.findById(id).orElse(null);
    }
}
