package com.mpt.financecontrol.dashboard.service;

import com.mpt.financecontrol.contafinanceira.dtos.ContaFinanceiraSaldoDto;
import com.mpt.financecontrol.contafinanceira.entity.ContaFinanceira;
import com.mpt.financecontrol.contafinanceira.repository.ContaFinanceiraRepository;
import com.mpt.financecontrol.dashboard.dtos.DashboardCategoriaValorDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardLancamentoDiarioDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardPatrimonioDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardReceitasDespesasMensalDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardResumoDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaAtualDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaDiarioDto;
import com.mpt.financecontrol.dashboard.dtos.DashboardSaldoContaMensalDto;
import com.mpt.financecontrol.exceptions.BadRequestException;
import com.mpt.financecontrol.financeiro.TipoContaFinanceira;
import com.mpt.financecontrol.financeiro.TipoLancamento;
import com.mpt.financecontrol.lancamentofinanceiro.repository.LancamentoFinanceiroRepository;
import com.mpt.financecontrol.tenant.entity.Tenant;
import com.mpt.financecontrol.usuario.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private LancamentoFinanceiroRepository lancamentoRepository;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private ContaFinanceiraRepository contaFinanceiraRepository;

    @InjectMocks
    private DashboardService service;

    private UUID tenantId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
    }

    private void logarTenant() {
        Tenant tenant = new Tenant();
        ReflectionTestUtils.setField(tenant, "id", tenantId);
        when(usuarioService.getTenantLogado()).thenReturn(tenant);
    }

    private ContaFinanceira novaConta(UUID id, String nome) {
        ContaFinanceira conta = new ContaFinanceira();
        conta.setNome(nome);
        ReflectionTestUtils.setField(conta, "id", id);
        return conta;
    }

    @Test
    @DisplayName("buscarResumo: calcula o saldo do mês pela diferença entre receitas e despesas")
    void buscarResumo_calculaSaldoDoMes() {
        logarTenant();
        YearMonth mes = YearMonth.of(2026, 10);
        when(lancamentoRepository.findTotalPorTipoNoPeriodo(
                tenantId, TipoLancamento.ENTRADA, mes.atDay(1), mes.atEndOfMonth()))
                .thenReturn(new BigDecimal("3530.00"));
        when(lancamentoRepository.findTotalPorTipoNoPeriodo(
                tenantId, TipoLancamento.SAIDA, mes.atDay(1), mes.atEndOfMonth()))
                .thenReturn(new BigDecimal("1233.00"));
        when(lancamentoRepository.findSaldoTotalDasContasAtivasAteData(eq(tenantId), any(LocalDate.class)))
                .thenReturn(new BigDecimal("2297.00"));

        DashboardResumoDto resumo = service.buscarResumo(mes);

        assertThat(resumo.mes()).isEqualTo(mes);
        assertThat(resumo.receitasMes()).isEqualByComparingTo("3530.00");
        assertThat(resumo.despesasMes()).isEqualByComparingTo("1233.00");
        assertThat(resumo.saldoMes()).isEqualByComparingTo("2297.00");
        assertThat(resumo.saldoTotal()).isEqualByComparingTo("2297.00");
    }

    @Test
    @DisplayName("buscarResumo: quando não há lançamentos, retorna tudo zerado")
    void buscarResumo_semLancamentos_retornaZero() {
        logarTenant();

        DashboardResumoDto resumo = service.buscarResumo(YearMonth.of(2026, 10));

        assertThat(resumo.receitasMes()).isEqualByComparingTo("0");
        assertThat(resumo.despesasMes()).isEqualByComparingTo("0");
        assertThat(resumo.saldoMes()).isEqualByComparingTo("0");
        assertThat(resumo.saldoTotal()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("buscarReceitasDespesas: soma os dias de cada mês e inclui meses sem lançamento")
    void buscarReceitasDespesas_agrupaPorMes() {
        logarTenant();
        LocalDate inicio = LocalDate.of(2026, 8, 1);
        LocalDate fim = LocalDate.of(2026, 10, 31);
        when(lancamentoRepository.findTotaisDiariosDasContasAtivasPorTipoNoPeriodo(tenantId, inicio, fim))
                .thenReturn(List.of(
                        new DashboardLancamentoDiarioDto(
                                LocalDate.of(2026, 10, 5), TipoLancamento.ENTRADA, new BigDecimal("3000")),
                        new DashboardLancamentoDiarioDto(
                                LocalDate.of(2026, 10, 20), TipoLancamento.ENTRADA, new BigDecimal("530")),
                        new DashboardLancamentoDiarioDto(
                                LocalDate.of(2026, 10, 25), TipoLancamento.SAIDA, new BigDecimal("1233"))));

        List<DashboardReceitasDespesasMensalDto> resultado = service.buscarReceitasDespesas(inicio, fim);

        assertThat(resultado).extracting(DashboardReceitasDespesasMensalDto::anoMes)
                .containsExactly(YearMonth.of(2026, 8), YearMonth.of(2026, 9), YearMonth.of(2026, 10));
        assertThat(resultado.get(0).receitas()).isEqualByComparingTo("0");
        assertThat(resultado.get(1).despesas()).isEqualByComparingTo("0");
        assertThat(resultado.get(2).receitas()).isEqualByComparingTo("3530");
        assertThat(resultado.get(2).despesas()).isEqualByComparingTo("1233");
    }

    @Test
    @DisplayName("buscarReceitasDespesas: rejeita data inicial posterior à final")
    void buscarReceitasDespesas_periodoInvertido_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarReceitasDespesas(
                LocalDate.of(2026, 10, 31), LocalDate.of(2026, 10, 1)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("buscarReceitasDespesas: rejeita período maior que 24 meses")
    void buscarReceitasDespesas_periodoMaiorQue24Meses_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarReceitasDespesas(
                LocalDate.of(2024, 10, 1), LocalDate.of(2026, 10, 31)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("buscarTotaisPorCategoria: consulta apenas contas ativas do tipo informado")
    void buscarTotaisPorCategoria_usaContasAtivas() {
        logarTenant();
        LocalDate inicio = LocalDate.of(2026, 8, 1);
        LocalDate fim = LocalDate.of(2026, 10, 31);
        List<DashboardCategoriaValorDto> totais = List.of(
                new DashboardCategoriaValorDto("Moradia", new BigDecimal("1200")),
                new DashboardCategoriaValorDto("Sem categoria", new BigDecimal("950")));
        when(lancamentoRepository.findTotaisPorCategoriaDasContasAtivasNoPeriodo(
                tenantId, TipoLancamento.SAIDA, inicio, fim)).thenReturn(totais);

        List<DashboardCategoriaValorDto> resultado =
                service.buscarTotaisPorCategoria(TipoLancamento.SAIDA, inicio, fim);

        assertThat(resultado).isEqualTo(totais);
    }

    @Test
    @DisplayName("buscarTotaisPorCategoria: rejeita período maior que 24 meses")
    void buscarTotaisPorCategoria_periodoMaiorQue24Meses_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarTotaisPorCategoria(
                TipoLancamento.ENTRADA, LocalDate.of(2024, 10, 1), LocalDate.of(2026, 10, 31)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("buscarSaldoAtualPorConta: devolve o saldo atual de cada conta")
    void buscarSaldoAtualPorConta_mapeiaSaldos() {
        logarTenant();
        UUID carteiraId = UUID.randomUUID();
        UUID correnteId = UUID.randomUUID();
        when(lancamentoRepository.findSaldos(tenantId)).thenReturn(List.of(
                new ContaFinanceiraSaldoDto(carteiraId, "Carteira", TipoContaFinanceira.CARTEIRA, new BigDecimal("-5")),
                new ContaFinanceiraSaldoDto(correnteId, "Corrente", TipoContaFinanceira.CORRENTE, new BigDecimal("2152"))));

        List<DashboardSaldoContaAtualDto> resultado = service.buscarSaldoAtualPorConta();

        assertThat(resultado).extracting(DashboardSaldoContaAtualDto::contaId)
                .containsExactly(carteiraId, correnteId);
        assertThat(resultado).extracting(DashboardSaldoContaAtualDto::conta)
                .containsExactly("Carteira", "Corrente");
        assertThat(resultado.get(0).saldo()).isEqualByComparingTo("-5");
        assertThat(resultado.get(1).saldo()).isEqualByComparingTo("2152");
    }

    @Test
    @DisplayName("buscarSaldosPorConta: soma a movimentação de cada conta por mês e zera quem não movimentou")
    void buscarSaldosPorConta_somaMovimentacaoPorMes() {
        logarTenant();
        UUID carteiraId = UUID.randomUUID();
        UUID correnteId = UUID.randomUUID();
        LocalDate inicio = LocalDate.of(2026, 9, 1);
        LocalDate fim = LocalDate.of(2026, 10, 31);
        when(contaFinanceiraRepository.findForSelect(tenantId)).thenReturn(List.of(
                novaConta(carteiraId, "Carteira"), novaConta(correnteId, "Corrente")));
        when(lancamentoRepository.findMovimentacoesDiariasPorContaNoPeriodo(tenantId, inicio, fim))
                .thenReturn(List.of(
                        new DashboardSaldoContaDiarioDto(
                                correnteId, "Corrente", LocalDate.of(2026, 10, 5), new BigDecimal("3000")),
                        new DashboardSaldoContaDiarioDto(
                                correnteId, "Corrente", LocalDate.of(2026, 10, 25), new BigDecimal("-848")),
                        new DashboardSaldoContaDiarioDto(
                                carteiraId, "Carteira", LocalDate.of(2026, 10, 7), new BigDecimal("-5"))));

        List<DashboardSaldoContaMensalDto> resultado = service.buscarSaldosPorConta(inicio, fim);

        assertThat(resultado).hasSize(4);
        assertThat(resultado).filteredOn(item -> item.anoMes().equals(YearMonth.of(2026, 9)))
                .allSatisfy(item -> assertThat(item.saldo()).isEqualByComparingTo("0"));
        assertThat(resultado).filteredOn(item -> item.anoMes().equals(YearMonth.of(2026, 10))
                        && item.contaId().equals(correnteId))
                .singleElement()
                .satisfies(item -> assertThat(item.saldo()).isEqualByComparingTo("2152"));
        assertThat(resultado).filteredOn(item -> item.anoMes().equals(YearMonth.of(2026, 10))
                        && item.contaId().equals(carteiraId))
                .singleElement()
                .satisfies(item -> assertThat(item.saldo()).isEqualByComparingTo("-5"));
    }

    @Test
    @DisplayName("buscarPatrimonio: sem lançamentos, retorna listas vazias")
    void buscarPatrimonio_semLancamentos_retornaVazio() {
        logarTenant();
        when(lancamentoRepository.findPrimeiraDataDasContasAtivas(tenantId)).thenReturn(null);

        DashboardPatrimonioDto resultado = service.buscarPatrimonio(LocalDate.now().getYear());

        assertThat(resultado.anosDisponiveis()).isEmpty();
        assertThat(resultado.meses()).isEmpty();
    }

    @Test
    @DisplayName("buscarPatrimonio: acumula o saldo mês a mês e informa os anos disponíveis")
    void buscarPatrimonio_acumulaSaldoMesAMes() {
        logarTenant();
        int anoAtual = LocalDate.now().getYear();
        int ano = anoAtual - 1;
        LocalDate primeiraData = LocalDate.of(ano, 11, 10);
        when(lancamentoRepository.findPrimeiraDataDasContasAtivas(tenantId)).thenReturn(primeiraData);
        when(lancamentoRepository.findTotaisDiariosDasContasAtivasPorTipoNoPeriodo(
                eq(tenantId), eq(primeiraData), eq(LocalDate.of(ano, 12, 31))))
                .thenReturn(List.of(
                        new DashboardLancamentoDiarioDto(
                                LocalDate.of(ano, 11, 10), TipoLancamento.ENTRADA, new BigDecimal("1000")),
                        new DashboardLancamentoDiarioDto(
                                LocalDate.of(ano, 12, 5), TipoLancamento.SAIDA, new BigDecimal("300"))));

        DashboardPatrimonioDto resultado = service.buscarPatrimonio(ano);

        assertThat(resultado.anosDisponiveis()).containsExactly(ano, anoAtual);
        assertThat(resultado.meses()).hasSize(2);
        assertThat(resultado.meses().get(0).anoMes()).isEqualTo(YearMonth.of(ano, 11));
        assertThat(resultado.meses().get(0).patrimonio()).isEqualByComparingTo("1000");
        assertThat(resultado.meses().get(0).variacaoNoMes()).isEqualByComparingTo("1000");
        assertThat(resultado.meses().get(1).anoMes()).isEqualTo(YearMonth.of(ano, 12));
        assertThat(resultado.meses().get(1).patrimonio()).isEqualByComparingTo("700");
        assertThat(resultado.meses().get(1).variacaoNoMes()).isEqualByComparingTo("-300");
    }

    @Test
    @DisplayName("buscarPatrimonio: rejeita ano anterior ao primeiro lançamento")
    void buscarPatrimonio_anoAntesDoPrimeiroLancamento_lancaBadRequest() {
        logarTenant();
        int anoAtual = LocalDate.now().getYear();
        when(lancamentoRepository.findPrimeiraDataDasContasAtivas(tenantId))
                .thenReturn(LocalDate.of(anoAtual, 1, 10));

        assertThatThrownBy(() -> service.buscarPatrimonio(anoAtual - 1))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("buscarPatrimonio: rejeita ano posterior ao atual")
    void buscarPatrimonio_anoFuturo_lancaBadRequest() {
        logarTenant();
        int anoAtual = LocalDate.now().getYear();
        when(lancamentoRepository.findPrimeiraDataDasContasAtivas(tenantId))
                .thenReturn(LocalDate.of(anoAtual, 1, 10));

        assertThatThrownBy(() -> service.buscarPatrimonio(anoAtual + 1))
                .isInstanceOf(BadRequestException.class);
    }
}
