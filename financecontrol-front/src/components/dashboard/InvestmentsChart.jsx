import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import DashboardChartPanel from "./DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "./dashboardChartOptions";

const investments = [
  { name: "Ações BR", share: "35%", value: 12285, color: "#08a779" },
  { name: "FIIs", share: "23%", value: 8073, color: "#3983f7" },
  { name: "Renda Fixa", share: "19%", value: 6669, color: "#884cff" },
  { name: "Cripto", share: "9%", value: 3159, color: "#f4bd36" },
  { name: "Internacional", share: "13%", value: 4914, color: "#f45d79" },
];

const options = {
  ...dashboardChartBaseOptions,
  chart: {
    ...dashboardChartBaseOptions.chart,
    type: "pie",
    height: 132,
    spacing: [0, 0, 0, 0],
  },
  colors: investments.map((investment) => investment.color),
  tooltip: {
    ...dashboardChartBaseOptions.tooltip,
    pointFormatter() {
      return `<b>${formatDashboardCurrency(this.y)}</b> (${this.percentage.toFixed(1)}%)`;
    },
  },
  plotOptions: {
    ...dashboardChartBaseOptions.plotOptions,
    pie: {
      innerSize: "66%",
      size: "100%",
      borderWidth: 0,
      dataLabels: { enabled: false },
      showInLegend: false,
    },
  },
  series: [
    {
      name: "Investimentos",
      data: investments.map(({ name, value }) => ({ name, y: value })),
    },
  ],
};

function InvestmentsChart() {
  return (
    <DashboardChartPanel title="Investimentos">
      <div className="dashboard-investments">
        <div className="dashboard-investments__donut">
          <HighchartsReact highcharts={Highcharts} options={options} />
          <strong>R$ 35.100</strong>
        </div>
        <ul className="dashboard-investments__legend">
          {investments.map((investment) => (
            <li key={investment.name}>
              <span
                className="dashboard-investments__dot"
                style={{ "--investment-color": investment.color }}
                aria-hidden="true"
              />
              <span>{investment.name}</span>
              <strong>{investment.share}</strong>
            </li>
          ))}
        </ul>
      </div>
    </DashboardChartPanel>
  );
}

export default InvestmentsChart;
