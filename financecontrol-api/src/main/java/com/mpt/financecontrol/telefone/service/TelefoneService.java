package com.mpt.financecontrol.telefone.service;

import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.telefone.dtos.TelefoneItemDto;
import com.mpt.financecontrol.telefone.entity.Telefone;
import com.mpt.financecontrol.telefone.repository.TelefoneRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tipotelefone.entity.TipoTelefone;
import com.mpt.financecontrol.tipotelefone.service.TipoTelefoneService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TelefoneService {

    private final TelefoneRepository repository;
    private final TipoTelefoneService tipoTelefoneService;

    public TelefoneService(TelefoneRepository repository, TipoTelefoneService tipoTelefoneService) {
        this.repository = repository;
        this.tipoTelefoneService = tipoTelefoneService;
    }

    @Transactional
    public void sincronizarTelefones(Pessoa pessoa, Tenant tenant, List<TelefoneItemDto> dtos) {
        if (dtos == null) return;

        List<Telefone> existentes = repository.findByPessoaId(pessoa.getId());

        Set<UUID> idsRecebidos = dtos.stream()
                .map(TelefoneItemDto::id)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        List<Telefone> remover = existentes.stream()
                .filter(t -> !idsRecebidos.contains(t.getId()))
                .toList();
        repository.deleteAll(remover);

        boolean jaTemPrincipal = false;

        for (TelefoneItemDto dto : dtos) {
            TipoTelefone tipoTelefone = tipoTelefoneService.findById(dto.tipoTelefoneId());
            boolean principal = Boolean.TRUE.equals(dto.principal()) && !jaTemPrincipal;
            if (principal) jaTemPrincipal = true;

            Telefone telefone;
            if (dto.id() != null) {
                telefone = existentes.stream()
                        .filter(t -> t.getId().equals(dto.id()))
                        .findFirst()
                        .orElseGet(Telefone::new);
            } else {
                telefone = new Telefone();
            }

            telefone.setTenant(tenant);
            telefone.setPessoa(pessoa);
            telefone.setTipoTelefone(tipoTelefone);
            telefone.setNumero(dto.numero());
            telefone.setObservacao(dto.observacao());
            telefone.setPrincipal(principal);

            repository.save(telefone);
        }
    }
}
