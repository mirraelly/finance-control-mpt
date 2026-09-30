import DashboardChartPanel from "./DashboardChartPanel";
import { formatDashboardCurrency } from "./dashboardChartOptions";

const budgets = [
  { name: "Moradia", spent: 2100, limit: 2200, percent: 95, color: "#08a779" },
  {
    name: "Alimentação",
    spent: 850,
    limit: 1000,
    percent: 85,
    color: "#f4bd36",
  },
  {
    name: "Transporte",
    spent: 420,
    limit: 500,
    percent: 84,
    color: "#3983f7",
  },
  {
    name: "Entretenimento",
    spent: 250,
    limit: 300,
    percent: 83,
    color: "#884cff",
  },
  { name: "Saúde", spent: 119, limit: 300, percent: 40, color: "#f45d79" },
];

const initials = {
  Moradia: "M",
  Alimentação: "A",
  Transporte: "T",
  Entretenimento: "E",
  Saúde: "S",
};

function BudgetChart() {
  return (
    <DashboardChartPanel
      title="Orçamento do mês"
      action={<span>Setembro/2026</span>}
    >
      <ul className="dashboard-budget-list">
        {budgets.map((budget) => (
          <li key={budget.name}>
            <span
              className="dashboard-budget-list__icon"
              style={{ "--budget-color": budget.color }}
              aria-hidden="true"
            >
              {initials[budget.name]}
            </span>
            <span className="dashboard-budget-list__name">{budget.name}</span>
            <span
              className="dashboard-budget-list__track"
              role="progressbar"
              aria-label={`Orçamento de ${budget.name}`}
              aria-valuenow={budget.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span
                style={{
                  width: `${budget.percent}%`,
                  "--budget-color": budget.color,
                }}
              />
            </span>
            <span className="dashboard-budget-list__amount">
              {formatDashboardCurrency(budget.spent)} /{" "}
              {formatDashboardCurrency(budget.limit)}
            </span>
            <strong
              className={`dashboard-budget-list__percent${
                budget.percent < 50 ? " is-warning" : ""
              }`}
            >
              {budget.percent}%
            </strong>
          </li>
        ))}
      </ul>
    </DashboardChartPanel>
  );
}

export default BudgetChart;
