package com.mpt.financecontrol.email.controller;

import com.mpt.financecontrol.email.dtos.EmailCreateDto;
import com.mpt.financecontrol.email.dtos.EmailResponseDto;
import com.mpt.financecontrol.email.dtos.EmailUpdateDto;
import com.mpt.financecontrol.email.service.EmailService;
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

import java.util.List;
import java.util.UUID;

public class EmailController {

    package com.mpt.financecontrol.email.controller;

import com.mpt.financecontrol.email.dtos.EmailCreateDto;
import com.mpt.financecontrol.email.dtos.EmailResponseDto;
import com.mpt.financecontrol.email.dtos.EmailUpdateDto;
import com.mpt.financecontrol.email.service.EmailService;
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

import java.util.List;
import java.util.UUID;

    @RestController
    @RequestMapping("/emails")
    @Tag(name = "Email", description = "Gerenciamento de emails")
    public class EmailController {

        private final EmailService service;

        public EmailController(EmailService service) {
            this.service = service;
        }

        @Operation(summary = "Listar Emails", description = "Retorna lista paginada de emails com filtro por nome")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
        })
        @GetMapping
        @PreAuthorize("isAuthenticated()")
        public Page<EmailResponseDto> getAll(
                @Parameter(description = "Paginação e ordenação")
                @PageableDefault(size = 15, sort = "nome") Pageable pageable,

                @Parameter(description = "Filtro por nome")
                @RequestParam(required = false) String nome
        ) {
            return service.getAll(pageable, nome);
        }

        @Operation(summary = "Listar para select", description = "Retorna lista simples de emails (ativo = true)")
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
        @GetMapping("/select")
        @PreAuthorize("isAuthenticated()")
        public List<EmailResponseDto> select() {
            return service.select();
        }

        @Operation(summary = "Buscar por ID", description = "Retorna uma email pelo ID")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Encontrada com sucesso"),
                @ApiResponse(responseCode = "404", description = "Não encontrada")
        })
        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<EmailResponseDto> findById(
                @Parameter(description = "ID do email")
                @PathVariable UUID id
        ) {
            return ResponseEntity.ok(service.findByIdResponse(id));
        }

        @Operation(summary = "Criar email", description = "Cria um novo email")
        @ApiResponses({
                @ApiResponse(responseCode = "201", description = "Criado com sucesso")
        })
        @PostMapping
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<EmailResponseDto> create(
                @RequestBody @Valid EmailCreateDto dto
        ) {
            return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
        }

        @Operation(summary = "Atualizar email", description = "Atualiza (substitui) um email")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Atualizado com sucesso"),
                @ApiResponse(responseCode = "404", description = "Não encontrado")
        })
        @PutMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<EmailResponseDto> update(
                @Parameter(description = "ID do email")
                @PathVariable UUID id,

                @RequestBody @Valid EmailUpdateDto dto
        ) {
            return ResponseEntity.ok(service.update(id, dto));
        }
    }

}
