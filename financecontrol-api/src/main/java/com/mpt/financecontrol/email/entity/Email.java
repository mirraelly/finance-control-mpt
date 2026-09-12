package com.mpt.financecontrol.email.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tipoemail.entity.TipoEmail;
import jakarta.persistence.*;

@Entity
@Table(name = "email")
public class Email extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_email_id", nullable = false)
    private TipoEmail tipoEmail;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

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

    public TipoEmail getTipoEmail() {
        return tipoEmail;
    }

    public void setTipoEmail(TipoEmail tipoEmail) {
        this.tipoEmail = tipoEmail;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
