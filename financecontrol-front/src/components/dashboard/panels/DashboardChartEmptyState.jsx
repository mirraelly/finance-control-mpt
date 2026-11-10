import { ChartAnalysisIcon, HugeiconsIcon } from "../../../assets/icons";

function DashboardChartEmptyState({ icon = ChartAnalysisIcon }) {
  return (
    <div className="dashboard-chart-empty-state" role="status">
      <HugeiconsIcon icon={icon} />
      <p>Ainda não há movimentações para este período.</p>
    </div>
  );
}

export default DashboardChartEmptyState;
