package com.mpt.financecontrol.formapagamento.repository;

import com.mpt.financecontrol.formapagamento.entity.FormaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FormaPagamentoRepository extends JpaRepository<FormaPagamento, UUID> {
}
