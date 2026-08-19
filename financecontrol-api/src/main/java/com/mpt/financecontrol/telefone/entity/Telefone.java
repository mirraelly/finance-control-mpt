package com.mpt.financecontrol.telefone.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tipotelefone.entity.TipoTelefone;
import jakarta.persistence.*;

@Entity
@Table(name = "telefone")
public class Telefone extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_telefone_id", nullable = false)
    private TipoTelefone tipoTelefone;

    @Column(name = "numero", nullable = false, length = 20)
    private String numero;

    @Column(name = "observacao", length = 255)
    private String observacao;

    @Column(name = "principal")
    private Boolean principal = false;

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public Pessoa getPessoa() {
        return pessoa;
    }

    public void setPessoa(Pessoa pessoa) {
        this.pessoa = pessoa;
    }

    public TipoTelefone getTipoTelefone() {
        return tipoTelefone;
    }

    public void setTipoTelefone(TipoTelefone tipoTelefone) {
        this.tipoTelefone = tipoTelefone;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Boolean getPrincipal() {
        return principal;
    }

    public void setPrincipal(Boolean principal) {
        this.principal = principal;
    }
}
