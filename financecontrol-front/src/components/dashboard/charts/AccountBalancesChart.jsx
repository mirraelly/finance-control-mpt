import { useCallback, useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import Select from "../../common/Select";
import dashboardService from "../../../services/dashboardService";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import DashboardChartEmptyState from "../panels/DashboardChartEmptyState";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import {
  getCustomPeriodError,
  getDashboardPeriodRange,
} from "../utils/dashboardPeriods";
import "./RevenueExpenseChart.css";

const periods = [
  { value: "3", label: "Ultimos 3 meses" },
  { value: "6", label: "Ultimos 6 meses" },
  { value: "12", label: "Ultimos 12 meses" },
  { value: "year", label: "Este ano" },
  { value: "previousYear", label: "Ano anterior" },
  { value: "custom", label: "Personalizado" },
];

function createChartOptions(data, onAccountClick) {
  return {
    ...dashboardChartBaseOptions,
    chart: {
      ...dashboardChartBaseOptions.chart,
      type: "column",
      height: 196,
      spacing: [8, 8, 26, 8],
    },
    colors: ["#08a779"],
    legend: { enabled: false },
    xAxis: {
      ...dashboardChartBaseOptions.xAxis,
      categories: data.map((item) => item.conta),
    },
    yAxis: {
      ...dashboardChartBaseOptions.yAxis,
      labels: {
        ...dashboardChartBaseOptions.yAxis.labels,
        formatter() {
          return formatDashboardCurrency(this.value);
        },
      },
    },
    tooltip: {
      ...dashboardChartBaseOptions.tooltip,
      pointFormatter() {
        return `<span>Movimentação líquida no período: </span><b>${formatDashboardCurrency(this.y)}</b><br/>`;
      },
    },
    plotOptions: {
      ...dashboardChartBaseOptions.plotOptions,
      column: {
        ...dashboardChartBaseOptions.plotOptions.column,
        cursor: "pointer",
        point: {
          events: {
            click() {
              onAccountClick(this.options.contaId);
            },
          },
        },
        dataLabels: {
          enabled: true,
          crop: true,
          overflow: "justify",
          formatter() {
            return formatDashboardCurrency(this.y);
          },
          style: {
            color: "var(--chart-data-label)",
            fontSize: "9px",
            fontWeight: "500",
            textOutline: "none",
          },
        },
      },
    },
    series: [
      {
        name: "Saldo atual",
        data: data.map((item) => ({
          y: Number(item.saldo),
          contaId: item.contaId,
          color: Number(item.saldo) < 0 ? "#ef6670" : "#08a779",
          cursor: "pointer",
        })),
      },
    ],
  };
}

function AccountBalancesChart() {
  const navigate = useNavigate();
  const initialRange = useMemo(() => getDashboardPeriodRange("3"), []);
  const [period, setPeriod] = useState("3");
  const [startDate, setStartDate] = useState(initialRange.dataInicio);
  const [endDate, setEndDate] = useState(initialRange.dataFim);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const range = useMemo(
    () => getDashboardPeriodRange(period, startDate, endDate),
    [endDate, period, startDate],
  );
  const customRangeError =
    period === "custom" ? getCustomPeriodError(startDate, endDate) : "";

  const handleAccountClick = useCallback(
    (contaId) => {
      const searchParams = new URLSearchParams({
        contaFinanceiraId: contaId,
      });
      navigate(`/movimentacoes/transacoes?${searchParams.toString()}`);
    },
    [navigate],
  );
  const chartOptions = useMemo(
    () => createChartOptions(data, handleAccountClick),
    [data, handleAccountClick],
  );

  useEffect(() => {
    if (!range) return undefined;

    let ativo = true;

    async function carregarDados() {
      try {
        setLoading(true);
        setError(false);
        const resposta = await dashboardService.buscarSaldosPorConta(range);
        if (ativo) {
          const saldosPorConta = new Map();
          resposta.forEach((item) => {
            const conta = saldosPorConta.get(item.contaId) ?? {
              contaId: item.contaId,
              conta: item.conta,
              saldo: 0,
            };
            conta.saldo += Number(item.saldo);
            saldosPorConta.set(item.contaId, conta);
          });
          setData([...saldosPorConta.values()]);
        }
      } catch (erro) {
        console.error("Erro ao carregar saldos por conta:", erro);
        if (ativo) {
          setData([]);
          setError(true);
        }
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, [range]);

  return (
    <DashboardChartPanel
      title="Saldo por contas financeiras"
      className="dashboard-account-balances"
      action={
        <div className="revenue-expense-chart__period-filter">
          <Select
            id="account-balances-period"
            aria-label="Período"
            options={periods}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            width="164px"
            height="30px"
            className="dashboard-period-select"
          />
        </div>
      }
    >
      {period === "custom" && (
        <div className="dashboard-period-date-range">
          <label>
            <span>Data inicial</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label>
            <span>Data final</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      )}
      {customRangeError && (
        <p className="dashboard-period-range-error" role="alert">
          {customRangeError}
        </p>
      )}
      <div
        className="dashboard-panel__chart revenue-expense-chart__plot"
        aria-busy={loading}
      >
        {customRangeError ? (
          <p className="revenue-expense-chart__status">
            Informe um período válido para consultar o gráfico.
          </p>
        ) : loading ? (
          <p className="revenue-expense-chart__status">Carregando dados...</p>
        ) : error ? (
          <p className="revenue-expense-chart__status" role="alert">
            Não foi possível carregar os saldos das contas.
          </p>
        ) : !data.some((item) => item.saldo !== 0) ? (
          <DashboardChartEmptyState />
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </div>
    </DashboardChartPanel>
  );
}

export default AccountBalancesChart;
