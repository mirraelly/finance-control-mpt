import { useCallback, useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import Select from "../../common/Select";
import dashboardService from "../../../services/dashboardService";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import { dashboardChartBaseOptions, formatDashboardCurrency } from "../utils/dashboardChartOptions";
import { dashboardMonthLabels } from "../utils/dashboardPeriods";

function createChartOptions(data, onMonthClick) {
  return {
    ...dashboardChartBaseOptions,
    legend: { enabled: false },
    chart: { ...dashboardChartBaseOptions.chart, type: "areaspline", height: 132, spacing: [8, 4, 18, 4] },
    colors: ["#08a779"],
    xAxis: { ...dashboardChartBaseOptions.xAxis, categories: data.map((item) => item.month) },
    yAxis: {
      ...dashboardChartBaseOptions.yAxis,
      labels: { ...dashboardChartBaseOptions.yAxis.labels, formatter() { return formatDashboardCurrency(this.value); } },
    },
    tooltip: {
      ...dashboardChartBaseOptions.tooltip,
      headerFormat: "",
      pointFormatter() {
        const previousPatrimony = this.options.previousMonthYear
          ? `<br/>Até ${this.options.previousMonthYear}: <b>${formatPreciseCurrency(this.options.previousValue)}</b>`
          : "";
        return `Total: <b>${formatPreciseCurrency(this.y)}</b>${previousPatrimony}<br/>Em ${this.options.monthYear}: <b>${formatSignedCurrency(this.options.monthlyValue)}</b>`;
      },
    },
    plotOptions: {
      ...dashboardChartBaseOptions.plotOptions,
      areaspline: {
        fillOpacity: 0.1,
        marker: { radius: 2, symbol: "circle" },
        dataLabels: {
          enabled: true,
          formatter() {
            return formatDashboardCurrency(this.y);
          },
          style: {
            color: "var(--chart-data-label)",
            fontSize: "9px",
            fontWeight: "500",
            textOutline: "none",
          },
          y: -8,
        },
        point: {
          events: {
            click() {
              onMonthClick(this.options.anoMes);
            },
          },
        },
      },
    },
    series: [{
      name: "Patrimônio",
      data: data.map((item) => ({
        y: item.value,
        anoMes: item.anoMes,
        monthYear: item.monthYear,
        monthlyValue: item.monthlyValue,
        previousMonthYear: item.previousMonthYear,
        previousValue: item.previousValue,
        cursor: "pointer",
      })),
    }],
  };
}

function formatPreciseCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);
}

function formatSignedCurrency(value) {
  return `${value >= 0 ? "+ " : "- "}${formatPreciseCurrency(Math.abs(value))}`;
}

function normalizeData(meses) {
  if (!Array.isArray(meses)) throw new Error("A resposta de patrimônio é inválida.");

  return meses.map((item) => {
    const [, month] = item.anoMes.split("-");
    const value = Number(item.patrimonio);
    const monthlyValue = Number(item.variacaoNoMes);
    if (!Number.isFinite(value) || !Number.isFinite(monthlyValue)) {
      throw new Error("A resposta de patrimônio contém um valor inválido.");
    }
    const monthIndex = Number(month) - 1;
    return {
      anoMes: item.anoMes,
      month: dashboardMonthLabels[monthIndex],
      monthYear: `${dashboardMonthLabels[monthIndex]}/${item.anoMes.slice(0, 4)}`,
      value,
      monthlyValue,
    };
  });
}

function PatrimonialChart() {
  const navigate = useNavigate();
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [yearOptions, setYearOptions] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPatrimony() {
      try {
        setLoading(true);
        setError(false);
        const response = await dashboardService.buscarPatrimonio(year);
        if (!isActive) return;

        const availableYears = Array.isArray(response.anosDisponiveis) ? response.anosDisponiveis : [];
        setYearOptions(availableYears.sort((first, second) => second - first).map((availableYear) => ({
          value: String(availableYear), label: String(availableYear),
        })));
        setData(normalizeData(response.meses));
      } catch (loadError) {
        console.error("Erro ao carregar crescimento patrimonial:", loadError);
        if (isActive) {
          setData([]);
          setError(true);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadPatrimony();
    return () => { isActive = false; };
  }, [year]);

  const initialValue = data[0]?.value ?? 0;
  const finalValue = data.at(-1)?.value ?? 0;
  const annualAccumulated = data.reduce(
    (total, item) => total + item.monthlyValue,
    0,
  );
  const previousMonthValue = data.at(-2)?.value;
  const monthlyVariationPercentage = previousMonthValue
    ? ((finalValue - previousMonthValue) / Math.abs(previousMonthValue)) * 100
    : 0;
  const handleMonthClick = useCallback((anoMes) => {
    const [year, month] = anoMes.split("-");
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const searchParams = new URLSearchParams({
      dataInicio: `${anoMes}-01`,
      dataFim: `${anoMes}-${String(lastDay).padStart(2, "0")}`,
    });
    navigate(`/movimentacoes/transacoes?${searchParams.toString()}`);
  }, [navigate]);
  const chartData = useMemo(
    () => data.map((item, index) => ({
      ...item,
      previousMonthYear: data[index - 1]?.monthYear,
      previousValue: data[index - 1]?.value,
    })),
    [data],
  );
  const chartOptions = useMemo(
    () => createChartOptions(chartData, handleMonthClick),
    [chartData, handleMonthClick],
  );

  return (
    <DashboardChartPanel
      title="Crescimento patrimonial"
      description={
        data.length ? (
          <>
            Acumulado no ano: <strong>{formatSignedCurrency(annualAccumulated)}</strong>
          </>
        ) : (
          "Sem dados no período"
        )
      }      
      action={
        <Select
          id="patrimonial-year"
          aria-label="Ano do crescimento patrimonial"
          options={yearOptions}
          value={year}
          onChange={(event) => setYear(event.target.value)}
          width="82px"
          height="30px"
          className="dashboard-period-select"
          disabled={yearOptions.length === 0}
        />
      }
    >
      <div className="dashboard-patrimonial">
        <div className="dashboard-patrimonial__chart" aria-busy={loading}>
          {loading ? <p className="dashboard-category-status">Carregando dados...</p>
            : error ? <p className="dashboard-category-status" role="alert">Não foi possível carregar o crescimento patrimonial.</p>
              : data.length === 0 ? <p className="dashboard-category-status">Nenhuma transação encontrada para este ano.</p>
                : <HighchartsReact highcharts={Highcharts} options={chartOptions} />}
        </div>
        <dl className="dashboard-patrimonial__details">
          <div>
            <dt>Patrimônio total</dt>
          <div>
            <dd>{formatPreciseCurrency(finalValue)}</dd>
            <span className="dashboard-patrimonial__variation-caption">Da primeira receita lançada até o ano selecionado</span>
          </div>
          </div>
          <div>
            <dt>Patrimônio inicial</dt>
            <dd>{formatPreciseCurrency(initialValue)}</dd>
            <span className="dashboard-patrimonial__variation-caption">Valor inicial histórico</span>
          </div>
          <div>
            <dt>Variação</dt>
            <div>
              <dd className="dashboard-patrimonial__variation">
                {monthlyVariationPercentage >= 0 ? "↑" : "↓"} {Math.abs(monthlyVariationPercentage).toFixed(1).replace(".", ",")}%
              </dd>
              <span className="dashboard-patrimonial__variation-caption">Evolução em relação ao mês anterior</span>
            </div>
          </div>
        </dl>
      </div>
    </DashboardChartPanel>
  );
}

export default PatrimonialChart;
