package com.mpt.financecontrol.assistente.client;

import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.errors.GenAiIOException;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.mpt.financecontrol.exceptions.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final List<Client> clientes;
    private final String modelo;
    private final AtomicInteger proximaChave = new AtomicInteger();

    public GeminiClient(
            @Value("${gemini.api-keys:}") String chaves,
            @Value("${gemini.model}")     String modelo
    ) {
        this.clientes = Arrays.stream(chaves.split("[,;]"))
                .map(String::trim)
                .filter(chave -> !chave.isEmpty())
                .map(chave -> Client.builder().apiKey(chave).build())
                .toList();
        this.modelo = modelo;
    }

    public GenerateContentResponse gerar(List<Content> conteudos, GenerateContentConfig config) {
        if (clientes.isEmpty())
            throw new BadRequestException("O assistente não está configurado. Informe a variável GEMINI_API_KEYS.");

        int inicio = Math.floorMod(proximaChave.getAndIncrement(), clientes.size());

        for (int tentativa = 0; tentativa < clientes.size(); tentativa++) {
            int indice = (inicio + tentativa) % clientes.size();
            try {
                return clientes.get(indice).models.generateContent(modelo, conteudos, config);
            } catch (ApiException e) {
                log.warn("Chave {} do Gemini falhou com código {}: {}", indice + 1, e.code(), e.message());
                if (e.code() == 400 && (e.message() == null || !e.message().contains("API key")))
                    throw new BadRequestException("Não foi possível processar a pergunta no assistente");
            } catch (GenAiIOException e) {
                log.warn("Chave {} do Gemini falhou na comunicação: {}", indice + 1, e.getMessage());
            }
        }

        throw new BadRequestException("O assistente está indisponível no momento. Tente novamente em instantes.");
    }
}
