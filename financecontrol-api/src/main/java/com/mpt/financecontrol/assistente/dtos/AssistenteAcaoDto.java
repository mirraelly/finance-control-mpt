package com.mpt.financecontrol.assistente.dtos;

import java.util.List;
import java.util.Map;

public record AssistenteAcaoDto(
        String                        tipo,
        String                        titulo,
        List<AssistenteResumoItemDto> resumo,
        Map<String, Object>           dados
) {}
