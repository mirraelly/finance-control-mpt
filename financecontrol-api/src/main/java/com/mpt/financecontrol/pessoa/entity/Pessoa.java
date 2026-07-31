package com.mpt.financecontrol.pessoa.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import com.mpt.financecontrol.pessoa.TipoPessoa;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.entity.Usuario;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "pessoa")
public class Pessoa extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", nullable = false, length = 30)
    private TipoPessoa tipoPessoa;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "cpf", length = 11)
    private String cpf;

    @Column(name = "rg", length = 20)
    private String rg;

    @Column(name = "cnh", length = 11)
    private String cnh;

    @Column(name = "cnh_categoria", length = 5)
    private String cnhCategoria;

    @Column(name = "cnh_validade")
    private LocalDate cnhValidade;

    @Column(name = "cnpj", length = 14)
    private String cnpj;

    @Column(name = "inscricao_estadual", length = 50)
    private String inscricaoEstadual;

    @Column(name = "inscricao_municipal", length = 50)
    private String inscricaoMunicipal;

    @Column(name = "nome_fantasia", length = 255)
    private String nomeFantasia;

    @Column(name = "razao_social", length = 255)
    private String razaoSocial;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Usuario createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private Usuario updatedBy;

    @PrePersist
    protected void applyDefaults() {
        if (this.ativo == null) this.ativo = true;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoPessoa getTipoPessoa() {
        return tipoPessoa;
    }

    public void setTipoPessoa(TipoPessoa tipoPessoa) {
        this.tipoPessoa = tipoPessoa;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getCnh() {
        return cnh;
    }

    public void setCnh(String cnh) {
        this.cnh = cnh;
    }

    public String getCnhCategoria() {
        return cnhCategoria;
    }

    public void setCnhCategoria(String cnhCategoria) {
        this.cnhCategoria = cnhCategoria;
    }

    public LocalDate getCnhValidade() {
        return cnhValidade;
    }

    public void setCnhValidade(LocalDate cnhValidade) {
        this.cnhValidade = cnhValidade;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getInscricaoEstadual() {
        return inscricaoEstadual;
    }

    public void setInscricaoEstadual(String inscricaoEstadual) {
        this.inscricaoEstadual = inscricaoEstadual;
    }

    public String getInscricaoMunicipal() {
        return inscricaoMunicipal;
    }

    public void setInscricaoMunicipal(String inscricaoMunicipal) {
        this.inscricaoMunicipal = inscricaoMunicipal;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Usuario getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Usuario createdBy) {
        this.createdBy = createdBy;
    }

    public Usuario getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Usuario updatedBy) {
        this.updatedBy = updatedBy;
    }
}
