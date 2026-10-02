package com.mpt.financecontrol.auth.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import com.mpt.financecontrol.usuario.entity.Usuario;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "token_recuperacao_senha")
public class TokenRecuperacaoSenha extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token", nullable = false, length = 100)
    private String token;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @Column(name = "utilizado", nullable = false)
    private Boolean utilizado = false;

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Instant getExpiraEm() {
        return expiraEm;
    }

    public void setExpiraEm(Instant expiraEm) {
        this.expiraEm = expiraEm;
    }

    public Boolean getUtilizado() {
        return utilizado;
    }

    public void setUtilizado(Boolean utilizado) {
        this.utilizado = utilizado;
    }
}
