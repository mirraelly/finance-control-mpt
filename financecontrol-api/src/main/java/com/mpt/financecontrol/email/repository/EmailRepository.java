package com.mpt.financecontrol.email.repository;

import com.mpt.financecontrol.email.entity.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {

    List<Email> findByPessoaId(UUID pessoaId);
}
