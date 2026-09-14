package com.mpt.financecontrol.categoria.dtos;

import com.mpt.financecontrol.email.dtos.EmailResponseDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaResponseDto;
import com.mpt.financecontrol.categoria.TipoCategoria;
import com.mpt.financecontrol.telefone.dtos.TelefoneResponseDto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CategoriaResponseDto(
        UUID                        id,
        String                      categoria,
        TipoCategoria                 tipoCategoria;
) {}
