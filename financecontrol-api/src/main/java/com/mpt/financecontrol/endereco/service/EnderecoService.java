package com.mpt.financecontrol.endereco.service;

import com.mpt.financecontrol.cidade.entity.Cidade;
import com.mpt.financecontrol.cidade.repository.CidadeRepository;
import com.mpt.financecontrol.cidade.service.CidadeService;
import com.mpt.financecontrol.endereco.client.ViaCepClient;
import com.mpt.financecontrol.endereco.client.ViaCepResponseDto;
import com.mpt.financecontrol.endereco.dtos.EnderecoCepDto;
import com.mpt.financecontrol.endereco.dtos.EnderecoItemDto;
import com.mpt.financecontrol.endereco.entity.Endereco;
import com.mpt.financecontrol.endereco.repository.EnderecoRepository;
import com.mpt.financecontrol.estado.entity.Estado;
import com.mpt.financecontrol.estado.repository.EstadoRepository;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.pessoa.entity.Pessoa;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.tipoendereco.entity.TipoEndereco;
import com.mpt.financecontrol.tipoendereco.service.TipoEnderecoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EnderecoService {

    private final EnderecoRepository    repository;
    private final TipoEnderecoService   tipoEnderecoService;
    private final CidadeService         cidadeService;
    private final CidadeRepository      cidadeRepository;
    private final EstadoRepository      estadoRepository;
    private final ViaCepClient          viaCepClient;

    public EnderecoService(
            EnderecoRepository  repository,
            TipoEnderecoService tipoEnderecoService,
            CidadeService       cidadeService,
            CidadeRepository    cidadeRepository,
            EstadoRepository    estadoRepository,
            ViaCepClient        viaCepClient
    ) {
        this.repository             = repository;
        this.tipoEnderecoService    = tipoEnderecoService;
        this.cidadeService          = cidadeService;
        this.cidadeRepository       = cidadeRepository;
        this.estadoRepository       = estadoRepository;
        this.viaCepClient           = viaCepClient;
    }

    @Transactional
    public EnderecoCepDto buscarPorCep(String cep) {
        ViaCepResponseDto resposta;
        try {
            resposta = viaCepClient.buscar(cep);
        } catch (RestClientException e) {
            throw new BadRequestException("Não foi possível consultar o CEP");
        }

        if (resposta == null || resposta.erro() != null || resposta.localidade() == null)
            throw new BadRequestException("CEP não encontrado");

        Estado estado = estadoRepository.findBySiglaIgnoreCase(resposta.uf())
                .orElseThrow(() -> new BadRequestException("Estado do CEP não encontrado"));

        Cidade cidade = cidadeRepository.findByCodigoIbge(resposta.ibge())
                .orElseGet(() -> {
                    Cidade nova = new Cidade();
                    nova.setNome(resposta.localidade());
                    nova.setEstado(estado);
                    nova.setCodigoIbge(resposta.ibge());
                    return cidadeRepository.save(nova);
                });

        return new EnderecoCepDto(
                resposta.cep() == null ? null : resposta.cep().replaceAll("\\D", ""),
                resposta.logradouro(),
                resposta.bairro(),
                cidade.getId(),
                cidade.getNome(),
                estado.getId(),
                estado.getSigla()
        );
    }

    @Transactional
    public void sincronizarEnderecos(Pessoa pessoa, Tenant tenant, List<EnderecoItemDto> dtos) {
        if (dtos == null) return;

        List<Endereco> existentes = repository.findByPessoaId(pessoa.getId());

        Set<UUID> idsRecebidos = dtos.stream()
                .map(EnderecoItemDto::id)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        List<Endereco> remover = existentes.stream()
                .filter(e -> !idsRecebidos.contains(e.getId()))
                .toList();
        repository.deleteAll(remover);

        boolean jaTemPrincipal = false;

        for (EnderecoItemDto dto : dtos) {
            TipoEndereco tipoEndereco = tipoEnderecoService.findById(dto.tipoEnderecoId());
            boolean principal = Boolean.TRUE.equals(dto.principal()) && !jaTemPrincipal;
            if (principal) jaTemPrincipal = true;

            Cidade cidade = null;
            if (dto.cidadeId() != null) {
                cidade = cidadeService.findById(dto.cidadeId());
            } else if (dto.cep() != null && !dto.cep().isBlank()) {
                try {
                    cidade = cidadeService.findById(buscarPorCep(dto.cep()).cidadeId());
                } catch (BadRequestException e) {
                    cidade = null;
                }
            }

            Endereco endereco;
            if (dto.id() != null) {
                endereco = existentes.stream()
                        .filter(e -> e.getId().equals(dto.id()))
                        .findFirst()
                        .orElseGet(Endereco::new);
            } else {
                endereco = new Endereco();
            }

            endereco.setTenant(tenant);
            endereco.setPessoa(pessoa);
            endereco.setTipoEndereco(tipoEndereco);
            endereco.setCidade(cidade);
            endereco.setCep(dto.cep());
            endereco.setRua(dto.rua());
            endereco.setNumero(dto.numero());
            endereco.setBairro(dto.bairro());
            endereco.setComplemento(dto.complemento());
            endereco.setPrincipal(principal);

            repository.save(endereco);
        }
    }
}
