package com.mpt.financecontrol.relatorio.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.mpt.financecontrol.assistente.service.AssistenteFerramentas;
import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraSaldoDto;
import com.mpt.financecontrol.contafinanceira.service.ContaFinanceiraService;
import com.mpt.financecontrol.contapagarparcela.dtos.ContaPagarParcelaBaixaDto;
import com.mpt.financecontrol.contareceberparcela.dtos.ContaReceberParcelaBaixaDto;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.dtos.LancamentoFinanceiroResponseDto;
import com.mpt.financecontrol.lancamentofinanceiro.service.LancamentoFinanceiroService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static com.mpt.financecontrol.assistente.service.AssistenteFerramentas.data;
import static com.mpt.financecontrol.assistente.service.AssistenteFerramentas.moeda;

@Service
public class RelatorioService {

    private static final Color COR_CABECALHO = new Color(5, 150, 105);
    private static final Color COR_LINHA = new Color(243, 244, 246);
    private static final Font FONTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font FONTE_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
    private static final Font FONTE_CABECALHO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font FONTE_TEXTO = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final Font FONTE_TOTAL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

    private final AssistenteFerramentas       ferramentas;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final ContaFinanceiraService      contaFinanceiraService;

    public RelatorioService(
            AssistenteFerramentas       ferramentas,
            LancamentoFinanceiroService lancamentoFinanceiroService,
            ContaFinanceiraService      contaFinanceiraService
    ) {
        this.ferramentas                 = ferramentas;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.contaFinanceiraService      = contaFinanceiraService;
    }

    public byte[] vencimentos(String tipo, LocalDate dataInicio, LocalDate dataFim) {
        String tipoRelatorio = tipo != null ? tipo : "AMBOS";
        List<String[]> linhas = new ArrayList<>();
        List<LinhaVencimento> vencimentos = new ArrayList<>();
        BigDecimal totalPagar = BigDecimal.ZERO;
        BigDecimal totalReceber = BigDecimal.ZERO;

        if (!"RECEBER".equals(tipoRelatorio)) {
            for (ContaPagarParcelaBaixaDto parcela : ferramentas.parcelasPagarEmAberto(dataInicio, dataFim)) {
                vencimentos.add(new LinhaVencimento(parcela.dataVencimento(), "Pagar", parcela.pessoaNome(),
                        parcela.descricao(), parcela.numeroParcela() + "/" + parcela.totalParcelas(), parcela.saldo()));
                totalPagar = totalPagar.add(parcela.saldo());
            }
        }

        if (!"PAGAR".equals(tipoRelatorio)) {
            for (ContaReceberParcelaBaixaDto parcela : ferramentas.parcelasReceberEmAberto(dataInicio, dataFim)) {
                vencimentos.add(new LinhaVencimento(parcela.dataVencimento(), "Receber", parcela.pessoaNome(),
                        parcela.descricao(), parcela.numeroParcela() + "/" + parcela.totalParcelas(), parcela.saldo()));
                totalReceber = totalReceber.add(parcela.saldo());
            }
        }

        vencimentos.sort(Comparator.comparing(LinhaVencimento::vencimento));
        for (LinhaVencimento vencimento : vencimentos) {
            linhas.add(new String[]{
                    data(vencimento.vencimento()),
                    vencimento.tipo(),
                    vencimento.pessoa(),
                    vencimento.descricao() != null ? vencimento.descricao() : "-",
                    vencimento.parcela(),
                    moeda(vencimento.saldo())
            });
        }

        List<String> totais = new ArrayList<>();
        if (!"RECEBER".equals(tipoRelatorio))
            totais.add("Total a pagar: " + moeda(totalPagar));
        if (!"PAGAR".equals(tipoRelatorio))
            totais.add("Total a receber: " + moeda(totalReceber));

        return gerar("Relatório de vencimentos",
                AssistenteFerramentas.descricaoTipo(tipoRelatorio) + " | " + AssistenteFerramentas.periodo(dataInicio, dataFim),
                new String[]{"Vencimento", "Tipo", "Pessoa", "Descrição", "Parcela", "Saldo"},
                new float[]{1.3f, 1f, 2.4f, 2.6f, 1f, 1.5f},
                linhas,
                totais);
    }

    public byte[] lancamentos(TipoLancamento tipo, LocalDate dataInicio, LocalDate dataFim) {
        List<LancamentoFinanceiroResponseDto> lancamentos = lancamentoFinanceiroService.getAll(
                        PageRequest.of(0, 1000, Sort.by(Sort.Direction.ASC, "data")),
                        null, tipo, null, dataInicio, dataFim, null, null)
                .getContent();

        BigDecimal totalEntradas = BigDecimal.ZERO;
        BigDecimal totalSaidas = BigDecimal.ZERO;
        List<String[]> linhas = new ArrayList<>();

        for (LancamentoFinanceiroResponseDto lancamento : lancamentos) {
            if (lancamento.tipo() == TipoLancamento.ENTRADA)
                totalEntradas = totalEntradas.add(lancamento.valor());
            else
                totalSaidas = totalSaidas.add(lancamento.valor());

            linhas.add(new String[]{
                    data(lancamento.data()),
                    lancamento.tipo() == TipoLancamento.ENTRADA ? "Entrada" : "Saída",
                    lancamento.descricao() != null ? lancamento.descricao() : "-",
                    lancamento.categoriaNome() != null ? lancamento.categoriaNome() : "-",
                    lancamento.contaFinanceiraNome(),
                    moeda(lancamento.valor())
            });
        }

        List<String> totais = new ArrayList<>();
        if (tipo != TipoLancamento.SAIDA)
            totais.add("Total de entradas: " + moeda(totalEntradas));
        if (tipo != TipoLancamento.ENTRADA)
            totais.add("Total de saídas: " + moeda(totalSaidas));
        if (tipo == null)
            totais.add("Resultado: " + moeda(totalEntradas.subtract(totalSaidas)));

        return gerar("Relatório de lançamentos",
                (tipo != null ? AssistenteFerramentas.descricaoTipo(tipo.name()) : "Entradas e saídas")
                        + " | " + AssistenteFerramentas.periodo(dataInicio, dataFim),
                new String[]{"Data", "Tipo", "Descrição", "Categoria", "Conta", "Valor"},
                new float[]{1.2f, 1f, 2.8f, 1.8f, 1.8f, 1.4f},
                linhas,
                totais);
    }

    public byte[] saldos() {
        List<ContaFinanceiraSaldoDto> saldos = contaFinanceiraService.saldos();
        BigDecimal total = BigDecimal.ZERO;
        List<String[]> linhas = new ArrayList<>();

        for (ContaFinanceiraSaldoDto saldo : saldos) {
            total = total.add(saldo.saldo());
            linhas.add(new String[]{saldo.nome(), saldo.tipo().name(), moeda(saldo.saldo())});
        }

        return gerar("Relatório de saldos",
                "Posição em " + data(AssistenteFerramentas.hoje()),
                new String[]{"Conta financeira", "Tipo", "Saldo"},
                new float[]{3f, 1.5f, 1.5f},
                linhas,
                List.of("Saldo total: " + moeda(total)));
    }

    private byte[] gerar(
            String         titulo,
            String         subtitulo,
            String[]       colunas,
            float[]        larguras,
            List<String[]> linhas,
            List<String>   totais
    ) {
        try (ByteArrayOutputStream saida = new ByteArrayOutputStream()) {
            Document documento = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(documento, saida);
            documento.open();

            documento.add(new Paragraph("Finance Control - " + titulo, FONTE_TITULO));
            documento.add(new Paragraph(subtitulo, FONTE_SUBTITULO));
            documento.add(new Paragraph("Gerado em " + LocalDateTime.now(AssistenteFerramentas.FUSO_HORARIO)
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), FONTE_SUBTITULO));

            PdfPTable tabela = new PdfPTable(larguras);
            tabela.setWidthPercentage(100);
            tabela.setSpacingBefore(14);
            tabela.setHeaderRows(1);

            for (String coluna : colunas) {
                PdfPCell celula = new PdfPCell(new Phrase(coluna, FONTE_CABECALHO));
                celula.setBackgroundColor(COR_CABECALHO);
                celula.setPadding(5);
                tabela.addCell(celula);
            }

            if (linhas.isEmpty()) {
                PdfPCell celula = new PdfPCell(new Phrase("Nenhum registro encontrado", FONTE_TEXTO));
                celula.setColspan(colunas.length);
                celula.setHorizontalAlignment(Element.ALIGN_CENTER);
                celula.setPadding(8);
                tabela.addCell(celula);
            }

            for (int indice = 0; indice < linhas.size(); indice++) {
                String[] linha = linhas.get(indice);
                for (int coluna = 0; coluna < linha.length; coluna++) {
                    PdfPCell celula = new PdfPCell(new Phrase(linha[coluna], FONTE_TEXTO));
                    celula.setPadding(4);
                    if (indice % 2 == 1)
                        celula.setBackgroundColor(COR_LINHA);
                    if (coluna == linha.length - 1)
                        celula.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    tabela.addCell(celula);
                }
            }

            documento.add(tabela);

            for (String total : totais) {
                Paragraph paragrafo = new Paragraph(total, FONTE_TOTAL);
                paragrafo.setAlignment(Element.ALIGN_RIGHT);
                paragrafo.setSpacingBefore(6);
                documento.add(paragrafo);
            }

            documento.close();
            return saida.toByteArray();
        } catch (Exception e) {
            throw new BadRequestException("Não foi possível gerar o relatório");
        }
    }

    private record LinhaVencimento(
            LocalDate  vencimento,
            String     tipo,
            String     pessoa,
            String     descricao,
            String     parcela,
            BigDecimal saldo
    ) {}
}
