package com.mpt.financecontrol.contareceberparcela.repository;

import com.mpt.financecontrol.contareceberparcela.entity.ContaReceberParcela;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContaReceberParcelaRepository extends JpaRepository<ContaReceberParcela, UUID> {

    @Query("SELECT p.contaReceber.id FROM ContaReceberParcela p WHERE p.id = :id")
    Optional<UUID> findContaReceberIdById(@Param("id") UUID id);
}
