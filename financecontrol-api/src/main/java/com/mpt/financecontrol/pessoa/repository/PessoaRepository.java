package com.mpt.financecontrol.pessoa.repository;

import com.mpt.financecontrol.pessoa.entity.Pessoa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, UUID> {

    @Query(value = """
        SELECT * FROM pessoa p
            WHERE p.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(p.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:documento AS text) IS NULL
                    OR p.cpf  LIKE '%' || CAST(:documento AS text) || '%'
                    OR p.cnpj LIKE '%' || CAST(:documento AS text) || '%')
                AND (CAST(:tipoPessoa AS text) IS NULL OR p.tipo_pessoa = CAST(:tipoPessoa AS text))
                AND (CAST(:ativo AS boolean) IS NULL OR p.ativo = CAST(:ativo AS boolean))
    """,
    countQuery = """
        SELECT count(*) FROM pessoa p
            WHERE p.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(p.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
                AND (CAST(:documento AS text) IS NULL
                    OR p.cpf  LIKE '%' || CAST(:documento AS text) || '%'
                    OR p.cnpj LIKE '%' || CAST(:documento AS text) || '%')
                AND (CAST(:tipoPessoa AS text) IS NULL OR p.tipo_pessoa = CAST(:tipoPessoa AS text))
                AND (CAST(:ativo AS boolean) IS NULL OR p.ativo = CAST(:ativo AS boolean))
    """,
    nativeQuery = true)
    Page<Pessoa> findAllWithFilters(
            Pageable pageable,
            @Param("tenantId")   UUID    tenantId,
            @Param("nome")       String  nome,
            @Param("documento")  String  documento,
            @Param("tipoPessoa") String  tipoPessoa,
            @Param("ativo")      Boolean ativo
    );

    @Query("SELECT p FROM Pessoa p "
    +      "    WHERE p.tenant.id = :tenantId AND p.ativo = true "
    +      "ORDER BY p.nome")
    List<Pessoa> findForSelect(@Param("tenantId") UUID tenantId);

    boolean existsByTenantIdAndCpf(UUID tenantId, String cpf);

    boolean existsByTenantIdAndCpfAndIdNot(UUID tenantId, String cpf, UUID id);

    boolean existsByTenantIdAndCnpj(UUID tenantId, String cnpj);

    boolean existsByTenantIdAndCnpjAndIdNot(UUID tenantId, String cnpj, UUID id);

    boolean existsByTenantIdAndRg(UUID tenantId, String rg);

    boolean existsByTenantIdAndRgAndIdNot(UUID tenantId, String rg, UUID id);

    boolean existsByTenantIdAndCnh(UUID tenantId, String cnh);

    boolean existsByTenantIdAndCnhAndIdNot(UUID tenantId, String cnh, UUID id);

    boolean existsByTenantIdAndInscricaoEstadual(UUID tenantId, String inscricaoEstadual);

    boolean existsByTenantIdAndInscricaoEstadualAndIdNot(UUID tenantId, String inscricaoEstadual, UUID id);

    boolean existsByTenantIdAndInscricaoMunicipal(UUID tenantId, String inscricaoMunicipal);

    boolean existsByTenantIdAndInscricaoMunicipalAndIdNot(UUID tenantId, String inscricaoMunicipal, UUID id);

    boolean existsByTenantIdAndRazaoSocial(UUID tenantId, String razaoSocial);

    boolean existsByTenantIdAndRazaoSocialAndIdNot(UUID tenantId, String razaoSocial, UUID id);
}