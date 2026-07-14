package com.mpt.financecontrol.tenant.service;

import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.exceptions.NotFoundException;
import com.mpt.financecontrol.tenant.dtos.TenantSaveDto;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tenant.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;

    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public Tenant findById(UUID id) throws NotFoundException {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tenant não encontrado, verifique!"));
    }

    @Transactional
    public Tenant create(TenantSaveDto dto) {
        if (dto.nome() == null || dto.nome().isBlank())
            throw new BadRequestException("O nome do tenant é obrigatório, verifique!");

        Tenant tenant = new Tenant();
        tenant.setNome(dto.nome());

        return tenantRepository.save(tenant);
    }
}
