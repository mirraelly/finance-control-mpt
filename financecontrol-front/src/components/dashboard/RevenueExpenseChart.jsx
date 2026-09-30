import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import DashboardChartPanel from "./DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "./dashboardChartOptions";

const options = {
  ...dashboardChartBaseOptions,
  chart: { ...dashboardChartBaseOptions.chart, type: "column" },
  colors: ["#16a878", "#ef6670"],
  xAxis: {
    ...dashboardChartBaseOptions.xAxis,
    categories: ["Abr", "Mai", "Jun", "Jul", "Ago", "Set"],
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
      return `<span>${this.series.name}: </span><b>${formatDashboardCurrency(this.y)}</b><br/>`;
    },
  },
  series: [
    { name: "Receitas", data: [4800, 5200, 4600, 6100, 5400, 5800] },
    { name: "Despesas", data: [3200, 3500, 3100, 3900, 3600, 3420] },
  ],
};

function RevenueExpenseChart() {
  return (
    <DashboardChartPanel
      title="Receitas x Despesas"
      action={<span>Últimos 6 meses</span>}
    >
      <div className="dashboard-panel__chart">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </DashboardChartPanel>
  );
}

export default RevenueExpenseChart;
