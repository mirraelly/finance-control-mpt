import { useCallback, useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../services/dashboardService";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import "./RevenueExpenseChart.css";

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
        return `<span>Saldo atual: </span><b>${formatDashboardCurrency(this.y)}</b><br/>`;
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
          cursor: "pointer",
        })),
      },
    ],
  };
}

function AccountBalancesChart() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    let ativo = true;

    async function carregarDados() {
      try {
        setLoading(true);
        setError(false);
        const resposta = await dashboardService.buscarSaldoAtualPorConta();
        if (ativo) setData(resposta);
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
  }, []);

  return (
    <DashboardChartPanel
      title="Saldo por contas financeiras"
      className="dashboard-account-balances"
    >
      <div
        className="dashboard-panel__chart revenue-expense-chart__plot"
        aria-busy={loading}
      >
        {loading ? (
          <p className="revenue-expense-chart__status">Carregando dados...</p>
        ) : error ? (
          <p className="revenue-expense-chart__status" role="alert">
            Não foi possível carregar os saldos das contas.
          </p>
        ) : data.length === 0 ? (
          <p className="revenue-expense-chart__status">
            Nenhuma conta financeira ativa encontrada.
          </p>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </div>
    </DashboardChartPanel>
  );
}

export default AccountBalancesChart;
