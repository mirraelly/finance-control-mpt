package com.mpt.financecontrol.pagamento.repository;

import com.mpt.financecontrol.pagamento.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, UUID> {

    @Query("SELECT p.contaPagarParcela.contaPagar.id FROM Pagamento p WHERE p.id = :id AND p.tenant.id = :tenantId")
    Optional<UUID> findContaPagarIdById(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
