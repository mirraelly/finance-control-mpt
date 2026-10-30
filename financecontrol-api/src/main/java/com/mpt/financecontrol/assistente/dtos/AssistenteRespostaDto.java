package com.mpt.financecontrol.assistente.dtos;

import java.util.List;

public record AssistenteRespostaDto(
        String                  resposta,
        List<AssistenteAcaoDto> acoes
) {}
