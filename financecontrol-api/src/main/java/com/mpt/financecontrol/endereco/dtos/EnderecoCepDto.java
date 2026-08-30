package com.mpt.financecontrol.endereco.dtos;

import java.util.UUID;

public record EnderecoCepDto(
        String cep,
        String rua,
        String bairro,
        UUID   cidadeId,
        String cidadeNome,
        UUID   estadoId,
        String estadoSigla
) {}
