package com.mpt.financecontrol.transferenciaentrecontas.controller;

import com.mpt.financecontrol.transferenciaentrecontas.dtos.TransferenciaEntreContasCreateDto;
import com.mpt.financecontrol.transferenciaentrecontas.dtos.TransferenciaEntreContasResponseDto;
import com.mpt.financecontrol.transferenciaentrecontas.service.TransferenciaEntreContasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/transferencias")
@Tag(name = "Transferência entre Contas", description = "Gerenciamento de transferências entre contas financeiras")
public class TransferenciaEntreContasController {

    private final TransferenciaEntreContasService service;

    public TransferenciaEntreContasController(TransferenciaEntreContasService service) {
        this.service = service;
    }

    @Operation(summary = "Listar transferências", description = "Retorna lista paginada de transferências com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<TransferenciaEntreContasResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "data", direction = Sort.Direction.DESC) Pageable pageable,

            @Parameter(description = "Filtro por conta financeira (origem ou destino)")
            @RequestParam(required = false) UUID contaFinanceiraId,

            @Parameter(description = "Data inicial")
            @RequestParam(required = false) LocalDate dataInicio,

            @Parameter(description = "Data final")
            @RequestParam(required = false) LocalDate dataFim
    ) {
        return service.getAll(pageable, contaFinanceiraId, dataInicio, dataFim);
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma transferência pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TransferenciaEntreContasResponseDto> findById(
            @Parameter(description = "ID da transferência")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar transferência", description = "Transfere um valor entre duas contas financeiras, gerando uma saída na origem e uma entrada no destino")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos, contas iguais ou conta inativa"),
            @ApiResponse(responseCode = "404", description = "Conta financeira não encontrada")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TransferenciaEntreContasResponseDto> create(
            @RequestBody @Valid TransferenciaEntreContasCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Excluir transferência", description = "Exclui a transferência e os lançamentos gerados por ela")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Excluída com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da transferência")
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
