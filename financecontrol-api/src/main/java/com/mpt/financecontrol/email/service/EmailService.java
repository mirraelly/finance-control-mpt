package com.mpt.financecontrol.email.service;

import com.mpt.financecontrol.email.dtos.EmailItemDto;
import com.mpt.financecontrol.email.entity.Email;
import com.mpt.financecontrol.email.repository.EmailRepository;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tipoemail.entity.TipoEmail;
import com.mpt.financecontrol.tipoemail.service.TipoEmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private final EmailRepository repository;
    private final TipoEmailService tipoEmailService;

    public EmailService(EmailRepository repository, TipoEmailService tipoEmailService) {
        this.repository = repository;
        this.tipoEmailService = tipoEmailService;
    }

    @Transactional
    public void sincronizarEmails(Pessoa pessoa, Tenant tenant, List<EmailItemDto> dtos) {
        if (dtos == null) return;

        List<Email> existentes = repository.findByPessoaId(pessoa.getId());

        Set<UUID> idsRecebidos = dtos.stream()
                .map(EmailItemDto::id)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        List<Email> remover = existentes.stream()
                .filter(e -> !idsRecebidos.contains(e.getId()))
                .toList();
        repository.deleteAll(remover);

        boolean jaTemPrincipal = false;

        for (EmailItemDto dto : dtos) {
            TipoEmail tipoEmail = tipoEmailService.findById(dto.tipoEmailId());
            boolean principal = Boolean.TRUE.equals(dto.principal()) && !jaTemPrincipal;
            if (principal) jaTemPrincipal = true;

            Email email;
            if (dto.id() != null) {
                email = existentes.stream()
                        .filter(e -> e.getId().equals(dto.id()))
                        .findFirst()
                        .orElseGet(Email::new);
            } else {
                email = new Email();
            }

            email.setTenant(tenant);
            email.setPessoa(pessoa);
            email.setTipoEmail(tipoEmail);
            email.setEmail(dto.email());
            email.setObservacao(dto.observacao());
            email.setPrincipal(principal);

            repository.save(email);
        }
    }
}
