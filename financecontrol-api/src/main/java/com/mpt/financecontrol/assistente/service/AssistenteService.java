package com.mpt.financecontrol.assistente.service;

import com.google.genai.types.AutomaticFunctionCallingConfig;
import com.google.genai.types.Content;
import com.google.genai.types.FunctionCall;
import com.google.genai.types.FunctionResponse;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.ThinkingConfig;
import com.google.genai.types.ThinkingLevel;
import com.google.genai.types.Tool;
import com.mpt.financecontrol.assistente.client.GeminiClient;
import com.mpt.financecontrol.assistente.dtos.AssistenteAcaoDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteAnexoDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteMensagemDto;
import com.mpt.financecontrol.assistente.dtos.AssistentePerguntaDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteRespostaDto;
import com.mpt.financecontrol.exceptions.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Base64;
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

        conteudos.add(mensagemAtual(dto));

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(instrucoes())))
                .tools(Tool.builder().functionDeclarations(ferramentas.declaracoes()).build())
                .automaticFunctionCalling(AutomaticFunctionCallingConfig.builder().disable(true).build())
                .thinkingConfig(ThinkingConfig.builder().thinkingLevel(ThinkingLevel.Known.LOW).build())
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

    private Content mensagemAtual(AssistentePerguntaDto dto) {
        List<Part> partes = new ArrayList<>();
        partes.add(Part.fromText(dto.mensagem().trim()));

        AssistenteAnexoDto anexo = dto.anexo();
        if (anexo != null) {
            try {
                partes.add(Part.fromBytes(Base64.getDecoder().decode(anexo.conteudo()), anexo.tipo()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Anexo inválido");
            }
        }

        return Content.builder().role("user").parts(partes).build();
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
                - preparar o cadastro de novas contas financeiras, formas de pagamento e categorias;
                - ler comprovantes anexados (foto ou PDF de recibos, notas, cupons e comprovantes de pagamento) para preparar o registro.

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
                11. Cada novo pedido de gravação é independente. Nunca reaproveite conta financeira, forma de pagamento, categoria, pessoa ou valores de pedidos anteriores da conversa. Se o usuário não informar a conta financeira ou a forma de pagamento no pedido atual e elas não constarem no comprovante anexado, deixe o parâmetro vazio para que a ferramenta retorne as opções e pergunte ao usuário qual usar.
                12. Quando o usuário pedir para cadastrar uma conta financeira, forma de pagamento ou categoria que não existe, use propor_conta_financeira, propor_forma_pagamento ou propor_categoria.
                13. Quando a mensagem tiver vários pedidos de gravação, atenda todos na mesma resposta, chamando uma ferramenta propor_* para cada item, e não apenas para o primeiro.
                14. Se uma forma de pagamento ou um lançamento usar uma conta financeira nova pedida na mesma mensagem, chame primeiro propor_conta_financeira e depois propor_forma_pagamento ou propor_lancamento informando o nome dessa conta. Não peça para o usuário confirmar a conta antes nem para pedir de novo: esses registros são gravados depois que ele confirmar a conta no chat. Isso vale também quando o usuário escreve "depois" ou "após isso" e quando houver várias contas novas; nesse caso chame propor_forma_pagamento uma vez para cada forma de cada conta, com o nome completo da conta.
                15. Se a ferramenta ajustar o nome de uma forma de pagamento, informe ao usuário o nome que será cadastrado.
                16. Quando a mensagem tiver um comprovante anexado, leia o valor, a data, o estabelecimento ou a pessoa, a forma de pagamento (PIX, débito, crédito, boleto, dinheiro) e a instituição e o tipo da conta do pagador (em pagamentos) ou do recebedor (em recebimentos). Nunca invente dados que não estejam legíveis; pergunte ao usuário. Se o ano não estiver claro ou a data for futura, use a data de hoje. Se o anexo não for um comprovante financeiro, responda exatamente: "%s". O mesmo comprovante é reenviado junto das respostas seguintes do usuário enquanto o pedido não for concluído; use sempre os dados dele, e não de outros pedidos. Sempre que precisar perguntar algo ao usuário sobre um comprovante, informe também os dados lidos dele. Se a conversa citar um comprovante que não foi enviado na mensagem atual e os dados dele não estiverem na conversa, peça para o usuário anexar o comprovante novamente.
                17. Antes de propor o registro de um comprovante, chame listar_vencimentos (PAGAR para pagamentos e RECEBER para recebimentos) e procure parcelas em aberto com o mesmo valor ou a mesma pessoa. Se o comprovante mostrar a instituição da conta, chame listar_cadastros com CONTAS_FINANCEIRAS e use como contaFinanceira o nome cadastrado que corresponda à instituição e ao tipo da conta (por exemplo, instituição SICREDI com Conta Corrente corresponde a uma conta cadastrada como "Sicredi Conta Corrente"); faça o mesmo com FORMAS_PAGAMENTO para a forma de pagamento. Só pergunte a conta ou a forma de pagamento quando nenhuma ou mais de uma opção corresponder, mostrando apenas as opções compatíveis. Se houver parcelas compatíveis, informe os dados lidos do comprovante (valor, data, estabelecimento ou pessoa, forma de pagamento e conta financeira identificada), mostre as parcelas numeradas a partir de 1, uma por linha no formato "1 - descrição, pessoa, vencimento, valor", com a última opção "Nenhuma, lançar como novo lançamento", e pergunte o número da opção. Se não houver parcela compatível e o comprovante for de pagamento à vista, use propor_lancamento com os dados lidos; comprovante de pagamento ou de compra é SAIDA e comprovante de recebimento é ENTRADA. Se o comprovante for de uma compra ou venda parcelada, siga a regra 19.
                18. Quando o usuário responder com o número de uma opção da lista de parcelas, use os dados do comprovante informados na conversa. Chame listar_vencimentos novamente para obter o parcelaId da parcela escolhida e use propor_baixa_parcela com a data, o valor e a forma de pagamento do comprovante. Se a opção for "Nenhuma", use propor_lancamento com a conta financeira identificada no comprovante, ou a regra 19 se a compra for parcelada.
                19. Compras ou vendas parceladas, pedidas por texto (por exemplo "comprei em 6x de R$ 200,00") ou lidas de um comprovante (por exemplo "Parcelado em 6x"), não são lançamentos: use propor_conta com tipo PAGAR para compras e RECEBER para vendas, pessoa com o nome do fornecedor, estabelecimento ou cliente, valorTotal com o valor total, quantidadeParcelas com o número de parcelas, dataEmissao com a data da compra, descricao com o que foi comprado ou vendido e formaPagamento com a forma usada (por exemplo, cartão de crédito). Se o valor total não for informado, multiplique o valor da parcela pela quantidade. Se o vencimento da primeira parcela não for informado, use um mês após a data da compra e avise o usuário na resposta. Se a pessoa não estiver cadastrada, mostre apenas os nomes parecidos retornados pela ferramenta; se não houver nenhum parecido, informe que o fornecedor ou cliente precisa ser cadastrado em Cadastros > Pessoas antes de registrar a conta.
                20. O histórico pode trazer o resumo do último registro preparado no chat, com a situação confirmado, cancelado ou aguardando confirmação. Use esse resumo apenas para entender a que o usuário se refere, por exemplo "pagar a primeira parcela dessa conta". Para agir, consulte sempre as ferramentas para obter IDs, parcelas e valores atuais, e localize a parcela pela pessoa, pela descrição, pelo vencimento e pelo valor do resumo. Se o registro foi cancelado ou ainda aguarda confirmação, avise o usuário que ele não existe no sistema.
                """.formatted(diaSemana, AssistenteFerramentas.data(hoje), hoje, RESPOSTA_FORA_DO_ESCOPO, RESPOSTA_FORA_DO_ESCOPO);
    }
}
