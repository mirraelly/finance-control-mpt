package com.mpt.financecontrol.endereco.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ViaCepClient {

    private final RestClient restClient;

    public ViaCepClient(@Value("${viacep.url}") String url) {
        this.restClient = RestClient.builder()
                .baseUrl(url)
                .requestFactory(new SimpleClientHttpRequestFactory())
                .build();
    }

    public ViaCepResponseDto buscar(String cep) {
        return restClient.get()
                .uri("/{cep}/json/", cep.replaceAll("\\D", ""))
                .retrieve()
                .body(ViaCepResponseDto.class);
    }
}
