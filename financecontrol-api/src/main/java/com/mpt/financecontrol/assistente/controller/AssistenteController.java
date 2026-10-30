package com.mpt.financecontrol.assistente.controller;

import com.mpt.financecontrol.assistente.dtos.AssistentePerguntaDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteRespostaDto;
import com.mpt.financecontrol.assistente.service.AssistenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/assistente")
@Tag(name = "Assistente", description = "Chat com inteligência artificial sobre os dados do sistema")
public class AssistenteController {

    private final AssistenteService service;

    public AssistenteController(AssistenteService service) {
        this.service = service;
    }

    @Operation(summary = "Perguntar ao assistente", description = "Envia uma mensagem ao assistente e retorna a resposta com as ações sugeridas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resposta gerada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Mensagem inválida ou assistente indisponível")
    })
    @PostMapping("/perguntar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AssistenteRespostaDto> perguntar(@RequestBody @Valid AssistentePerguntaDto dto) {
        return ResponseEntity.ok(service.perguntar(dto));
    }
}
