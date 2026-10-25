import { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import Select from "../../common/Select";
import dashboardService from "../../../services/dashboardService";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import { getDashboardPeriodRange } from "../utils/dashboardPeriods";

const periods = [
  { value: "month", label: "Este mês" },
  { value: "previousMonth", label: "Mês anterior" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "year", label: "Este ano" },
  { value: "previousYear", label: "Ano anterior" },
  { value: "custom", label: "Personalizado" },
];

const CATEGORY_COLORS = [
  "#08a779",
  "#f4bd36",
  "#3983f7",
  "#884cff",
  "#f45d79",
  "#9aa8ba",
  "#e67e22",
  "#14b8a6",
];

function createChartOptions(categories) {
  return {
    ...dashboardChartBaseOptions,
    chart: {
      ...dashboardChartBaseOptions.chart,
      type: "pie",
      height: 136,
      spacing: [0, 0, 0, 0],
    },
    colors: categories.map((category) => category.color),
    tooltip: {
      ...dashboardChartBaseOptions.tooltip,
      pointFormatter() {
        return `<b>${formatDashboardCurrency(this.y)}</b> (${this.percentage.toFixed(1)}%)`;
      },
    },
    plotOptions: {
      pie: {
        innerSize: "68%",
        size: "100%",
        borderWidth: 0,
        dataLabels: { enabled: false },
        showInLegend: false,
      },
    },
    series: [
      {
        name: "Despesas",
        type: "pie",
        data: categories.map(({ name, value, color }) => ({
          color,
          name,
          y: value,
        })),
      },
    ],
  };
}

function normalizeCategoryData(data) {
  if (!Array.isArray(data)) {
    throw new Error("A resposta de despesas por categoria é inválida.");
  }

  const categories = data.map((item, index) => {
    const value = Number(item?.valor);
    if (item?.valor == null || !Number.isFinite(value)) {
      throw new Error("A resposta contém um valor de despesa inválido.");
    }

    return {
      name: item.categoria || "Sem categoria",
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      value,
    };
  });
  const total = categories.reduce((sum, category) => sum + category.value, 0);

  return categories.map((category) => ({
    ...category,
    percent: total
      ? `${((category.value / total) * 100).toFixed(1).replace(".", ",")}%`
      : "0,0%",
  }));
}

function ExpensesCategoryChart() {
  const initialRange = useMemo(() => getDashboardPeriodRange("6"), []);
  const [period, setPeriod] = useState("6");
  const [startDate, setStartDate] = useState(initialRange.dataInicio);
  const [endDate, setEndDate] = useState(initialRange.dataFim);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const range = useMemo(
    () => getDashboardPeriodRange(period, startDate, endDate),
    [endDate, period, startDate],
  );
  const total = useMemo(
    () => categories.reduce((sum, category) => sum + category.value, 0),
    [categories],
  );
  const customRangeInvalid = period === "custom" && !range;

  useEffect(() => {
    if (!range) return undefined;

    let isActive = true;

    async function loadExpensesByCategory() {
      try {
        setLoading(true);
        setError(false);
        const response =
          await dashboardService.buscarDespesasPorCategoria(range);

        if (isActive) setCategories(normalizeCategoryData(response));
      } catch (loadError) {
        console.error("Erro ao carregar despesas por categoria:", loadError);
        if (isActive) {
          setCategories([]);
          setError(true);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadExpensesByCategory();
    return () => {
      isActive = false;
    };
  }, [range]);

  return (
    <DashboardChartPanel
      title="Despesas por categoria"
      action={
        <Select
          id="expenses-category-period"
          aria-label="Período das despesas por categoria"
          options={periods}
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          width="164px"
          height="30px"
          className="dashboard-period-select"
        />
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
      {customRangeInvalid ? (
        <p className="dashboard-category-status" role="alert">
          A data inicial deve ser anterior à data final.
        </p>
      ) : loading ? (
        <p className="dashboard-category-status" aria-live="polite">
          Carregando dados...
        </p>
      ) : error ? (
        <p className="dashboard-category-status" role="alert">
          Não foi possível carregar as despesas por categoria.
        </p>
      ) : categories.length === 0 ? (
        <p className="dashboard-category-status">
          Nenhuma despesa encontrada no período.
        </p>
      ) : (
        <div className="dashboard-category-layout">
          <div className="dashboard-category-donut">
            <div className="dashboard-category-donut__chart">
              <HighchartsReact
                highcharts={Highcharts}
                options={createChartOptions(categories)}
              />
            </div>
            <div className="dashboard-category-donut__total">
              <strong>{formatDashboardCurrency(total)}</strong>
              <span>Total</span>
            </div>
          </div>
          <ul className="dashboard-category-legend">
            {categories.map((category, index) => (
              <li key={`${category.name}-${index}`}>
                <span
                  className="dashboard-category-legend__dot"
                  style={{ "--category-color": category.color }}
                  aria-hidden="true"
                />
                <span className="dashboard-category-legend__name">
                  {category.name}
                </span>
                <strong className="dashboard-category-legend__amount">
                  {formatDashboardCurrency(category.value)}
                </strong>
                <span className="dashboard-category-legend__percent">
                  {category.percent}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardChartPanel>
  );
}

export default ExpensesCategoryChart;
