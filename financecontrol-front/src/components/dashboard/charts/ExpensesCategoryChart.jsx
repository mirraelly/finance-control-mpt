import { useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import Select from "../../common/Select";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import {
  dashboardMonthlyData,
  filterDashboardMonths,
  getCurrentMonthKey,
} from "../utils/dashboardPeriods";

const periods = [
  { value: "month", label: "Este mês" },
  { value: "previousMonth", label: "Mês anterior" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "year", label: "Este ano" },
  { value: "previousYear", label: "Ano anterior" },
  { value: "custom", label: "Personalizado" },
];

const categoryDefinitions = [
  { name: "Moradia", baseValue: 2100, color: "#08a779" },
  { name: "Alimentação", baseValue: 420, color: "#f4bd36" },
  { name: "Transporte", baseValue: 156, color: "#3983f7" },
  { name: "Entretenimento", baseValue: 89, color: "#884cff" },
  { name: "Saúde", baseValue: 119, color: "#f45d79" },
  { name: "Outros", baseValue: 536, color: "#9aa8ba" },
];

function getCategoryData(months) {
  const total = months.reduce((sum, item) => sum + item.expenses, 0);
  let allocated = 0;

  return categoryDefinitions.map((category, index) => {
    const value =
      index === categoryDefinitions.length - 1
        ? total - allocated
        : Math.round((total * category.baseValue) / 3420);
    allocated += value;

    return {
      ...category,
      value,
      percent: total
        ? `${((value / total) * 100).toFixed(1).replace(".", ",")}%`
        : "0,0%",
    };
  });
}

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
      ...dashboardChartBaseOptions.plotOptions,
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
        data: categories.map(({ name, value }) => ({ name, y: value })),
      },
    ],
  };
}

function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  return `${getCurrentMonthKey(today)}-${day}`;
}

function ExpensesCategoryChart() {
  const today = getTodayDate();
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState(`${getCurrentMonthKey()}-01`);
  const [endDate, setEndDate] = useState(today);
  const months = filterDashboardMonths(
    dashboardMonthlyData,
    period,
    startDate,
    endDate,
  );
  const categories = getCategoryData(months);
  const total = months.reduce((sum, item) => sum + item.expenses, 0);
  const customRangeInvalid =
    period === "custom" && startDate && endDate && startDate > endDate;

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
      {customRangeInvalid && (
        <p className="dashboard-period-range-error" role="alert">
          A data inicial deve ser anterior à data final.
        </p>
      )}
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
          {categories.map((category) => (
            <li key={category.name}>
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
    </DashboardChartPanel>
  );
}

export default ExpensesCategoryChart;
