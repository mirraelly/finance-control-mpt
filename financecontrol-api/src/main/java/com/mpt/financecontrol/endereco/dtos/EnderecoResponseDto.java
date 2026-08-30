package com.mpt.financecontrol.endereco.dtos;

import java.util.UUID;

public record EnderecoResponseDto(
        UUID    id,
        UUID    tipoEnderecoId,
        String  tipoEnderecoNome,
        String  cep,
        String  rua,
        String  numero,
        String  bairro,
        String  complemento,
        UUID    cidadeId,
        String  cidadeNome,
        String  estadoSigla,
        Boolean principal
) {}
