package com.mpt.financecontrol.categoria.service;

import com.mpt.financecontrol.categoria.dtos.CategoriaResponseDtoDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaUpdateDtoDto;
import com.mpt.financecontrol.categoria.entity.Categoria;
import com.mpt.financecontrol.categoria.repository.CategoriaRepository;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tipocategoria.entity.TipoCategoria;
import com.mpt.financecontrol.tipocategoria.service.TipoCategoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository repository;
    private final TipoCategoriaService tipoCategoriaService;

    public CategoriaService(
            CategoriaRepository repository,
            TipoCategoriaService tipoCategoriaService
    ) {
        this.repository = repository;
        this.tipoCategoriaService = tipoCategoriaService;
    }

    @Transactional
    public void sincronizarCategorias(
            Pessoa pessoa,
            Tenant tenant,
            List<CategoriaItemDto> dtos
    ) {
        if (dtos == null) {
            return;
        }

        List<Categoria> existentes =
                repository.findByPessoaId(pessoa.getId());

        Set<UUID> idsRecebidos = dtos.stream()
                .map(CategoriaItemDto::id)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        List<Categoria> remover = existentes.stream()
                .filter(categoria ->
                        !idsRecebidos.contains(categoria.getId()))
                .toList();

        repository.deleteAll(remover);

        for (CategoriaItemDto dto : dtos) {

            TipoCategoria tipoCategoria =
                    tipoCategoriaService.findById(
                            dto.tipoCategoriaId()
                    );

            Categoria categoria;

            if (dto.id() != null) {

                categoria = existentes.stream()
                        .filter(c ->
                                c.getId().equals(dto.id()))
                        .findFirst()
                        .orElseGet(Categoria::new);

            } else {

                categoria = new Categoria();
            }

            categoria.setTenant(tenant);
            categoria.setPessoa(pessoa);
            categoria.setTipoCategoria(tipoCategoria);

            // Ajuste estes campos conforme os atributos
            // existentes na sua entidade Categoria.
            categoria.setNome(dto.nome());
            categoria.setDescricao(dto.descricao());

            repository.save(categoria);
        }
    }
}
