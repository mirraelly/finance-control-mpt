package com.mpt.financecontrol.tenant.entity;

import com.mpt.financecontrol.baseentity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "tenant")
public class Tenant extends BaseEntity {

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
