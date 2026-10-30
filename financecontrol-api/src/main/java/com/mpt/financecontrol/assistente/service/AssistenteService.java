package com.mpt.financecontrol.assistente.service;

import com.google.genai.types.AutomaticFunctionCallingConfig;
import com.google.genai.types.Content;
import com.google.genai.types.FunctionCall;
import com.google.genai.types.FunctionResponse;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Tool;
import com.mpt.financecontrol.assistente.client.GeminiClient;
import com.mpt.financecontrol.assistente.dtos.AssistenteAcaoDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteMensagemDto;
import com.mpt.financecontrol.assistente.dtos.AssistentePerguntaDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteRespostaDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AssistenteService {

    public static final String RESPOSTA_FORA_DO_ESCOPO =
            "Desculpe, essa pergunta não pode ser respondida. Posso ajudar apenas com assuntos do Finance Control.";

    private static final Logger log = LoggerFactory.getLogger(AssistenteService.class);

    private static final int MAXIMO_HISTORICO = 10;
    private static final int MAXIMO_VOLTAS = 5;

    private final GeminiClient geminiClient;
    private final AssistenteFerramentas ferramentas;

    public AssistenteService(GeminiClient geminiClient, AssistenteFerramentas ferramentas) {
        this.geminiClient = geminiClient;
        this.ferramentas  = ferramentas;
    }

    public AssistenteRespostaDto perguntar(AssistentePerguntaDto dto) {
        List<Content> conteudos = new ArrayList<>();
        List<AssistenteMensagemDto> historico = dto.historico() != null ? dto.historico() : List.of();

        historico.stream()
                .skip(Math.max(0, historico.size() - MAXIMO_HISTORICO))
                .map(mensagem -> Content.builder()
                        .role("assistente".equals(mensagem.papel()) ? "model" : "user")
                        .parts(Part.fromText(mensagem.texto()))
                        .build())
                .forEach(conteudos::add);

        conteudos.add(Content.builder().role("user").parts(Part.fromText(dto.mensagem().trim())).build());

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(instrucoes())))
                .tools(Tool.builder().functionDeclarations(ferramentas.declaracoes()).build())
                .automaticFunctionCalling(AutomaticFunctionCallingConfig.builder().disable(true).build())
                .temperature(0.2f)
                .build();

        List<AssistenteAcaoDto> acoes = new ArrayList<>();

        for (int volta = 0; volta < MAXIMO_VOLTAS; volta++) {
            GenerateContentResponse resposta = geminiClient.gerar(conteudos, config);
            List<FunctionCall> chamadas = resposta.functionCalls();

            if (chamadas == null || chamadas.isEmpty())
                return new AssistenteRespostaDto(textoResposta(resposta, acoes), acoes);

            resposta.candidates()
                    .filter(candidatos -> !candidatos.isEmpty())
                    .flatMap(candidatos -> candidatos.getFirst().content())
                    .ifPresent(conteudos::add);

            List<Part> resultados = new ArrayList<>();
            for (FunctionCall chamada : chamadas) {
                String nome = chamada.name().orElse("");
                log.info("Assistente chamou a ferramenta {} com {}", nome, chamada.args().orElse(Map.of()));
                Map<String, Object> resultado = ferramentas.executar(nome, chamada.args().orElse(Map.of()), acoes);

                FunctionResponse.Builder retorno = FunctionResponse.builder().name(nome).response(resultado);
                chamada.id().ifPresent(retorno::id);
                resultados.add(Part.builder().functionResponse(retorno.build()).build());
            }
            conteudos.add(Content.builder().role("user").parts(resultados).build());
        }

        return new AssistenteRespostaDto(
                acoes.isEmpty()
                        ? "Não consegui concluir o pedido. Tente reformular a pergunta."
                        : "Confira os dados abaixo antes de confirmar.",
                acoes);
    }

    private String textoResposta(GenerateContentResponse resposta, List<AssistenteAcaoDto> acoes) {
        String texto = resposta.candidates()
                .filter(candidatos -> !candidatos.isEmpty())
                .flatMap(candidatos -> candidatos.getFirst().content())
                .flatMap(Content::parts)
                .map(partes -> String.join("", partes.stream()
                        .filter(parte -> !parte.thought().orElse(false))
                        .map(parte -> parte.text().orElse(""))
                        .toList()))
                .orElse("")
                .trim();

        if (!texto.isEmpty())
            return texto;

        return acoes.isEmpty()
                ? "Não consegui gerar uma resposta. Tente reformular a pergunta."
                : "Confira os dados abaixo antes de confirmar.";
    }

    private String instrucoes() {
        LocalDate hoje = AssistenteFerramentas.hoje();
        String diaSemana = hoje.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.of("pt", "BR"));

        return """
                Você é o assistente virtual do Finance Control, um sistema de controle financeiro.
                Hoje é %s, %s (formato AAAA-MM-DD: %s). Fuso horário de Brasília.

                Você só pode ajudar com o que o Finance Control oferece:
                - consultar vencimentos de contas a pagar e a receber (do dia, da semana, do mês, vencidas);
                - consultar lançamentos financeiros, entradas, saídas e saldos das contas financeiras;
                - consultar contas a pagar e a receber e os cadastros de categorias, contas financeiras, formas de pagamento e pessoas;
                - gerar relatórios em PDF de vencimentos, lançamentos e saldos;
                - preparar lançamentos, pagamentos ou recebimentos de parcelas, contas a pagar ou a receber e transferências entre contas;
                - preparar o cadastro de novas contas financeiras, formas de pagamento e categorias.

                Regras:
                1. Se a pergunta não tiver relação com o Finance Control ou com as finanças registradas nele, responda exatamente: "%s"
                2. Use sempre as ferramentas para obter dados. Nunca invente valores, nomes, datas ou registros.
                3. Para gravar qualquer coisa use somente as ferramentas propor_*. Elas não gravam: o usuário confirma no chat. Depois de propor, diga em uma frase curta que os dados estão prontos para confirmação. Nunca diga que algo já foi salvo.
                4. "Esta semana" vai de segunda a domingo da semana atual. "Este mês" vai do dia 1 ao último dia do mês atual. "Hoje" usa a data de hoje como início e fim.
                5. Gastos e despesas são lançamentos do tipo SAIDA; receitas e ganhos são do tipo ENTRADA.
                6. Quando faltar uma informação obrigatória ou uma ferramenta retornar erro com opções, pergunte ao usuário de forma objetiva mostrando as opções.
                7. Para pagar ou receber uma parcela, primeiro consulte os vencimentos para obter o parcelaId correto.
                8. Responda em português do Brasil, em texto simples e curto, sem markdown, sem asteriscos e sem tabelas. Para listas use uma linha por item iniciando com "- ". Mostre valores como R$ 0,00 e datas como DD/MM/AAAA. Nunca mostre IDs ao usuário.
                9. Para relatórios em PDF use a ferramenta gerar_relatorio e avise que o botão para baixar aparece abaixo da resposta.
                10. Ao chamar uma ferramenta, preencha todos os parâmetros que o usuário informou, como descrição, categoria, conta financeira e forma de pagamento.
                11. Cada novo pedido de gravação é independente. Nunca reaproveite conta financeira, forma de pagamento, categoria, pessoa ou valores de pedidos anteriores da conversa. Se o usuário não informar a conta financeira ou a forma de pagamento no pedido atual, deixe o parâmetro vazio para que a ferramenta retorne as opções e pergunte ao usuário qual usar.
                12. Quando o usuário pedir para cadastrar uma conta financeira, forma de pagamento ou categoria que não existe, use propor_conta_financeira, propor_forma_pagamento ou propor_categoria. Se o pedido anterior dependia desse cadastro, avise que, depois de confirmar, basta pedir novamente o lançamento.
                """.formatted(diaSemana, AssistenteFerramentas.data(hoje), hoje, RESPOSTA_FORA_DO_ESCOPO);
    }
}
