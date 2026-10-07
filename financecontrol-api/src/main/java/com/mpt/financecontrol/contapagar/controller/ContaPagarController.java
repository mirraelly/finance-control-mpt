package com.mpt.financecontrol.contapagar.controller;

import com.mpt.financecontrol.contapagar.dtos.ContaPagarCreateDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarResponseDto;
import com.mpt.financecontrol.contapagar.dtos.ContaPagarUpdateDto;
import com.mpt.financecontrol.contapagar.service.ContaPagarService;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaBaixaDto;
import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.pagamento.dtos.PagamentoCreateDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contas-pagar")
@Tag(name = "Conta Pagar", description = "Gerenciamento de contas a pagar")
public class ContaPagarController {

    private final ContaPagarService service;

    public ContaPagarController(ContaPagarService service) {
        this.service = service;
    }

    @Operation(summary = "Listar contas a pagar", description = "Retorna lista paginada de contas a pagar com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<ContaPagarResponseDto> getAll(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "data_emissao") Pageable pageable,

            @Parameter(description = "Filtro por pessoa")
            @RequestParam(required = false) UUID pessoaId,

            @Parameter(description = "Filtro por categoria")
            @RequestParam(required = false) UUID categoriaId,

            @Parameter(description = "Filtro por status")
            @RequestParam(required = false) StatusConta status,

            @Parameter(description = "Filtro por ativo")
            @RequestParam(required = false) Boolean ativo
    ) {
        return service.getAll(pageable, pessoaId, categoriaId, status, ativo);
    }

    @Operation(summary = "Listar para select", description = "Retorna lista simples de contas a pagar (ativo = true)")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/select")
    @PreAuthorize("isAuthenticated()")
    public List<ContaPagarResponseDto> select() {
        return service.select();
    }

    @Operation(summary = "Listar parcelas", description = "Retorna lista paginada de parcelas a pagar para a tela de pagamentos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    })
    @GetMapping("/parcelas")
    @PreAuthorize("isAuthenticated()")
    public Page<ContaPagarParcelaBaixaDto> getParcelas(
            @Parameter(description = "Paginação e ordenação")
            @PageableDefault(size = 15, sort = "data_vencimento") Pageable pageable,

            @Parameter(description = "Filtro por pessoa")
            @RequestParam(required = false) UUID pessoaId,

            @Parameter(description = "Filtro por status (sem filtro, oculta as canceladas)")
            @RequestParam(required = false) StatusConta status,

            @Parameter(description = "Data de vencimento inicial")
            @RequestParam(required = false) LocalDate dataVencimentoInicio,

            @Parameter(description = "Data de vencimento final")
            @RequestParam(required = false) LocalDate dataVencimentoFim
    ) {
        return service.getParcelas(pageable, pessoaId, status, dataVencimentoInicio, dataVencimentoFim);
    }

    @Operation(summary = "Buscar por ID", description = "Retorna uma conta a pagar pelo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> findById(
            @Parameter(description = "ID da conta a pagar")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.findByIdResponse(id));
    }

    @Operation(summary = "Criar conta a pagar", description = "Cria uma nova conta a pagar")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Pessoa, categoria ou forma de pagamento não encontrada")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> create(
            @RequestBody @Valid ContaPagarCreateDto dto
    ) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar conta a pagar", description = "Atualiza parcialmente uma conta a pagar")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou alteração não permitida"),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> update(
            @Parameter(description = "ID da conta a pagar")
            @PathVariable UUID id,

            @RequestBody @Valid ContaPagarUpdateDto dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Operation(summary = "Pagar parcela", description = "Registra um pagamento para a parcela e atualiza o status da parcela e da conta")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou parcela não pode ser paga"),
            @ApiResponse(responseCode = "404", description = "Parcela, forma de pagamento ou conta financeira não encontrada")
    })
    @PatchMapping("/parcelas/{parcelaId}/pagar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> pagarParcela(
            @Parameter(description = "ID da parcela")
            @PathVariable UUID parcelaId,

            @RequestBody @Valid PagamentoCreateDto dto
    ) {
        return ResponseEntity.ok(service.pagarParcela(parcelaId, dto));
    }

    @Operation(summary = "Estornar pagamento", description = "Exclui o pagamento e atualiza o status da parcela e da conta")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento estornado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Pagamento não pode ser estornado"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado")
    })
    @DeleteMapping("/pagamentos/{pagamentoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContaPagarResponseDto> estornarPagamento(
            @Parameter(description = "ID do pagamento")
            @PathVariable UUID pagamentoId
    ) {
        return ResponseEntity.ok(service.estornarPagamento(pagamentoId));
    }
}
