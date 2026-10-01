package com.mpt.financecontrol.loginlog.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import com.mpt.financecontrol.usuario.entity.Usuario;
import jakarta.persistence.*;

@Entity
@Table(name = "login_log")
public class LoginLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "sucesso", nullable = false)
    private Boolean sucesso;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_falha", length = 30)
    private MotivoFalhaLogin motivoFalha;

    @Column(name = "endereco_ip", length = 45)
    private String enderecoIp;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getSucesso() {
        return sucesso;
    }

    public void setSucesso(Boolean sucesso) {
        this.sucesso = sucesso;
    }

    public MotivoFalhaLogin getMotivoFalha() {
        return motivoFalha;
    }

    public void setMotivoFalha(MotivoFalhaLogin motivoFalha) {
        this.motivoFalha = motivoFalha;
    }

    public String getEnderecoIp() {
        return enderecoIp;
    }

    public void setEnderecoIp(String enderecoIp) {
        this.enderecoIp = enderecoIp;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
}
