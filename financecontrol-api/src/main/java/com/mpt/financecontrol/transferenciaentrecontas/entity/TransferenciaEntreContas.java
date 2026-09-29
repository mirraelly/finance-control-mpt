package com.mpt.financecontrol.transferenciaentrecontas.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.lancamentofinanceiro.entity.LancamentoFinanceiro;
import com.mpt.financecontrol.tenant.entity.Tenant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transferencia_entre_contas")
public class TransferenciaEntreContas extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_origem_id", nullable = false)
    private ContaFinanceira contaOrigem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_destino_id", nullable = false)
    private ContaFinanceira contaDestino;

    @Column(name = "valor", nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_saida_id", nullable = false)
    private LancamentoFinanceiro lancamentoSaida;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lancamento_entrada_id", nullable = false)
    private LancamentoFinanceiro lancamentoEntrada;

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public ContaFinanceira getContaOrigem() {
        return contaOrigem;
    }

    public void setContaOrigem(ContaFinanceira contaOrigem) {
        this.contaOrigem = contaOrigem;
    }

    public ContaFinanceira getContaDestino() {
        return contaDestino;
    }

    public void setContaDestino(ContaFinanceira contaDestino) {
        this.contaDestino = contaDestino;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LancamentoFinanceiro getLancamentoSaida() {
        return lancamentoSaida;
    }

    public void setLancamentoSaida(LancamentoFinanceiro lancamentoSaida) {
        this.lancamentoSaida = lancamentoSaida;
    }

    public LancamentoFinanceiro getLancamentoEntrada() {
        return lancamentoEntrada;
    }

    public void setLancamentoEntrada(LancamentoFinanceiro lancamentoEntrada) {
        this.lancamentoEntrada = lancamentoEntrada;
    }
}
