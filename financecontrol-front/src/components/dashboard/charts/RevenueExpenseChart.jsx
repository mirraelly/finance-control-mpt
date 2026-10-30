import { useCallback, useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import Select from "../../common/Select";
import dashboardService from "../../../services/dashboardService";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import {
  dashboardMonthLabels,
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

function formatarRotuloMes(anoMes) {
  const [ano, mes] = anoMes.split("-");
  return `${dashboardMonthLabels[Number(mes) - 1]}/${ano.slice(2)}`;
}

function createChartOptions(data, onColumnClick) {
  return {
    ...dashboardChartBaseOptions,
    chart: {
      ...dashboardChartBaseOptions.chart,
      type: "column",
      height: 196,
      spacing: [8, 8, 26, 8],
    },
    colors: ["#16a878", "#ef6670"],
    xAxis: {
      ...dashboardChartBaseOptions.xAxis,
      categories: data.map((item) => formatarRotuloMes(item.anoMes)),
    },
    yAxis: {
      ...dashboardChartBaseOptions.yAxis,
      min: 0,
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
        return `<span>${this.series.name}: </span><b>${formatDashboardCurrency(this.y)}</b><br/>`;
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
              onColumnClick(this.options.tipo, this.options.anoMes);
            },
          },
        },
        dataLabels: {
          enabled: true,
          crop: true,
          overflow: "justify",
          formatter() {
            return this.y > 0 ? formatDashboardCurrency(this.y) : null;
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
        name: "Receitas",
        data: data.map((item) => ({
          y: Number(item.receitas),
          anoMes: item.anoMes,
          tipo: "receitas",
          cursor: "pointer",
        })),
      },
      {
        name: "Despesas",
        data: data.map((item) => ({
          y: Number(item.despesas),
          anoMes: item.anoMes,
          tipo: "despesas",
          cursor: "pointer",
        })),
      },
    ],
  };
}

function RevenueExpenseChart() {
  const navigate = useNavigate();
  const threeMonthRange = useMemo(() => getDashboardPeriodRange("3"), []);
  const [period, setPeriod] = useState("3");
  const [startDate, setStartDate] = useState(threeMonthRange.dataInicio);
  const [endDate, setEndDate] = useState(threeMonthRange.dataFim);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const range = useMemo(
    () => getDashboardPeriodRange(period, startDate, endDate),
    [endDate, period, startDate],
  );
  const customRangeError =
    period === "custom" ? getCustomPeriodError(startDate, endDate) : "";
  const handleColumnClick = useCallback((tipo, anoMes) => {
    const [year, month] = anoMes.split("-");
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const searchParams = new URLSearchParams({
      tipo,
      dataInicio: `${anoMes}-01`,
      dataFim: `${anoMes}-${String(lastDay).padStart(2, "0")}`,
    });
    navigate(`/movimentacoes/transacoes?${searchParams.toString()}`);
  }, [navigate]);
  const chartOptions = useMemo(
    () => createChartOptions(data, handleColumnClick),
    [data, handleColumnClick],
  );

  useEffect(() => {
    if (!range) return undefined;

    let ativo = true;

    async function carregarDados() {
      try {
        setLoading(true);
        setError(false);
        const resposta = await dashboardService.buscarReceitasDespesas(range);
        if (ativo) setData(resposta);
      } catch (erro) {
        console.error("Erro ao carregar receitas e despesas:", erro);
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
      title="Receitas x Despesas"
      action={
        <div className="revenue-expense-chart__period-filter">
          <Select
            id="revenue-expense-period"
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
            Não foi possível carregar os dados do gráfico.
          </p>
        ) : (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
          />
        )}
      </div>
    </DashboardChartPanel>
  );
}

export default RevenueExpenseChart;
