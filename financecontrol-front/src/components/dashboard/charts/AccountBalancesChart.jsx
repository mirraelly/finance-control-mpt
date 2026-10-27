import { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import Select from "../../common/Select";
import dashboardService from "../../../services/dashboardService";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import { dashboardChartBaseOptions, formatDashboardCurrency } from "../utils/dashboardChartOptions";
import { dashboardMonthLabels, getDashboardPeriodRange } from "../utils/dashboardPeriods";
import "./RevenueExpenseChart.css";

const periods = [
  { value: "3", label: "Ultimos 3 meses" },
  { value: "6", label: "Ultimos 6 meses" },
  { value: "12", label: "Ultimos 12 meses" },
  { value: "year", label: "Este ano" },
  { value: "previousYear", label: "Ano anterior" },
  { value: "custom", label: "Personalizado" },
];

const monthLabel = (anoMes) => {
  const [year, month] = anoMes.split("-");
  return `${dashboardMonthLabels[Number(month) - 1]}/${year.slice(2)}`;
};

function options(data, onAccountClick = options.onAccountClick) {
  const months = [...new Set(data.map((item) => item.anoMes))];
  const accounts = [...new Map(data.map((item) => [item.contaId, item.conta])).entries()];
  return {
    ...dashboardChartBaseOptions,
    chart: { ...dashboardChartBaseOptions.chart, type: "line", height: 196, spacing: [8, 8, 26, 8] },
    xAxis: { ...dashboardChartBaseOptions.xAxis, categories: months.map(monthLabel) },
    yAxis: { ...dashboardChartBaseOptions.yAxis, labels: { ...dashboardChartBaseOptions.yAxis.labels, formatter() { return formatDashboardCurrency(this.value); } } },
    tooltip: { ...dashboardChartBaseOptions.tooltip, pointFormatter() { return `<span>${this.series.name}: </span><b>${formatDashboardCurrency(this.y)}</b><br/>`; } },
    plotOptions: { ...dashboardChartBaseOptions.plotOptions, line: { cursor: "pointer", dataLabels: { enabled: true, formatter() { return formatDashboardCurrency(this.y); }, style: { color: "#64748b", fontSize: "9px", fontWeight: "500", textOutline: "none" } }, point: { events: { click() { onAccountClick(this.series.userOptions.accountId, this.options.anoMes); } } } } },
    series: accounts.map(([id, name]) => ({ accountId: id, name, data: months.map((month) => ({ anoMes: month, y: Number(data.find((item) => item.anoMes === month && item.contaId === id)?.saldo ?? 0) })) })),
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
  const range = useMemo(() => getDashboardPeriodRange(period, startDate, endDate), [period, startDate, endDate]);
  const invalidRange = period === "custom" && !range;
  const handleAccountClick = (accountId, anoMes) => {
    const [year, month] = anoMes.split("-");
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const searchParams = new URLSearchParams({
      contaFinanceiraId: accountId,
      dataInicio: `${anoMes}-01`,
      dataFim: `${anoMes}-${String(lastDay).padStart(2, "0")}`,
    });
    navigate(`/movimentacoes/transacoes?${searchParams.toString()}`);
  };
  options.onAccountClick = handleAccountClick;

  useEffect(() => {
    if (!range) return undefined;
    let active = true;
    dashboardService.buscarSaldosPorConta(range)
      .then((response) => { if (active) { setData(response); setError(false); } })
      .catch((loadError) => { console.error("Erro ao carregar saldos por conta:", loadError); if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range]);

  return <DashboardChartPanel title="Saldo por contas financeiras" action={<Select id="account-balances-period" aria-label="Período" options={periods} value={period} onChange={(event) => setPeriod(event.target.value)} width="164px" height="30px" className="dashboard-period-select" />}>
    {period === "custom" && <div className="dashboard-period-date-range"><label><span>Data inicial</span><input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} /></label><label><span>Data final</span><input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>}
    <div className="dashboard-panel__chart revenue-expense-chart__plot" aria-busy={loading}>
      {invalidRange ? <p className="revenue-expense-chart__status">Informe um período válido para consultar o gráfico.</p> : loading ? <p className="revenue-expense-chart__status">Carregando dados...</p> : error ? <p className="revenue-expense-chart__status" role="alert">Não foi possível carregar os saldos das contas.</p> : data.length === 0 ? <p className="revenue-expense-chart__status">Nenhuma conta financeira ativa encontrada.</p> : <HighchartsReact highcharts={Highcharts} options={options(data)} />}
    </div>
  </DashboardChartPanel>;
}

export default AccountBalancesChart;
