package com.mpt.financecontrol.email.service;

import com.mpt.financecontrol.endereco.service.EnderecoService;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.exceptions.UnauthorizedException;
import com.mpt.financecontrol.email.dtos.EmailCreateDto;
import com.mpt.financecontrol.email.dtos.EmailResponseDto;
import com.mpt.financecontrol.email.dtos.EmailUpdateDto;
import com.mpt.financecontrol.email.entity.Email;
import com.mpt.financecontrol.email.mapper.EmailMapper;
import com.mpt.financecontrol.email.repository.EmailRepository;
import com.mpt.financecontrol.telefone.service.TelefoneService;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EmailService {

    private final EmailRepository  emailRepository;
    private final UsuarioRepository usuarioRepository;
    private final TelefoneService   telefoneService;
    private final EnderecoService   enderecoService;

    public EmailService(
            EmailRepository    emailRepository,
            UsuarioRepository   usuarioRepository,
            TelefoneService     telefoneService,
            EnderecoService     enderecoService
    ) {
        this.emailRepository   = emailRepository;
        this.usuarioRepository  = usuarioRepository;
        this.telefoneService    = telefoneService;
        this.enderecoService    = enderecoService;
    }

    @Transactional(readOnly = true)
    public Email findById(UUID id) {
        Tenant tenant = getTenantLogado();

        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Email não encontrada"));

        if (!email.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Email não encontrada");

        return email;
    }

    @Transactional(readOnly = true)
    public EmailResponseDto findByIdResponse(UUID id) {
        return EmailMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<EmailResponseDto> getAll(Pageable pageable, String nome) {
        Tenant tenant = getTenantLogado();
        return emailRepository.findAllWithFilters(pageable, tenant.getId(), nome)
                .map(EmailMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<EmailResponseDto> select() {
        Tenant tenant = getTenantLogado();
        return emailRepository.findForSelect(tenant.getId())
                .stream()
                .map(EmailMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public EmailResponseDto create(EmailCreateDto dto) {
        Usuario usuario = getUsuarioLogado();
        Tenant tenant   = usuario.getTenant();

        validarDuplicidade(tenant.getId(), null, dto.cpf(), dto.cnpj(), dto.rg(), dto.cnh(),
                dto.inscricaoEstadual(), dto.inscricaoMunicipal(), dto.razaoSocial());

        Email email = new Email();
        email.setNome(dto.nome());
        email.setTipoEmail(dto.tipoEmail());
        email.setDataNascimento(dto.dataNascimento());
        email.setCpf(dto.cpf());
        email.setRg(dto.rg());
        email.setCnh(dto.cnh());
        email.setCnhCategoria(dto.cnhCategoria());
        email.setCnhValidade(dto.cnhValidade());
        email.setCnpj(dto.cnpj());
        email.setInscricaoEstadual(dto.inscricaoEstadual());
        email.setInscricaoMunicipal(dto.inscricaoMunicipal());
        email.setNomeFantasia(dto.nomeFantasia());
        email.setRazaoSocial(dto.razaoSocial());
        if (dto.ativo() != null)
            email.setAtivo(dto.ativo());
        email.setTenant(tenant);
        email.setCreatedBy(usuario);
        email.setUpdatedBy(usuario);

        emailRepository.save(email);
        telefoneService.sincronizarTelefones(email, tenant, dto.telefones());
        enderecoService.sincronizarEnderecos(email, tenant, dto.enderecos());

        return EmailMapper.toResponseDto(email);
    }

    @Transactional
    public EmailResponseDto update(UUID id, EmailUpdateDto dto) {
        Usuario usuario = getUsuarioLogado();
        Email email   = findById(id);
        Tenant tenant   = email.getTenant();

        validarDuplicidade(tenant.getId(), id, dto.cpf(), dto.cnpj(), dto.rg(), dto.cnh(),
                dto.inscricaoEstadual(), dto.inscricaoMunicipal(), dto.razaoSocial());

        email.setNome(dto.nome());
        email.setTipoEmail(dto.tipoEmail());
        email.setDataNascimento(dto.dataNascimento());
        email.setCpf(dto.cpf());
        email.setRg(dto.rg());
        email.setCnh(dto.cnh());
        email.setCnhCategoria(dto.cnhCategoria());
        email.setCnhValidade(dto.cnhValidade());
        email.setCnpj(dto.cnpj());
        email.setInscricaoEstadual(dto.inscricaoEstadual());
        email.setInscricaoMunicipal(dto.inscricaoMunicipal());
        email.setNomeFantasia(dto.nomeFantasia());
        email.setRazaoSocial(dto.razaoSocial());
        if (dto.ativo() != null)
            email.setAtivo(dto.ativo());
        email.setUpdatedBy(usuario);

        emailRepository.saveAndFlush(email);
        telefoneService.sincronizarTelefones(email, tenant, dto.telefones());
        enderecoService.sincronizarEnderecos(email, tenant, dto.enderecos());

        return EmailMapper.toResponseDto(email);
    }

    private void validarDuplicidade(
            UUID tenantId, UUID idAtual, String cpf, String cnpj, String rg, String cnh,
            String inscricaoEstadual, String inscricaoMunicipal, String razaoSocial
    ) {
        if (cpf != null && !cpf.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndCpf(tenantId, cpf)
                : emailRepository.existsByTenantIdAndCpfAndIdNot(tenantId, cpf, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com este CPF");

        if (cnpj != null && !cnpj.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndCnpj(tenantId, cnpj)
                : emailRepository.existsByTenantIdAndCnpjAndIdNot(tenantId, cnpj, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com este CNPJ");

        if (rg != null && !rg.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndRg(tenantId, rg)
                : emailRepository.existsByTenantIdAndRgAndIdNot(tenantId, rg, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com este RG");

        if (cnh != null && !cnh.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndCnh(tenantId, cnh)
                : emailRepository.existsByTenantIdAndCnhAndIdNot(tenantId, cnh, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com esta CNH");

        if (inscricaoEstadual != null && !inscricaoEstadual.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndInscricaoEstadual(tenantId, inscricaoEstadual)
                : emailRepository.existsByTenantIdAndInscricaoEstadualAndIdNot(tenantId, inscricaoEstadual, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com esta inscrição estadual");

        if (inscricaoMunicipal != null && !inscricaoMunicipal.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndInscricaoMunicipal(tenantId, inscricaoMunicipal)
                : emailRepository.existsByTenantIdAndInscricaoMunicipalAndIdNot(tenantId, inscricaoMunicipal, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com esta inscrição municipal");

        if (razaoSocial != null && !razaoSocial.isBlank() && (idAtual == null
                ? emailRepository.existsByTenantIdAndRazaoSocial(tenantId, razaoSocial)
                : emailRepository.existsByTenantIdAndRazaoSocialAndIdNot(tenantId, razaoSocial, idAtual)))
            throw new ConflictException("Já existe uma email cadastrada com esta razão social");
    }

    private Usuario getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID id))
            throw new UnauthorizedException("Usuário não autenticado, verifique!");

        return usuarioRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("Usuário não autenticado, verifique!"));
    }

    private Tenant getTenantLogado() {
        return getUsuarioLogado().getTenant();
    }
}
