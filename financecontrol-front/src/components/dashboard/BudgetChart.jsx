import { useState } from "react";
import DashboardChartPanel from "./DashboardChartPanel";
import { formatDashboardCurrency } from "./dashboardChartOptions";
import { getCurrentMonthKey } from "./dashboardPeriods";

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

function getBudgetsForMonth(monthKey) {
  if (!monthKey) return budgets;

  const [year, month] = monthKey.split("-").map(Number);
  const today = new Date();
  const monthOffset =
    (year - today.getFullYear()) * 12 + (month - (today.getMonth() + 1));
  const factor = 1 + Math.sin(monthOffset * 0.7) * 0.04;

  return budgets.map((budget) => {
    const spent = Math.round(budget.spent * factor);
    const limit = Math.round(budget.limit * factor);

    return {
      ...budget,
      spent,
      limit,
      percent: Math.round((spent / limit) * 100),
    };
  });
}

function BudgetChart() {
  const [month, setMonth] = useState(getCurrentMonthKey);
  const selectedBudgets = getBudgetsForMonth(month);

  return (
    <DashboardChartPanel
      title="Orçamento do mês"
      action={
        <input
          className="dashboard-panel__month-filter"
          type="month"
          value={month}
          max={getCurrentMonthKey()}
          aria-label="Mês do orçamento"
          onChange={(event) => setMonth(event.target.value)}
        />
      }
    >
      <ul className="dashboard-budget-list">
        {selectedBudgets.map((budget) => (
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
