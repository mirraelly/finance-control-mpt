package com.mpt.financecontrol.endereco.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ViaCepResponseDto(
        String  cep,
        String  logradouro,
        String  bairro,
        String  localidade,
        String  uf,
        Integer ibge,
        String  erro
) {}
