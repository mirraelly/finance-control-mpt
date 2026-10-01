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
  dashboardMonthLabels,
  dashboardMonthlyData,
  filterDashboardMonths,
} from "../utils/dashboardPeriods";
import "./RevenueExpenseChart.css";

const periods = [
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
  { value: "year", label: "Este ano" },
  { value: "previousYear", label: "Ano anterior" },
  { value: "custom", label: "Personalizado" },
];

function createChartOptions(data) {
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
      categories: data.map((item) => {
        const month = Number(item.key.slice(5, 7)) - 1;
        return dashboardMonthLabels[month];
      }),
    },
    yAxis: {
      ...dashboardChartBaseOptions.yAxis,
      min: 0,
      max: 8000,
      tickInterval: 2000,
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
    series: [
      { name: "Receitas", data: data.map((item) => item.revenue) },
      { name: "Despesas", data: data.map((item) => item.expenses) },
    ],
  };
}

function RevenueExpenseChart() {
  const [period, setPeriod] = useState("6");
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-09-30");
  const data = filterDashboardMonths(
    dashboardMonthlyData,
    period,
    startDate,
    endDate,
  );
  const customRangeInvalid =
    period === "custom" && startDate && endDate && startDate > endDate;

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
      {customRangeInvalid && (
        <p className="dashboard-period-range-error" role="alert">
          A data inicial deve ser anterior à data final.
        </p>
      )}
      <div className="dashboard-panel__chart revenue-expense-chart__plot">
        <HighchartsReact
          highcharts={Highcharts}
          options={createChartOptions(data)}
        />
      </div>
    </DashboardChartPanel>
  );
}

export default RevenueExpenseChart;
