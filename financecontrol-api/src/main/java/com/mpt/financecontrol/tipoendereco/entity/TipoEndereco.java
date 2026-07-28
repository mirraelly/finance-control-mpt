package com.mpt.financecontrol.tipoendereco.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tipo_endereco")
public class TipoEndereco extends BaseEntity {

    @Column(name = "cep", nullable = false, length = 10)
    private String cep;

    @Column(name = "logradouro", nullable = false, length = 150)
    private String logradouro;

    @Column(name = "numero", nullable = true, length = 10)
    private String numero;

    @Column(name = "complemento", nullable = true, length = 50)
    private String complemento;

    @Column(name = "bairro", nullable = true, length = 50)
    private String bairro;

    @Column(name = "cidade", nullable = true, length = 50)
    private String cidade;

    @Column(name = "estado", nullable = true, length = 2)
    private String estado;

    @Column(name = "pais", nullable = true, length = 60)
    private String pais;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return cidade;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
