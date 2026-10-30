package com.mpt.financecontrol.assistente.service;

import com.google.genai.types.FunctionDeclaration;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import com.mpt.financecontrol.assistente.dtos.AssistenteAcaoDto;
import com.mpt.financecontrol.assistente.dtos.AssistenteResumoItemDto;
import com.mpt.financecontrol.categoria.dtos.CategoriaResponseDto;
import com.mpt.financecontrol.categoria.service.CategoriaService;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraResponseDto;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraSaldoDto;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.contapagar.service.ContaPagarService;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaBaixaDto;
import com.mpt.financecontrol.contareceber.service.ContaReceberService;
import com.mpt.financecontrol.contareceberparcela.dtos.ContaReceberParcelaBaixaDto;
import com.mpt.financecontrol.financeiro.StatusConta;
import com.mpt.financecontrol.financeiro.TipoContaFinanceira;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.formapagamento.dtos.FormaPagamentoResponseDto;
import com.mpt.financecontrol.formapagamento.service.FormaPagamentoService;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroResponseDto;
import com.mpt.financecontrol.lancamentofinanceiro.service.LancamentoFinanceiroService;
import com.mpt.financecontrol.pessoa.dtos.PessoaResponseDto;
import com.mpt.financecontrol.pessoa.service.PessoaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class AssistenteFerramentas {

    public static final ZoneId FUSO_HORARIO = ZoneId.of("America/Sao_Paulo");

    private static final int LIMITE_REGISTROS = 50;
    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ContaPagarService           contaPagarService;
    private final ContaReceberService         contaReceberService;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final ContaFinanceiraService      contaFinanceiraService;
    private final CategoriaService            categoriaService;
    private final FormaPagamentoService       formaPagamentoService;
    private final PessoaService               pessoaService;

    public AssistenteFerramentas(
            ContaPagarService           contaPagarService,
            ContaReceberService         contaReceberService,
            LancamentoFinanceiroService lancamentoFinanceiroService,
            ContaFinanceiraService      contaFinanceiraService,
            CategoriaService            categoriaService,
            FormaPagamentoService       formaPagamentoService,
            PessoaService               pessoaService
    ) {
        this.contaPagarService           = contaPagarService;
        this.contaReceberService         = contaReceberService;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.contaFinanceiraService      = contaFinanceiraService;
        this.categoriaService            = categoriaService;
        this.formaPagamentoService       = formaPagamentoService;
        this.pessoaService               = pessoaService;
    }

    public List<FunctionDeclaration> declaracoes() {
        return List.of(
                funcao("listar_vencimentos",
                        "Lista parcelas em aberto de contas a pagar e/ou a receber com vencimento no período. Use para perguntas sobre vencimentos, contas vencidas ou a vencer.",
                        objeto(Map.of(
                                "tipo", enumeracao("PAGAR, RECEBER ou AMBOS", "PAGAR", "RECEBER", "AMBOS"),
                                "dataInicio", texto("Data inicial do vencimento no formato AAAA-MM-DD. Omita para incluir parcelas vencidas anteriores."),
                                "dataFim", texto("Data final do vencimento no formato AAAA-MM-DD")
                        ), "tipo")),
                funcao("listar_lancamentos",
                        "Lista lançamentos financeiros (extrato de entradas e saídas) com totais.",
                        objeto(Map.of(
                                "dataInicio", texto("Data inicial no formato AAAA-MM-DD"),
                                "dataFim", texto("Data final no formato AAAA-MM-DD"),
                                "tipo", enumeracao("ENTRADA ou SAIDA", "ENTRADA", "SAIDA"),
                                "categoria", texto("Nome da categoria"),
                                "contaFinanceira", texto("Nome da conta financeira"),
                                "descricao", texto("Trecho da descrição")
                        ))),
                funcao("saldos_contas",
                        "Retorna o saldo atual de cada conta financeira e o saldo total.",
                        null),
                funcao("listar_contas",
                        "Lista contas a pagar ou a receber cadastradas.",
                        objeto(Map.of(
                                "tipo", enumeracao("PAGAR ou RECEBER", "PAGAR", "RECEBER"),
                                "status", enumeracao("Status da conta", "ABERTO", "PARCIALMENTE_PAGO", "PAGO", "CANCELADO"),
                                "pessoa", texto("Nome do fornecedor ou cliente")
                        ), "tipo")),
                funcao("listar_cadastros",
                        "Lista nomes de cadastros do sistema para identificar opções válidas.",
                        objeto(Map.of(
                                "cadastro", enumeracao("Cadastro a listar", "CATEGORIAS", "CONTAS_FINANCEIRAS", "FORMAS_PAGAMENTO", "PESSOAS")
                        ), "cadastro")),
                funcao("gerar_relatorio",
                        "Prepara um relatório em PDF para o usuário baixar.",
                        objeto(Map.of(
                                "relatorio", enumeracao("Relatório desejado", "VENCIMENTOS", "LANCAMENTOS", "SALDOS"),
                                "tipo", enumeracao("Para VENCIMENTOS: PAGAR, RECEBER ou AMBOS. Para LANCAMENTOS: ENTRADA ou SAIDA (opcional).", "PAGAR", "RECEBER", "AMBOS", "ENTRADA", "SAIDA"),
                                "dataInicio", texto("Data inicial no formato AAAA-MM-DD"),
                                "dataFim", texto("Data final no formato AAAA-MM-DD")
                        ), "relatorio")),
                funcao("propor_lancamento",
                        "Prepara um lançamento financeiro (entrada ou saída) para o usuário confirmar. Não grava nada.",
                        objeto(Map.of(
                                "tipo", enumeracao("ENTRADA para receitas ou SAIDA para despesas", "ENTRADA", "SAIDA"),
                                "valor", numero("Valor em reais, por exemplo 50.00"),
                                "data", texto("Data no formato AAAA-MM-DD. Omita para usar hoje."),
                                "descricao", texto("Descrição do lançamento"),
                                "contaFinanceira", texto("Nome da conta financeira"),
                                "categoria", texto("Nome da categoria")
                        ), "tipo", "valor", "descricao")),
                funcao("propor_baixa_parcela",
                        "Prepara o pagamento de uma parcela de conta a pagar ou o recebimento de uma parcela de conta a receber para o usuário confirmar. Use o parcelaId retornado por listar_vencimentos. Não grava nada.",
                        objeto(Map.of(
                                "tipo", enumeracao("PAGAR ou RECEBER", "PAGAR", "RECEBER"),
                                "parcelaId", texto("ID da parcela retornado por listar_vencimentos"),
                                "valor", numero("Valor pago. Omita para quitar o saldo da parcela."),
                                "data", texto("Data do pagamento no formato AAAA-MM-DD. Omita para usar hoje."),
                                "formaPagamento", texto("Nome da forma de pagamento. Omita para usar a forma da parcela."),
                                "juros", numero("Valor de juros"),
                                "multa", numero("Valor de multa"),
                                "desconto", numero("Valor de desconto")
                        ), "tipo", "parcelaId")),
                funcao("propor_conta",
                        "Prepara uma conta a pagar ou a receber com parcelas para o usuário confirmar. Informe a lista de parcelas ou a quantidade de parcelas para dividir o valor igualmente por mês. Não grava nada.",
                        objeto(Map.of(
                                "tipo", enumeracao("PAGAR ou RECEBER", "PAGAR", "RECEBER"),
                                "pessoa", texto("Nome do fornecedor (pagar) ou cliente (receber)"),
                                "descricao", texto("Descrição da conta, por exemplo o que foi comprado ou vendido"),
                                "categoria", texto("Nome da categoria"),
                                "dataEmissao", texto("Data de emissão no formato AAAA-MM-DD. Omita para usar hoje."),
                                "valorTotal", numero("Valor total da conta"),
                                "quantidadeParcelas", inteiro("Quantidade de parcelas mensais quando a lista de parcelas não for informada"),
                                "primeiroVencimento", texto("Vencimento da primeira parcela no formato AAAA-MM-DD"),
                                "formaPagamento", texto("Nome da forma de pagamento usada em todas as parcelas"),
                                "parcelas", lista("Parcelas informadas pelo usuário", objeto(Map.of(
                                        "dataVencimento", texto("Vencimento no formato AAAA-MM-DD"),
                                        "valor", numero("Valor da parcela"),
                                        "formaPagamento", texto("Nome da forma de pagamento da parcela")
                                ), "dataVencimento", "valor"))
                        ), "tipo", "pessoa", "valorTotal")),
                funcao("propor_transferencia",
                        "Prepara uma transferência entre duas contas financeiras para o usuário confirmar. Não grava nada.",
                        objeto(Map.of(
                                "contaOrigem", texto("Nome da conta de origem"),
                                "contaDestino", texto("Nome da conta de destino"),
                                "valor", numero("Valor da transferência"),
                                "data", texto("Data no formato AAAA-MM-DD. Omita para usar hoje."),
                                "descricao", texto("Descrição da transferência")
                        ), "contaOrigem", "contaDestino", "valor")),
                funcao("propor_conta_financeira",
                        "Prepara o cadastro de uma nova conta financeira (banco, carteira, caixa) para o usuário confirmar. Não grava nada.",
                        objeto(Map.of(
                                "nome", texto("Nome da conta financeira, por exemplo Nubank - Conta Corrente"),
                                "tipo", enumeracao("Tipo da conta. Omita para usar CORRENTE.", "CORRENTE", "POUPANCA", "CAIXA", "CARTEIRA")
                        ), "nome")),
                funcao("propor_forma_pagamento",
                        "Prepara o cadastro de uma nova forma de pagamento vinculada a uma conta financeira existente para o usuário confirmar. Não grava nada.",
                        objeto(Map.of(
                                "nome", texto("Nome da forma de pagamento, por exemplo PIX Nubank"),
                                "contaFinanceira", texto("Nome da conta financeira vinculada")
                        ), "nome")),
                funcao("propor_categoria",
                        "Prepara o cadastro de uma nova categoria para o usuário confirmar. Não grava nada.",
                        objeto(Map.of(
                                "nome", texto("Nome da categoria"),
                                "descricao", texto("Descrição da categoria")
                        ), "nome"))
        );
    }

    public Map<String, Object> executar(String nome, Map<String, Object> argumentos, List<AssistenteAcaoDto> acoes) {
        Map<String, Object> args = argumentos != null ? argumentos : Map.of();
        try {
            return switch (nome) {
                case "listar_vencimentos"   -> listarVencimentos(args);
                case "listar_lancamentos"   -> listarLancamentos(args);
                case "saldos_contas"        -> saldosContas();
                case "listar_contas"        -> listarContas(args);
                case "listar_cadastros"     -> listarCadastros(args);
                case "gerar_relatorio"      -> gerarRelatorio(args, acoes);
                case "propor_lancamento"    -> proporLancamento(args, acoes);
                case "propor_baixa_parcela" -> proporBaixaParcela(args, acoes);
                case "propor_conta"         -> proporConta(args, acoes);
                case "propor_transferencia" -> proporTransferencia(args, acoes);
                case "propor_conta_financeira" -> proporContaFinanceira(args, acoes);
                case "propor_forma_pagamento"  -> proporFormaPagamento(args, acoes);
                case "propor_categoria"        -> proporCategoria(args, acoes);
                default -> Map.of("erro", "Ferramenta desconhecida: " + nome);
            };
        } catch (RuntimeException e) {
            return Map.of("erro", e.getMessage() != null ? e.getMessage() : "Não foi possível consultar os dados");
        }
    }

    private Map<String, Object> listarVencimentos(Map<String, Object> args) {
        String tipo = textoObrigatorio(args, "tipo", "Tipo");
        LocalDate dataInicio = data(args, "dataInicio");
        LocalDate dataFim = data(args, "dataFim");

        List<Map<String, Object>> parcelas = new ArrayList<>();
        BigDecimal totalPagar = BigDecimal.ZERO;
        BigDecimal totalReceber = BigDecimal.ZERO;

        if (!"RECEBER".equals(tipo)) {
            for (ContaPagarParcelaBaixaDto parcela : parcelasPagarEmAberto(dataInicio, dataFim)) {
                parcelas.add(mapaParcela("PAGAR", parcela.id(), parcela.descricao(), parcela.pessoaNome(),
                        parcela.numeroParcela(), parcela.totalParcelas(), parcela.dataVencimento(),
                        parcela.valor(), parcela.saldo(), parcela.formaPagamentoNome(), parcela.status()));
                totalPagar = totalPagar.add(parcela.saldo());
            }
        }

        if (!"PAGAR".equals(tipo)) {
            for (ContaReceberParcelaBaixaDto parcela : parcelasReceberEmAberto(dataInicio, dataFim)) {
                parcelas.add(mapaParcela("RECEBER", parcela.id(), parcela.descricao(), parcela.pessoaNome(),
                        parcela.numeroParcela(), parcela.totalParcelas(), parcela.dataVencimento(),
                        parcela.valor(), parcela.saldo(), parcela.formaPagamentoNome(), parcela.status()));
                totalReceber = totalReceber.add(parcela.saldo());
            }
        }

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("quantidade", parcelas.size());
        resultado.put("totalAPagar", moeda(totalPagar));
        resultado.put("totalAReceber", moeda(totalReceber));
        resultado.put("parcelas", parcelas);
        return resultado;
    }

    public List<ContaPagarParcelaBaixaDto> parcelasPagarEmAberto(LocalDate dataInicio, LocalDate dataFim) {
        return contaPagarService.getParcelas(
                        PageRequest.of(0, 500, Sort.by("data_vencimento")), null, null, dataInicio, dataFim)
                .stream()
                .filter(parcela -> emAberto(parcela.status()))
                .toList();
    }

    public List<ContaReceberParcelaBaixaDto> parcelasReceberEmAberto(LocalDate dataInicio, LocalDate dataFim) {
        return contaReceberService.getParcelas(
                        PageRequest.of(0, 500, Sort.by("data_vencimento")), null, null, dataInicio, dataFim)
                .stream()
                .filter(parcela -> emAberto(parcela.status()))
                .toList();
    }

    private Map<String, Object> listarLancamentos(Map<String, Object> args) {
        String categoria = texto(args, "categoria");
        String contaFinanceira = texto(args, "contaFinanceira");
        String tipo = texto(args, "tipo");

        UUID categoriaId = categoria != null
                ? resolver(categoria, categoriaService.select(), CategoriaResponseDto::nome, "Categoria").id()
                : null;
        UUID contaFinanceiraId = contaFinanceira != null
                ? resolver(contaFinanceira, contaFinanceiraService.select(), ContaFinanceiraResponseDto::nome, "Conta financeira").id()
                : null;

        Page<LancamentoFinanceiroResponseDto> pagina = lancamentoFinanceiroService.getAll(
                PageRequest.of(0, LIMITE_REGISTROS, Sort.by(Sort.Direction.DESC, "data")),
                contaFinanceiraId,
                tipo != null ? TipoLancamento.valueOf(tipo) : null,
                null,
                data(args, "dataInicio"),
                data(args, "dataFim"),
                categoriaId,
                texto(args, "descricao"));

        BigDecimal totalEntradas = BigDecimal.ZERO;
        BigDecimal totalSaidas = BigDecimal.ZERO;
        List<Map<String, Object>> lancamentos = new ArrayList<>();

        for (LancamentoFinanceiroResponseDto lancamento : pagina.getContent()) {
            if (lancamento.tipo() == TipoLancamento.ENTRADA)
                totalEntradas = totalEntradas.add(lancamento.valor());
            else
                totalSaidas = totalSaidas.add(lancamento.valor());

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("data", data(lancamento.data()));
            item.put("tipo", lancamento.tipo().name());
            item.put("valor", moeda(lancamento.valor()));
            item.put("descricao", lancamento.descricao());
            item.put("categoria", lancamento.categoriaNome());
            item.put("contaFinanceira", lancamento.contaFinanceiraNome());
            item.put("origem", lancamento.origem().name());
            lancamentos.add(item);
        }

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("quantidadeTotal", pagina.getTotalElements());
        resultado.put("quantidadeListada", lancamentos.size());
        resultado.put("totalEntradasListadas", moeda(totalEntradas));
        resultado.put("totalSaidasListadas", moeda(totalSaidas));
        resultado.put("lancamentos", lancamentos);
        return resultado;
    }

    private Map<String, Object> saldosContas() {
        List<ContaFinanceiraSaldoDto> saldos = contaFinanceiraService.saldos();
        BigDecimal total = saldos.stream().map(ContaFinanceiraSaldoDto::saldo).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("saldoTotal", moeda(total));
        resultado.put("contas", saldos.stream()
                .map(saldo -> Map.of("conta", saldo.nome(), "tipo", saldo.tipo().name(), "saldo", moeda(saldo.saldo())))
                .toList());
        return resultado;
    }

    private Map<String, Object> listarContas(Map<String, Object> args) {
        String tipo = textoObrigatorio(args, "tipo", "Tipo");
        String status = texto(args, "status");
        String pessoa = texto(args, "pessoa");
        UUID pessoaId = pessoa != null
                ? resolver(pessoa, pessoaService.select(), PessoaResponseDto::nome, "Pessoa").id()
                : null;
        StatusConta statusConta = status != null ? StatusConta.valueOf(status) : null;
        PageRequest pagina = PageRequest.of(0, LIMITE_REGISTROS, Sort.by(Sort.Direction.DESC, "data_emissao"));

        List<Map<String, Object>> contas = "PAGAR".equals(tipo)
                ? contaPagarService.getAll(pagina, pessoaId, null, statusConta, true).stream()
                        .map(conta -> mapaConta(conta.descricao(), conta.pessoaNome(), conta.categoriaNome(),
                                conta.dataEmissao(), conta.valorTotal(), conta.status(), conta.parcelas().size()))
                        .toList()
                : contaReceberService.getAll(pagina, pessoaId, null, statusConta, true).stream()
                        .map(conta -> mapaConta(conta.descricao(), conta.pessoaNome(), conta.categoriaNome(),
                                conta.dataEmissao(), conta.valorTotal(), conta.status(), conta.parcelas().size()))
                        .toList();

        return Map.of("quantidade", contas.size(), "contas", contas);
    }

    private Map<String, Object> listarCadastros(Map<String, Object> args) {
        String cadastro = textoObrigatorio(args, "cadastro", "Cadastro");
        List<String> nomes = switch (cadastro) {
            case "CATEGORIAS" -> categoriaService.select().stream().map(CategoriaResponseDto::nome).toList();
            case "CONTAS_FINANCEIRAS" -> contaFinanceiraService.select().stream().map(ContaFinanceiraResponseDto::nome).toList();
            case "FORMAS_PAGAMENTO" -> formaPagamentoService.select().stream()
                    .map(forma -> forma.nome() + " (" + forma.contaFinanceiraNome() + ")")
                    .toList();
            case "PESSOAS" -> pessoaService.select().stream().map(PessoaResponseDto::nome).toList();
            default -> throw new IllegalArgumentException("Cadastro inválido");
        };
        return Map.of("cadastro", cadastro, "nomes", nomes);
    }

    private Map<String, Object> gerarRelatorio(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        String relatorio = textoObrigatorio(args, "relatorio", "Relatório");
        String tipo = texto(args, "tipo");
        LocalDate dataInicio = data(args, "dataInicio");
        LocalDate dataFim = data(args, "dataFim");

        if ("VENCIMENTOS".equals(relatorio) && (tipo == null || !List.of("PAGAR", "RECEBER", "AMBOS").contains(tipo)))
            tipo = "AMBOS";
        if ("LANCAMENTOS".equals(relatorio) && tipo != null && !List.of("ENTRADA", "SAIDA").contains(tipo))
            tipo = null;
        if ("SALDOS".equals(relatorio)) {
            tipo = null;
            dataInicio = null;
            dataFim = null;
        }

        String titulo = switch (relatorio) {
            case "VENCIMENTOS" -> "Relatório de vencimentos";
            case "LANCAMENTOS" -> "Relatório de lançamentos";
            case "SALDOS" -> "Relatório de saldos";
            default -> throw new IllegalArgumentException("Relatório inválido");
        };

        List<AssistenteResumoItemDto> resumo = new ArrayList<>();
        if (tipo != null)
            resumo.add(new AssistenteResumoItemDto("Tipo", descricaoTipo(tipo)));
        if (dataInicio != null || dataFim != null)
            resumo.add(new AssistenteResumoItemDto("Período", periodo(dataInicio, dataFim)));

        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("relatorio", relatorio);
        dados.put("tipo", tipo);
        dados.put("dataInicio", dataInicio != null ? dataInicio.toString() : null);
        dados.put("dataFim", dataFim != null ? dataFim.toString() : null);

        acoes.add(new AssistenteAcaoDto("BAIXAR_RELATORIO", titulo, resumo, dados));
        return Map.of("status", "Relatório preparado. O usuário pode baixar o PDF pelo botão exibido no chat.");
    }

    private Map<String, Object> proporLancamento(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        TipoLancamento tipo = TipoLancamento.valueOf(textoObrigatorio(args, "tipo", "Tipo"));
        BigDecimal valor = valorPositivo(args, "valor", "Valor");
        LocalDate data = dataOuHoje(args, "data");
        String descricao = textoObrigatorio(args, "descricao", "Descrição");

        if (data.isAfter(hoje()))
            throw new IllegalArgumentException("A data do lançamento não pode ser futura");

        ContaFinanceiraResponseDto conta = resolverOuUnica(texto(args, "contaFinanceira"),
                contaFinanceiraService.select(), ContaFinanceiraResponseDto::nome, "Conta financeira");
        String categoriaInformada = texto(args, "categoria");
        CategoriaResponseDto categoria = categoriaInformada != null
                ? resolver(categoriaInformada, categoriaService.select(), CategoriaResponseDto::nome, "Categoria")
                : null;

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("tipo", tipo.name());
        corpo.put("contaFinanceiraId", conta.id());
        corpo.put("categoriaId", categoria != null ? categoria.id() : null);
        corpo.put("valor", valor);
        corpo.put("data", data.toString());
        corpo.put("descricao", limitar(descricao));

        List<AssistenteResumoItemDto> resumo = List.of(
                new AssistenteResumoItemDto("Tipo", tipo == TipoLancamento.ENTRADA ? "Entrada" : "Saída"),
                new AssistenteResumoItemDto("Valor", moeda(valor)),
                new AssistenteResumoItemDto("Data", data(data)),
                new AssistenteResumoItemDto("Descrição", descricao),
                new AssistenteResumoItemDto("Conta financeira", conta.nome()),
                new AssistenteResumoItemDto("Categoria", categoria != null ? categoria.nome() : "Sem categoria"));

        acoes.add(new AssistenteAcaoDto("CRIAR_LANCAMENTO", "Novo lançamento", resumo, Map.of("corpo", corpo)));
        return Map.of("status", "Lançamento preparado e aguardando confirmação do usuário no chat. Nada foi gravado ainda.");
    }

    private Map<String, Object> proporBaixaParcela(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        String tipo = textoObrigatorio(args, "tipo", "Tipo");
        UUID parcelaId = uuid(textoObrigatorio(args, "parcelaId", "Parcela"));
        boolean pagar = "PAGAR".equals(tipo);

        UUID formaPagamentoAtualId;
        String formaPagamentoAtualNome;
        String descricao;
        String pessoa;
        String numero;
        LocalDate vencimento;
        BigDecimal saldo;
        StatusConta status;

        if (pagar) {
            ContaPagarParcelaBaixaDto parcela = contaPagarService.findParcelaBaixa(parcelaId);
            formaPagamentoAtualId = parcela.formaPagamentoId();
            formaPagamentoAtualNome = parcela.formaPagamentoNome();
            descricao = parcela.descricao();
            pessoa = parcela.pessoaNome();
            numero = parcela.numeroParcela() + "/" + parcela.totalParcelas();
            vencimento = parcela.dataVencimento();
            saldo = parcela.saldo();
            status = parcela.status();
        } else {
            ContaReceberParcelaBaixaDto parcela = contaReceberService.findParcelaBaixa(parcelaId);
            formaPagamentoAtualId = parcela.formaPagamentoId();
            formaPagamentoAtualNome = parcela.formaPagamentoNome();
            descricao = parcela.descricao();
            pessoa = parcela.pessoaNome();
            numero = parcela.numeroParcela() + "/" + parcela.totalParcelas();
            vencimento = parcela.dataVencimento();
            saldo = parcela.saldo();
            status = parcela.status();
        }

        if (!emAberto(status))
            throw new IllegalArgumentException("A parcela não está em aberto");

        BigDecimal valor = args.get("valor") != null ? valorPositivo(args, "valor", "Valor") : saldo;
        BigDecimal juros = valorOuZero(args, "juros");
        BigDecimal multa = valorOuZero(args, "multa");
        BigDecimal desconto = valorOuZero(args, "desconto");
        LocalDate data = dataOuHoje(args, "data");

        if (data.isAfter(hoje()))
            throw new IllegalArgumentException("A data do pagamento não pode ser futura");
        if (valor.add(desconto).compareTo(saldo) > 0)
            throw new IllegalArgumentException("O valor informado é maior que o saldo da parcela (" + moeda(saldo) + ")");

        String formaInformada = texto(args, "formaPagamento");
        UUID formaPagamentoId = formaPagamentoAtualId;
        String formaPagamentoNome = formaPagamentoAtualNome;
        if (formaInformada != null || formaPagamentoId == null) {
            FormaPagamentoResponseDto forma = resolverOuUnica(formaInformada, formaPagamentoService.select(),
                    FormaPagamentoResponseDto::nome, "Forma de pagamento");
            formaPagamentoId = forma.id();
            formaPagamentoNome = forma.nome();
        }

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put(pagar ? "dataPagamento" : "dataRecebimento", data.toString());
        corpo.put("valor", valor);
        corpo.put("juros", juros);
        corpo.put("multa", multa);
        corpo.put("desconto", desconto);
        corpo.put("formaPagamentoId", formaPagamentoId);
        corpo.put("contaFinanceiraId", null);
        corpo.put("observacao", null);

        List<AssistenteResumoItemDto> resumo = new ArrayList<>(List.of(
                new AssistenteResumoItemDto(pagar ? "Fornecedor" : "Cliente", pessoa),
                new AssistenteResumoItemDto("Conta", descricao != null ? descricao : "Sem descrição"),
                new AssistenteResumoItemDto("Parcela", numero + " - vence em " + data(vencimento)),
                new AssistenteResumoItemDto("Saldo da parcela", moeda(saldo)),
                new AssistenteResumoItemDto(pagar ? "Valor pago" : "Valor recebido", moeda(valor)),
                new AssistenteResumoItemDto("Data", data(data)),
                new AssistenteResumoItemDto("Forma de pagamento", formaPagamentoNome)));
        if (juros.signum() > 0)
            resumo.add(new AssistenteResumoItemDto("Juros", moeda(juros)));
        if (multa.signum() > 0)
            resumo.add(new AssistenteResumoItemDto("Multa", moeda(multa)));
        if (desconto.signum() > 0)
            resumo.add(new AssistenteResumoItemDto("Desconto", moeda(desconto)));

        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("tipoConta", pagar ? "pagar" : "receber");
        dados.put("parcelaId", parcelaId);
        dados.put("corpo", corpo);

        acoes.add(new AssistenteAcaoDto("BAIXAR_PARCELA",
                pagar ? "Pagamento de parcela" : "Recebimento de parcela", resumo, dados));
        return Map.of("status", "Baixa da parcela preparada e aguardando confirmação do usuário no chat. Nada foi gravado ainda.");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> proporConta(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        String tipo = textoObrigatorio(args, "tipo", "Tipo");
        boolean pagar = "PAGAR".equals(tipo);
        PessoaResponseDto pessoa = resolver(textoObrigatorio(args, "pessoa", pagar ? "Fornecedor" : "Cliente"),
                pessoaService.select(), PessoaResponseDto::nome, pagar ? "Fornecedor" : "Cliente");
        String categoriaInformada = texto(args, "categoria");
        CategoriaResponseDto categoria = categoriaInformada != null
                ? resolver(categoriaInformada, categoriaService.select(), CategoriaResponseDto::nome, "Categoria")
                : null;
        String descricao = texto(args, "descricao");
        LocalDate dataEmissao = dataOuHoje(args, "dataEmissao");
        BigDecimal valorTotal = valorPositivo(args, "valorTotal", "Valor total");
        List<FormaPagamentoResponseDto> formas = formaPagamentoService.select();

        List<Map<String, Object>> parcelas = new ArrayList<>();
        List<String> descricaoParcelas = new ArrayList<>();
        Object parcelasInformadas = args.get("parcelas");

        if (parcelasInformadas instanceof List<?> lista && !lista.isEmpty()) {
            String formaPadrao = texto(args, "formaPagamento");
            for (Object item : lista) {
                Map<String, Object> parcela = (Map<String, Object>) item;
                String formaParcela = texto(parcela, "formaPagamento");
                FormaPagamentoResponseDto forma = resolverOuUnica(formaParcela != null ? formaParcela : formaPadrao,
                        formas, FormaPagamentoResponseDto::nome, "Forma de pagamento");
                adicionarParcela(parcelas, descricaoParcelas,
                        dataObrigatoria(parcela, "dataVencimento", "Vencimento da parcela"),
                        valorPositivo(parcela, "valor", "Valor da parcela"), forma);
            }
        } else {
            int quantidade = inteiro(args, "quantidadeParcelas", 1);
            if (quantidade < 1 || quantidade > 120)
                throw new IllegalArgumentException("Quantidade de parcelas deve estar entre 1 e 120");

            LocalDate primeiroVencimento = data(args, "primeiroVencimento");
            if (primeiroVencimento == null)
                throw new IllegalArgumentException("Informe o vencimento da primeira parcela");

            FormaPagamentoResponseDto forma = resolverOuUnica(texto(args, "formaPagamento"),
                    formas, FormaPagamentoResponseDto::nome, "Forma de pagamento");
            long totalCentavos = valorTotal.movePointRight(2).longValueExact();
            long parcelaCentavos = totalCentavos / quantidade;
            long parcelasComAjuste = totalCentavos - parcelaCentavos * quantidade;

            for (int indice = 0; indice < quantidade; indice++) {
                long centavos = parcelaCentavos + (indice >= quantidade - parcelasComAjuste ? 1 : 0);
                adicionarParcela(parcelas, descricaoParcelas, primeiroVencimento.plusMonths(indice),
                        BigDecimal.valueOf(centavos, 2), forma);
            }
        }

        BigDecimal soma = parcelas.stream()
                .map(parcela -> (BigDecimal) parcela.get("valor"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (soma.compareTo(valorTotal) != 0)
            throw new IllegalArgumentException("A soma das parcelas (" + moeda(soma) + ") deve ser igual ao valor total (" + moeda(valorTotal) + ")");
        if (parcelas.stream().anyMatch(parcela -> LocalDate.parse((String) parcela.get("dataVencimento")).isBefore(dataEmissao)))
            throw new IllegalArgumentException("O vencimento das parcelas não pode ser anterior à data de emissão");

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("pessoaId", pessoa.id());
        corpo.put("categoriaId", categoria != null ? categoria.id() : null);
        corpo.put("descricao", descricao != null ? limitar(descricao) : null);
        corpo.put("dataEmissao", dataEmissao.toString());
        corpo.put("valorTotal", valorTotal);
        corpo.put("observacao", null);
        corpo.put("ativo", true);
        corpo.put("parcelas", parcelas);

        List<AssistenteResumoItemDto> resumo = new ArrayList<>(List.of(
                new AssistenteResumoItemDto(pagar ? "Fornecedor" : "Cliente", pessoa.nome()),
                new AssistenteResumoItemDto("Descrição", descricao != null ? descricao : "Sem descrição"),
                new AssistenteResumoItemDto("Categoria", categoria != null ? categoria.nome() : "Sem categoria"),
                new AssistenteResumoItemDto("Emissão", data(dataEmissao)),
                new AssistenteResumoItemDto("Valor total", moeda(valorTotal))));
        for (int indice = 0; indice < descricaoParcelas.size(); indice++)
            resumo.add(new AssistenteResumoItemDto((indice + 1) + "ª parcela", descricaoParcelas.get(indice)));

        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("tipoConta", pagar ? "pagar" : "receber");
        dados.put("corpo", corpo);

        acoes.add(new AssistenteAcaoDto("CRIAR_CONTA",
                pagar ? "Nova conta a pagar" : "Nova conta a receber", resumo, dados));
        return Map.of("status", "Conta preparada e aguardando confirmação do usuário no chat. Nada foi gravado ainda.");
    }

    private Map<String, Object> proporTransferencia(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        List<ContaFinanceiraResponseDto> contas = contaFinanceiraService.select();
        ContaFinanceiraResponseDto origem = resolver(textoObrigatorio(args, "contaOrigem", "Conta de origem"),
                contas, ContaFinanceiraResponseDto::nome, "Conta de origem");
        ContaFinanceiraResponseDto destino = resolver(textoObrigatorio(args, "contaDestino", "Conta de destino"),
                contas, ContaFinanceiraResponseDto::nome, "Conta de destino");
        BigDecimal valor = valorPositivo(args, "valor", "Valor");
        LocalDate data = dataOuHoje(args, "data");
        String descricao = texto(args, "descricao");

        if (origem.id().equals(destino.id()))
            throw new IllegalArgumentException("A conta de origem e a de destino devem ser diferentes");
        if (data.isAfter(hoje()))
            throw new IllegalArgumentException("A data da transferência não pode ser futura");

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("contaOrigemId", origem.id());
        corpo.put("contaDestinoId", destino.id());
        corpo.put("valor", valor);
        corpo.put("data", data.toString());
        corpo.put("descricao", descricao != null ? limitar(descricao) : null);

        List<AssistenteResumoItemDto> resumo = List.of(
                new AssistenteResumoItemDto("Origem", origem.nome()),
                new AssistenteResumoItemDto("Destino", destino.nome()),
                new AssistenteResumoItemDto("Valor", moeda(valor)),
                new AssistenteResumoItemDto("Data", data(data)),
                new AssistenteResumoItemDto("Descrição", descricao != null ? descricao : "Sem descrição"));

        acoes.add(new AssistenteAcaoDto("CRIAR_TRANSFERENCIA", "Nova transferência", resumo, Map.of("corpo", corpo)));
        return Map.of("status", "Transferência preparada e aguardando confirmação do usuário no chat. Nada foi gravado ainda.");
    }

    private Map<String, Object> proporContaFinanceira(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        String nome = nomeCadastro(args, 150);
        String tipoInformado = texto(args, "tipo");
        TipoContaFinanceira tipo = tipoInformado != null ? TipoContaFinanceira.valueOf(tipoInformado) : TipoContaFinanceira.CORRENTE;
        garantirNomeLivre(nome, contaFinanceiraService.select(), ContaFinanceiraResponseDto::nome, "uma conta financeira");

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("nome", nome);
        corpo.put("tipo", tipo.name());
        corpo.put("ativo", true);

        List<AssistenteResumoItemDto> resumo = List.of(
                new AssistenteResumoItemDto("Nome", nome),
                new AssistenteResumoItemDto("Tipo", descricaoTipoConta(tipo)));

        acoes.add(new AssistenteAcaoDto("CRIAR_CONTA_FINANCEIRA", "Nova conta financeira", resumo, Map.of("corpo", corpo)));
        return Map.of("status", "Conta financeira preparada e aguardando confirmação do usuário no chat. Nada foi gravado ainda. Ela só poderá ser usada em lançamentos depois de confirmada.");
    }

    private Map<String, Object> proporFormaPagamento(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        String nome = nomeCadastro(args, 150);
        garantirNomeLivre(nome, formaPagamentoService.select(), FormaPagamentoResponseDto::nome, "uma forma de pagamento");
        ContaFinanceiraResponseDto conta = resolverOuUnica(texto(args, "contaFinanceira"),
                contaFinanceiraService.select(), ContaFinanceiraResponseDto::nome, "Conta financeira");

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("nome", nome);
        corpo.put("contaFinanceiraId", conta.id());
        corpo.put("ativo", true);

        List<AssistenteResumoItemDto> resumo = List.of(
                new AssistenteResumoItemDto("Nome", nome),
                new AssistenteResumoItemDto("Conta financeira", conta.nome()));

        acoes.add(new AssistenteAcaoDto("CRIAR_FORMA_PAGAMENTO", "Nova forma de pagamento", resumo, Map.of("corpo", corpo)));
        return Map.of("status", "Forma de pagamento preparada e aguardando confirmação do usuário no chat. Nada foi gravado ainda.");
    }

    private Map<String, Object> proporCategoria(Map<String, Object> args, List<AssistenteAcaoDto> acoes) {
        String nome = nomeCadastro(args, 100);
        String descricao = texto(args, "descricao");
        garantirNomeLivre(nome, categoriaService.select(), CategoriaResponseDto::nome, "uma categoria");

        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("nome", nome);
        corpo.put("descricao", descricao != null ? limitar(descricao) : null);
        corpo.put("ativo", true);

        List<AssistenteResumoItemDto> resumo = List.of(
                new AssistenteResumoItemDto("Nome", nome),
                new AssistenteResumoItemDto("Descrição", descricao != null ? descricao : "Sem descrição"));

        acoes.add(new AssistenteAcaoDto("CRIAR_CATEGORIA", "Nova categoria", resumo, Map.of("corpo", corpo)));
        return Map.of("status", "Categoria preparada e aguardando confirmação do usuário no chat. Nada foi gravado ainda.");
    }

    private String nomeCadastro(Map<String, Object> args, int tamanhoMaximo) {
        String nome = textoObrigatorio(args, "nome", "Nome");
        if (nome.length() > tamanhoMaximo)
            throw new IllegalArgumentException("Nome deve ter no máximo " + tamanhoMaximo + " caracteres");
        return nome;
    }

    private <T> void garantirNomeLivre(String nome, List<T> existentes, Function<T, String> nomeExistente, String rotulo) {
        String alvo = normalizar(nome);
        existentes.stream()
                .filter(existente -> normalizar(nomeExistente.apply(existente)).equals(alvo))
                .findFirst()
                .ifPresent(existente -> {
                    throw new IllegalArgumentException("Já existe " + rotulo + " com o nome \"" + nomeExistente.apply(existente) + "\"");
                });
    }

    private static String descricaoTipoConta(TipoContaFinanceira tipo) {
        return switch (tipo) {
            case CORRENTE -> "Conta corrente";
            case POUPANCA -> "Poupança";
            case CAIXA -> "Caixa";
            case CARTEIRA -> "Carteira";
        };
    }

    private void adicionarParcela(
            List<Map<String, Object>> parcelas,
            List<String>              descricaoParcelas,
            LocalDate                 dataVencimento,
            BigDecimal                valor,
            FormaPagamentoResponseDto forma
    ) {
        Map<String, Object> parcela = new LinkedHashMap<>();
        parcela.put("dataVencimento", dataVencimento.toString());
        parcela.put("valor", valor);
        parcela.put("formaPagamentoId", forma.id());
        parcela.put("observacao", null);
        parcelas.add(parcela);
        descricaoParcelas.add(data(dataVencimento) + " - " + moeda(valor) + " (" + forma.nome() + ")");
    }

    private Map<String, Object> mapaParcela(
            String      tipo,
            UUID        id,
            String      descricao,
            String      pessoa,
            Integer     numeroParcela,
            Integer     totalParcelas,
            LocalDate   dataVencimento,
            BigDecimal  valor,
            BigDecimal  saldo,
            String      formaPagamento,
            StatusConta status
    ) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("parcelaId", id.toString());
        item.put("tipo", tipo);
        item.put("descricao", descricao);
        item.put("pessoa", pessoa);
        item.put("parcela", numeroParcela + "/" + totalParcelas);
        item.put("vencimento", data(dataVencimento));
        item.put("vencida", dataVencimento.isBefore(hoje()));
        item.put("valor", moeda(valor));
        item.put("saldo", moeda(saldo));
        item.put("formaPagamento", formaPagamento);
        item.put("status", status.name());
        return item;
    }

    private Map<String, Object> mapaConta(
            String      descricao,
            String      pessoa,
            String      categoria,
            LocalDate   dataEmissao,
            BigDecimal  valorTotal,
            StatusConta status,
            int         quantidadeParcelas
    ) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("descricao", descricao);
        item.put("pessoa", pessoa);
        item.put("categoria", categoria);
        item.put("dataEmissao", data(dataEmissao));
        item.put("valorTotal", moeda(valorTotal));
        item.put("status", status.name());
        item.put("parcelas", quantidadeParcelas);
        return item;
    }

    private <T> T resolverOuUnica(String informado, List<T> opcoes, Function<T, String> nome, String rotulo) {
        if (informado == null && opcoes.size() == 1)
            return opcoes.getFirst();
        if (informado == null)
            throw new IllegalArgumentException(rotulo + " não informada. Opções disponíveis: " + nomes(opcoes, nome));
        return resolver(informado, opcoes, nome, rotulo);
    }

    private <T> T resolver(String informado, List<T> opcoes, Function<T, String> nome, String rotulo) {
        String alvo = normalizar(informado);

        List<T> exatos = opcoes.stream().filter(opcao -> normalizar(nome.apply(opcao)).equals(alvo)).toList();
        if (exatos.size() == 1)
            return exatos.getFirst();

        List<T> parciais = opcoes.stream()
                .filter(opcao -> {
                    String atual = normalizar(nome.apply(opcao));
                    return atual.contains(alvo) || alvo.contains(atual);
                })
                .toList();
        if (parciais.size() == 1)
            return parciais.getFirst();

        if (parciais.isEmpty())
            throw new IllegalArgumentException(rotulo + " \"" + informado + "\" não encontrada. Opções disponíveis: " + nomes(opcoes, nome));

        throw new IllegalArgumentException("Mais de uma opção encontrada para " + rotulo.toLowerCase() + " \"" + informado + "\": " + nomes(parciais, nome));
    }

    private <T> String nomes(List<T> opcoes, Function<T, String> nome) {
        return opcoes.isEmpty() ? "nenhuma cadastrada" : String.join(", ", opcoes.stream().map(nome).toList());
    }

    private static String normalizar(String valor) {
        return Normalizer.normalize(valor == null ? "" : valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }

    private static boolean emAberto(StatusConta status) {
        return status == StatusConta.ABERTO || status == StatusConta.PARCIALMENTE_PAGO;
    }

    public static LocalDate hoje() {
        return LocalDate.now(FUSO_HORARIO);
    }

    public static String moeda(BigDecimal valor) {
        return NumberFormat.getCurrencyInstance(Locale.of("pt", "BR"))
                .format(valor != null ? valor : BigDecimal.ZERO)
                .replace(' ', ' ');
    }

    public static String data(LocalDate data) {
        return data != null ? data.format(FORMATO_DATA) : "";
    }

    public static String periodo(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio != null && dataFim != null)
            return data(dataInicio) + " a " + data(dataFim);
        if (dataInicio != null)
            return "A partir de " + data(dataInicio);
        if (dataFim != null)
            return "Até " + data(dataFim);
        return "Todo o período";
    }

    public static String descricaoTipo(String tipo) {
        return switch (tipo) {
            case "PAGAR" -> "Contas a pagar";
            case "RECEBER" -> "Contas a receber";
            case "AMBOS" -> "Contas a pagar e a receber";
            case "ENTRADA" -> "Entradas";
            case "SAIDA" -> "Saídas";
            default -> tipo;
        };
    }

    private static String limitar(String texto) {
        return texto.length() > 255 ? texto.substring(0, 255) : texto;
    }

    private static String texto(Map<String, Object> args, String campo) {
        Object valor = args.get(campo);
        if (valor == null)
            return null;
        String texto = valor.toString().trim();
        return texto.isEmpty() ? null : texto;
    }

    private static String textoObrigatorio(Map<String, Object> args, String campo, String rotulo) {
        String texto = texto(args, campo);
        if (texto == null)
            throw new IllegalArgumentException(rotulo + " é obrigatório");
        return texto;
    }

    private static LocalDate data(Map<String, Object> args, String campo) {
        String texto = texto(args, campo);
        if (texto == null)
            return null;
        try {
            return LocalDate.parse(texto);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Data inválida em " + campo + ": use o formato AAAA-MM-DD");
        }
    }

    private static LocalDate dataOuHoje(Map<String, Object> args, String campo) {
        LocalDate data = data(args, campo);
        return data != null ? data : hoje();
    }

    private static LocalDate dataObrigatoria(Map<String, Object> args, String campo, String rotulo) {
        LocalDate data = data(args, campo);
        if (data == null)
            throw new IllegalArgumentException(rotulo + " é obrigatório");
        return data;
    }

    private static BigDecimal valor(Map<String, Object> args, String campo) {
        Object valor = args.get(campo);
        if (valor == null)
            return null;
        try {
            BigDecimal numero = valor instanceof Number n
                    ? new BigDecimal(n.toString())
                    : new BigDecimal(valor.toString().replace("R$", "").replace(" ", "").replace(",", "."));
            return numero.setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Valor inválido em " + campo);
        }
    }

    private static BigDecimal valorPositivo(Map<String, Object> args, String campo, String rotulo) {
        BigDecimal valor = valor(args, campo);
        if (valor == null || valor.signum() <= 0)
            throw new IllegalArgumentException(rotulo + " deve ser maior que zero");
        return valor;
    }

    private static BigDecimal valorOuZero(Map<String, Object> args, String campo) {
        BigDecimal valor = valor(args, campo);
        if (valor != null && valor.signum() < 0)
            throw new IllegalArgumentException("Valor de " + campo + " não pode ser negativo");
        return valor != null ? valor : BigDecimal.ZERO.setScale(2);
    }

    private static int inteiro(Map<String, Object> args, String campo, int padrao) {
        Object valor = args.get(campo);
        if (valor == null)
            return padrao;
        try {
            return valor instanceof Number n ? n.intValue() : Integer.parseInt(valor.toString().trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Número inválido em " + campo);
        }
    }

    private static UUID uuid(String valor) {
        try {
            return UUID.fromString(valor);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("ID de parcela inválido. Consulte os vencimentos para obter o parcelaId.");
        }
    }

    private static FunctionDeclaration funcao(String nome, String descricao, Schema parametros) {
        FunctionDeclaration.Builder builder = FunctionDeclaration.builder().name(nome).description(descricao);
        if (parametros != null)
            builder.parameters(parametros);
        return builder.build();
    }

    private static Schema objeto(Map<String, Schema> propriedades, String... obrigatorios) {
        Schema.Builder builder = Schema.builder().type(Type.Known.OBJECT).properties(propriedades);
        if (obrigatorios.length > 0)
            builder.required(obrigatorios);
        return builder.build();
    }

    private static Schema texto(String descricao) {
        return Schema.builder().type(Type.Known.STRING).description(descricao).build();
    }

    private static Schema numero(String descricao) {
        return Schema.builder().type(Type.Known.NUMBER).description(descricao).build();
    }

    private static Schema inteiro(String descricao) {
        return Schema.builder().type(Type.Known.INTEGER).description(descricao).build();
    }

    private static Schema enumeracao(String descricao, String... valores) {
        return Schema.builder().type(Type.Known.STRING).description(descricao).enum_(valores).build();
    }

    private static Schema lista(String descricao, Schema itens) {
        return Schema.builder().type(Type.Known.ARRAY).description(descricao).items(itens).build();
    }
}
