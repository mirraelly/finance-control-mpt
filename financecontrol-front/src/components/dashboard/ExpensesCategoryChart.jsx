import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import DashboardChartPanel from "./DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "./dashboardChartOptions";

const categories = [
  { name: "Moradia", value: 2100, percent: "61,4%", color: "#08a779" },
  { name: "Alimentação", value: 420, percent: "12,3%", color: "#f4bd36" },
  { name: "Transporte", value: 156, percent: "4,6%", color: "#3983f7" },
  { name: "Entretenimento", value: 89, percent: "2,6%", color: "#884cff" },
  { name: "Saúde", value: 119, percent: "3,5%", color: "#f45d79" },
  { name: "Outros", value: 536, percent: "15,6%", color: "#9aa8ba" },
];

const options = {
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

function ExpensesCategoryChart() {
  return (
    <DashboardChartPanel
      title="Despesas por categoria"
      action={<span>Este mês</span>}
    >
      <div className="dashboard-category-layout">
        <div className="dashboard-category-donut">
          <div className="dashboard-category-donut__chart">
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
          <div className="dashboard-category-donut__total">
            <strong>R$ 3.420</strong>
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
              <span>{category.percent}</span>
              <strong>{formatDashboardCurrency(category.value)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </DashboardChartPanel>
  );
}

export default ExpensesCategoryChart;
