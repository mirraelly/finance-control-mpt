import { useState } from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import Select from "../../common/Select";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "../utils/dashboardChartOptions";
import { dashboardMonthLabels } from "../utils/dashboardPeriods";

const currentYear = new Date().getFullYear();
const currentYearValues = [
  35100, 37800, 39600, 41300, 42300, 43500, 44000, 44200, 44430, 44700, 45000,
  45300,
];
const yearOptions = Array.from({ length: 5 }, (_, index) => {
  const year = String(currentYear - index);
  return { value: year, label: year };
});

function getYearData(year) {
  const monthCount =
    Number(year) === currentYear ? new Date().getMonth() + 1 : 12;

  if (Number(year) === 2026) {
    return currentYearValues.slice(0, monthCount).map((value, index) => ({
      month: dashboardMonthLabels[index],
      value,
    }));
  }

  const yearsBeforeBase = 2026 - Number(year);
  const initialValue = Math.max(12000, 35100 - yearsBeforeBase * 9000);
  const finalValue =
    initialValue + Math.max(6000, 9000 - yearsBeforeBase * 500);

  return Array.from({ length: monthCount }, (_, index) => ({
    month: dashboardMonthLabels[index],
    value: Math.round(
      initialValue + ((finalValue - initialValue) * index) /
        Math.max(monthCount - 1, 1),
    ),
  }));
}

function createChartOptions(data) {
  return {
    ...dashboardChartBaseOptions,
    chart: {
      ...dashboardChartBaseOptions.chart,
      type: "areaspline",
      height: 132,
      spacing: [8, 4, 18, 4],
    },
    colors: ["#08a779"],
    xAxis: {
      ...dashboardChartBaseOptions.xAxis,
      categories: data.map((item) => item.month),
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
        return `<b>${formatDashboardCurrency(this.y)}</b>`;
      },
    },
    plotOptions: {
      ...dashboardChartBaseOptions.plotOptions,
      areaspline: { fillOpacity: 0.1, marker: { radius: 2, symbol: "circle" } },
    },
    series: [
      {
        name: "Patrimônio",
        data: data.map((item) => item.value),
      },
    ],
  };
}

function formatPreciseCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function PatrimonialChart() {
  const [year, setYear] = useState(String(currentYear));
  const data = getYearData(year);
  const initialValue = data[0]?.value ?? 0;
  const finalValue = data.at(-1)?.value ?? 0;
  const variation = initialValue
    ? ((finalValue - initialValue) / initialValue) * 100
    : 0;
  const variationLabel = `${variation > 0 ? "+" : ""}${variation
    .toFixed(1)
    .replace(".", ",")}% no ano`;

  return (
    <DashboardChartPanel
      title="Crescimento patrimonial"
      description={variationLabel}
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
        />
      }
    >
      <div className="dashboard-patrimonial">
        <div className="dashboard-patrimonial__chart">
          <HighchartsReact
            highcharts={Highcharts}
            options={createChartOptions(data)}
          />
        </div>
        <dl className="dashboard-patrimonial__details">
          <div>
            <dt>Patrimônio atual</dt>
            <dd>{formatPreciseCurrency(finalValue)}</dd>
          </div>
          <div>
            <dt>Patrimônio inicial</dt>
            <dd>{formatPreciseCurrency(initialValue)}</dd>
          </div>
          <div>
            <dt>Variação</dt>
            <dd className="dashboard-patrimonial__variation">
              {variation >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(variation).toFixed(1).replace(".", ",")}%
            </dd>
          </div>
        </dl>
      </div>
    </DashboardChartPanel>
  );
}

export default PatrimonialChart;
