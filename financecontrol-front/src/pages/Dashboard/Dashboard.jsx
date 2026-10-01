import {
  BudgetChart,
  DashboardRecentTransactions,
  DashboardSummary,
  ExpensesCategoryChart,
  GoalsChart,
  InvestmentsChart,
  PatrimonialChart,
  RevenueExpenseChart,
} from "../../components/dashboard";
import "./Dashboard.css";

function Dashboard() {
  return (
    <section className="dashboard" aria-label="Painel financeiro">
      <DashboardSummary />
      <div className="dashboard__chart-grid">
        <RevenueExpenseChart />
        <ExpensesCategoryChart />
      </div>
      <div className="dashboard__chart-grid">
        <BudgetChart />
        <GoalsChart />
      </div>
      <div className="dashboard__asset-grid">
        <InvestmentsChart />
        <PatrimonialChart />
      </div>
      <DashboardRecentTransactions />
    </section>
  );
}

export default Dashboard;
