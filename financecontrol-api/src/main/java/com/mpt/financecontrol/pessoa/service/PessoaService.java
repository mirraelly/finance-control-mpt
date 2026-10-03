package com.mpt.financecontrol.pessoa.service;

import com.mpt.financecontrol.email.service.EmailService;
import com.mpt.financecontrol.endereco.service.EnderecoService;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.ConflictException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.pessoa.TipoPessoa;
import com.mpt.financecontrol.pessoa.dtos.PessoaCreateDto;
import com.mpt.financecontrol.pessoa.dtos.PessoaResponseDto;
import com.mpt.financecontrol.pessoa.dtos.PessoaUpdateDto;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.pessoa.mapper.PessoaMapper;
import com.mpt.financecontrol.pessoa.repository.PessoaRepository;
import com.mpt.financecontrol.telefone.service.TelefoneService;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.entity.Usuario;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PessoaService {

    private static final Map<String, String> COLUNAS_ORDENACAO = Map.of(
            "nome",       "nome",
            "tipoPessoa", "tipo_pessoa",
            "cpf",        "cpf",
            "cnpj",       "cnpj",
            "ativo",      "ativo",
            "createdAt",  "created_at",
            "updatedAt",  "updated_at"
    );

    @PersistenceContext
    private EntityManager entityManager;

    private final PessoaRepository pessoaRepository;
    private final UsuarioService   usuarioService;
    private final TelefoneService  telefoneService;
    private final EnderecoService  enderecoService;
    private final EmailService     emailService;

    public PessoaService(
            PessoaRepository pessoaRepository,
            UsuarioService   usuarioService,
            TelefoneService  telefoneService,
            EnderecoService  enderecoService,
            EmailService     emailService
    ) {
        this.pessoaRepository = pessoaRepository;
        this.usuarioService   = usuarioService;
        this.telefoneService  = telefoneService;
        this.enderecoService  = enderecoService;
        this.emailService     = emailService;
    }

    @Transactional(readOnly = true)
    public Pessoa findById(UUID id) {
        Tenant tenant = usuarioService.getTenantLogado();

        Pessoa pessoa = pessoaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pessoa não encontrada"));

        if (!pessoa.getTenant().getId().equals(tenant.getId()))
            throw new NotFoundException("Pessoa não encontrada");

        return pessoa;
    }

    @Transactional(readOnly = true)
    public PessoaResponseDto findByIdResponse(UUID id) {
        return PessoaMapper.toResponseDto(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<PessoaResponseDto> getAll(Pageable pageable, String nome, String documento, TipoPessoa tipoPessoa, Boolean ativo) {
        Tenant tenant = usuarioService.getTenantLogado();
        String nomeFiltro = textoOuNulo(nome);
        return pessoaRepository.findAllWithFilters(
                        ordenacaoNativa(pageable),
                        tenant.getId(),
                        nomeFiltro != null ? escaparLike(nomeFiltro) : null,
                        somenteDigitos(documento),
                        tipoPessoa != null ? tipoPessoa.name() : null,
                        ativo)
                .map(PessoaMapper::toResponseDto);
    }

    @Transactional(readOnly = true)
    public List<PessoaResponseDto> select() {
        Tenant tenant = usuarioService.getTenantLogado();
        return pessoaRepository.findForSelect(tenant.getId())
                .stream()
                .map(PessoaMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public PessoaResponseDto create(PessoaCreateDto dto) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        Tenant tenant   = usuario.getTenant();

        String cpf                = somenteDigitos(dto.cpf());
        String cnpj               = somenteDigitos(dto.cnpj());
        String rg                 = textoOuNulo(dto.rg());
        String cnh                = textoOuNulo(dto.cnh());
        String inscricaoEstadual  = textoOuNulo(dto.inscricaoEstadual());
        String inscricaoMunicipal = textoOuNulo(dto.inscricaoMunicipal());
        String razaoSocial        = textoOuNulo(dto.razaoSocial());

        validarDocumentos(cpf, cnpj);
        validarDuplicidade(tenant.getId(), null, cpf, cnpj, rg, cnh,
                inscricaoEstadual, inscricaoMunicipal, razaoSocial);

        Pessoa pessoa = new Pessoa();
        pessoa.setNome(dto.nome().trim());
        pessoa.setTipoPessoa(dto.tipoPessoa());
        pessoa.setDataNascimento(dto.dataNascimento());
        pessoa.setCpf(cpf);
        pessoa.setRg(rg);
        pessoa.setCnh(cnh);
        pessoa.setCnhCategoria(textoOuNulo(dto.cnhCategoria()));
        pessoa.setCnhValidade(dto.cnhValidade());
        pessoa.setCnpj(cnpj);
        pessoa.setInscricaoEstadual(inscricaoEstadual);
        pessoa.setInscricaoMunicipal(inscricaoMunicipal);
        pessoa.setNomeFantasia(textoOuNulo(dto.nomeFantasia()));
        pessoa.setRazaoSocial(razaoSocial);
        if (dto.ativo() != null)
            pessoa.setAtivo(dto.ativo());
        pessoa.setTenant(tenant);
        pessoa.setCreatedBy(usuario);
        pessoa.setUpdatedBy(usuario);

        pessoaRepository.save(pessoa);
        telefoneService.sincronizarTelefones(pessoa, tenant, dto.telefones());
        enderecoService.sincronizarEnderecos(pessoa, tenant, dto.enderecos());
        emailService.sincronizarEmails(pessoa, tenant, dto.emails());

        entityManager.flush();
        entityManager.refresh(pessoa);
        return PessoaMapper.toResponseDto(pessoa);
    }

    @Transactional
    public PessoaResponseDto update(UUID id, PessoaUpdateDto dto) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        Pessoa pessoa   = findById(id);
        Tenant tenant   = pessoa.getTenant();

        String cpf                = somenteDigitos(dto.cpf());
        String cnpj               = somenteDigitos(dto.cnpj());
        String rg                 = textoOuNulo(dto.rg());
        String cnh                = textoOuNulo(dto.cnh());
        String inscricaoEstadual  = textoOuNulo(dto.inscricaoEstadual());
        String inscricaoMunicipal = textoOuNulo(dto.inscricaoMunicipal());
        String razaoSocial        = textoOuNulo(dto.razaoSocial());

        validarDocumentos(cpf, cnpj);
        validarDuplicidade(tenant.getId(), id, cpf, cnpj, rg, cnh,
                inscricaoEstadual, inscricaoMunicipal, razaoSocial);

        pessoa.setNome(dto.nome().trim());
        pessoa.setTipoPessoa(dto.tipoPessoa());
        pessoa.setDataNascimento(dto.dataNascimento());
        pessoa.setCpf(cpf);
        pessoa.setRg(rg);
        pessoa.setCnh(cnh);
        pessoa.setCnhCategoria(textoOuNulo(dto.cnhCategoria()));
        pessoa.setCnhValidade(dto.cnhValidade());
        pessoa.setCnpj(cnpj);
        pessoa.setInscricaoEstadual(inscricaoEstadual);
        pessoa.setInscricaoMunicipal(inscricaoMunicipal);
        pessoa.setNomeFantasia(textoOuNulo(dto.nomeFantasia()));
        pessoa.setRazaoSocial(razaoSocial);
        if (dto.ativo() != null)
            pessoa.setAtivo(dto.ativo());
        pessoa.setUpdatedBy(usuario);

        pessoaRepository.saveAndFlush(pessoa);
        telefoneService.sincronizarTelefones(pessoa, tenant, dto.telefones());
        enderecoService.sincronizarEnderecos(pessoa, tenant, dto.enderecos());
        emailService.sincronizarEmails(pessoa, tenant, dto.emails());

        entityManager.flush();
        entityManager.refresh(pessoa);
        return PessoaMapper.toResponseDto(pessoa);
    }

    @Transactional
    public void alterarAtivo(UUID id, Boolean ativo) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();
        Pessoa  pessoa  = findById(id);

        pessoa.setAtivo(ativo);
        pessoa.setUpdatedBy(usuario);
        pessoaRepository.save(pessoa);
    }

    private String textoOuNulo(String valor) {
        if (valor == null || valor.isBlank())
            return null;
        return valor.trim();
    }

    private String somenteDigitos(String valor) {
        if (valor == null)
            return null;
        return textoOuNulo(valor.replaceAll("\\D", ""));
    }

    private String escaparLike(String valor) {
        return valor.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }

    private Pageable ordenacaoNativa(Pageable pageable) {
        List<Sort.Order> ordens = pageable.getSort().stream()
                .map(ordem -> {
                    String coluna = COLUNAS_ORDENACAO.get(ordem.getProperty());
                    if (coluna == null)
                        throw new BadRequestException("Campo de ordenação inválido: " + ordem.getProperty());
                    return new Sort.Order(ordem.getDirection(), coluna);
                })
                .toList();

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(ordens));
    }

    private void validarDocumentos(String cpf, String cnpj) {
        if (cpf != null && cpf.length() != 11)
            throw new BadRequestException("CPF deve conter 11 dígitos");

        if (cnpj != null && cnpj.length() != 14)
            throw new BadRequestException("CNPJ deve conter 14 dígitos");
    }

    private void validarDuplicidade(
            UUID tenantId, UUID idAtual, String cpf, String cnpj, String rg, String cnh,
            String inscricaoEstadual, String inscricaoMunicipal, String razaoSocial
    ) {
        if (cpf != null && !cpf.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndCpf(tenantId, cpf)
                : pessoaRepository.existsByTenantIdAndCpfAndIdNot(tenantId, cpf, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com este CPF");

        if (cnpj != null && !cnpj.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndCnpj(tenantId, cnpj)
                : pessoaRepository.existsByTenantIdAndCnpjAndIdNot(tenantId, cnpj, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com este CNPJ");

        if (rg != null && !rg.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndRg(tenantId, rg)
                : pessoaRepository.existsByTenantIdAndRgAndIdNot(tenantId, rg, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com este RG");

        if (cnh != null && !cnh.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndCnh(tenantId, cnh)
                : pessoaRepository.existsByTenantIdAndCnhAndIdNot(tenantId, cnh, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com esta CNH");

        if (inscricaoEstadual != null && !inscricaoEstadual.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndInscricaoEstadual(tenantId, inscricaoEstadual)
                : pessoaRepository.existsByTenantIdAndInscricaoEstadualAndIdNot(tenantId, inscricaoEstadual, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com esta inscrição estadual");

        if (inscricaoMunicipal != null && !inscricaoMunicipal.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndInscricaoMunicipal(tenantId, inscricaoMunicipal)
                : pessoaRepository.existsByTenantIdAndInscricaoMunicipalAndIdNot(tenantId, inscricaoMunicipal, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com esta inscrição municipal");

        if (razaoSocial != null && !razaoSocial.isBlank() && (idAtual == null
                ? pessoaRepository.existsByTenantIdAndRazaoSocial(tenantId, razaoSocial)
                : pessoaRepository.existsByTenantIdAndRazaoSocialAndIdNot(tenantId, razaoSocial, idAtual)))
            throw new ConflictException("Já existe uma pessoa cadastrada com esta razão social");
    }
}