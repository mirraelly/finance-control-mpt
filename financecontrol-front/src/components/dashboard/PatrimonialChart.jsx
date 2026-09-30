import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import DashboardChartPanel from "./DashboardChartPanel";
import {
  dashboardChartBaseOptions,
  formatDashboardCurrency,
} from "./dashboardChartOptions";

const options = {
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
    categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set"],
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
      data: [35100, 37800, 39600, 41300, 42300, 43500, 44000, 44200, 44430],
    },
  ],
};

function PatrimonialChart() {
  return (
    <DashboardChartPanel
      title="Crescimento patrimonial"
      description="+26,6% no ano"
      action={<span>2026</span>}
    >
      <div className="dashboard-patrimonial">
        <div className="dashboard-patrimonial__chart">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <dl className="dashboard-patrimonial__details">
          <div>
            <dt>Patrimônio atual</dt>
            <dd>R$ 44.430,00</dd>
          </div>
          <div>
            <dt>Patrimônio inicial</dt>
            <dd>R$ 35.100,00</dd>
          </div>
          <div>
            <dt>Variação</dt>
            <dd className="dashboard-patrimonial__variation">↑ 26,6%</dd>
          </div>
        </dl>
      </div>
    </DashboardChartPanel>
  );
}

export default PatrimonialChart;
