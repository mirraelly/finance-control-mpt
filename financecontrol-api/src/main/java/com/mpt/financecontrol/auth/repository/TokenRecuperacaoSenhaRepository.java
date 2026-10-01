package com.mpt.financecontrol.auth.repository;

import com.mpt.financecontrol.auth.entity.TokenRecuperacaoSenha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRecuperacaoSenhaRepository extends JpaRepository<TokenRecuperacaoSenha, UUID> {

    Optional<TokenRecuperacaoSenha> findByToken(String token);
}
