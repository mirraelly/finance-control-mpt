package com.mpt.financecontrol.email.respository;

import com.mpt.financecontrol.email.entity.Email;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {

    @Query(value = """
        SELECT * FROM email p
            WHERE p.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(p.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
            countQuery = """
        SELECT count(*) FROM email p
            WHERE p.tenant_id = :tenantId
                AND (CAST(:nome AS text) IS NULL
                    OR unaccent(lower(p.nome)) LIKE unaccent(lower('%' || CAST(:nome AS text) || '%')))
    """,
            nativeQuery = true)
    Page<Email> findAllWithFilters(Pageable pageable, @Param("tenantId") UUID tenantId, @Param("nome") String nome);

    @Query("SELECT p FROM Email p "
            +      "    WHERE p.tenant.id = :tenantId AND p.ativo = true "
            +      "ORDER BY p.nome")
    List<Email> findForSelect(@Param("tenantId") UUID tenantId);

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
