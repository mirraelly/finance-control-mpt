import DashboardSummary from "../../components/dashboard/DashboardSummary";
import RevenueExpenseChart from "../../components/dashboard/RevenueExpenseChart";
import ExpensesCategoryChart from "../../components/dashboard/ExpensesCategoryChart";
import BudgetChart from "../../components/dashboard/BudgetChart";
import GoalsChart from "../../components/dashboard/GoalsChart";
import InvestmentsChart from "../../components/dashboard/InvestmentsChart";
import PatrimonialChart from "../../components/dashboard/PatrimonialChart";
import DashboardRecentTransactions from "../../components/dashboard/DashboardRecentTransactions";
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
