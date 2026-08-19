package com.mpt.financecontrol.telefone.repository;

import com.mpt.financecontrol.telefone.entity.Telefone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TelefoneRepository extends JpaRepository<Telefone, UUID> {

    List<Telefone> findByPessoaId(UUID pessoaId);
}
