import { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import Select from "../../common/Select";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import { getDashboardPeriodRange } from "../utils/dashboardPeriods";

const PERIODS = [
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

function formatCategoryChartTotal(value) {
  if (Math.abs(value) < 1_000_000) {
    return formatDashboardCurrency(value);
  }

  const signal = value < 0 ? "-" : "";
  const millions = Math.abs(value) / 1_000_000;
  const formattedMillions = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(millions);

  return `R$ ${signal}${formattedMillions}M`;
}

function normalizeCategoryData(data) {
  if (!Array.isArray(data)) {
    throw new Error("A resposta de totais por categoria é inválida.");
  }

  const categories = data.map((item, index) => {
    const value = Number(item?.valor);
    if (item?.valor == null || !Number.isFinite(value)) {
      throw new Error("A resposta contém um valor inválido.");
    }

    return {
      categoryId: item?.categoriaId ? String(item.categoriaId) : null,
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

function createChartOptions(categories, title, totalLabel, onCategoryClick) {
  const hasLongTotal = totalLabel.length > 12;

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
      backgroundColor: "#ffffff",
      borderColor: "#cbd5e1",
      borderRadius: 8,
      borderWidth: 1,
      shadow: true,
      outside: true,
      useHTML: true,
      zIndex: 10000,
      style: {
        ...dashboardChartBaseOptions.tooltip.style,
        color: "#0f172a",
      },
      pointFormatter() {
        return `<b>${formatDashboardCurrency(this.y)}</b><br/>${this.percentage.toFixed(1).replace(".", ",")}% do total`;
      },
    },
    plotOptions: {
      pie: {
        cursor: "pointer",
        innerSize: hasLongTotal ? "80%" : "72%",
        size: hasLongTotal ? "94%" : "100%",
        borderWidth: 0,
        dataLabels: { enabled: false },
        showInLegend: false,
        point: {
          events: {
            click() {
              onCategoryClick(this.options.categoryId);
            },
          },
        },
      },
    },
    series: [
      {
        name: title,
        type: "pie",
        data: categories.map(({ categoryId, name, value, color }) => ({
          categoryId,
          color,
          cursor: categoryId ? "pointer" : "default",
          name,
          y: value,
        })),
      },
    ],
  };
}

function CategoryTotalsChart({
  title,
  chartLabel,
  fetchTotals,
  id,
  transactionType,
}) {
  const navigate = useNavigate();
  const initialRange = useMemo(() => getDashboardPeriodRange("3"), []);
  const [period, setPeriod] = useState("3");
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
  const totalLabel = useMemo(() => formatDashboardCurrency(total), [total]);
  const compactTotalLabel = useMemo(
    () => formatCategoryChartTotal(total),
    [total],
  );
  const customRangeInvalid = period === "custom" && !range;

  useEffect(() => {
    if (!range) return undefined;

    let isActive = true;

    async function loadTotals() {
      try {
        setLoading(true);
        setError(false);
        const response = await fetchTotals(range);

        if (isActive) setCategories(normalizeCategoryData(response));
      } catch (loadError) {
        console.error(`Erro ao carregar ${chartLabel.toLowerCase()}:`, loadError);
        if (isActive) {
          setCategories([]);
          setError(true);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadTotals();
    return () => {
      isActive = false;
    };
  }, [chartLabel, fetchTotals, range]);

  const handleCategoryClick = (categoryId) => {
    if (!categoryId || !range) return;

    const searchParams = new URLSearchParams({
      tipo: transactionType,
      categoriaId: categoryId,
      dataInicio: range.dataInicio,
      dataFim: range.dataFim,
    });
    navigate(`/movimentacoes/transacoes?${searchParams.toString()}`);
  };

  return (
    <DashboardChartPanel
      title={title}
      className="dashboard-category-panel"
      action={
        <Select
          id={`${id}-period`}
          aria-label={`Período de ${chartLabel.toLowerCase()}`}
          options={PERIODS}
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
          Não foi possível carregar {chartLabel.toLowerCase()}.
        </p>
      ) : categories.length === 0 ? (
        <p className="dashboard-category-status">
          Nenhum resultado encontrado no período.
        </p>
      ) : (
        <div className="dashboard-category-layout">
          <div className="dashboard-category-donut">
            <div className="dashboard-category-donut__chart">
              <HighchartsReact
                highcharts={Highcharts}
                options={createChartOptions(
                  categories,
                  title,
                  compactTotalLabel,
                  handleCategoryClick,
                )}
              />
            </div>
            <div
              className="dashboard-category-donut__total"
              aria-label={`Total: ${totalLabel}`}
              style={{ "--total-character-count": compactTotalLabel.length }}
            >
              <strong title={totalLabel}>
                {compactTotalLabel}
              </strong>
              <span>Total</span>
            </div>
          </div>
          <ul className="dashboard-category-legend" aria-label={title}>
            {categories.map((category, index) => (
              <li key={`${category.name}-${index}`}>
                <span
                  className="dashboard-category-legend__dot"
                  style={{ "--category-color": category.color }}
                  aria-hidden="true"
                />
                <span
                  className="dashboard-category-legend__name"
                  title={category.name}
                >
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

export default CategoryTotalsChart;
