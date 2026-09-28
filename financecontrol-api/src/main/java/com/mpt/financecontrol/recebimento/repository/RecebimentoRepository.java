package com.mpt.financecontrol.recebimento.repository;

import com.mpt.financecontrol.recebimento.entity.Recebimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecebimentoRepository extends JpaRepository<Recebimento, UUID> {

    @Query("SELECT r.contaReceberParcela.contaReceber.id FROM Recebimento r WHERE r.id = :id")
    Optional<UUID> findContaReceberIdById(@Param("id") UUID id);
}
