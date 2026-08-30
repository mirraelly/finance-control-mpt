package com.mpt.financecontrol.endereco.controller;

import com.mpt.financecontrol.endereco.dtos.EnderecoCepDto;
import com.mpt.financecontrol.endereco.service.EnderecoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/enderecos")
@Tag(name = "Endereço", description = "Consulta de endereços")
public class EnderecoController {

    private final EnderecoService service;

    public EnderecoController(EnderecoService service) {
        this.service = service;
    }

    @Operation(
            summary = "Buscar endereço por CEP",
            description = "Consulta o CEP no ViaCEP, cadastra a cidade caso ainda não exista e retorna os dados para preenchimento"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CEP encontrado"),
            @ApiResponse(responseCode = "400", description = "CEP não encontrado ou consulta indisponível")
    })
    @GetMapping("/cep/{cep}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EnderecoCepDto> buscarPorCep(
            @Parameter(description = "CEP, somente números", example = "01001000")
            @PathVariable String cep
    ) {
        return ResponseEntity.ok(service.buscarPorCep(cep));
    }
}
