import { useEffect, useState } from "react";
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
import dashboardService from "../../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [erroResumo, setErroResumo] = useState(false);

  useEffect(() => {
    let ativo = true;
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

    async function carregarResumo() {
      try {
        setErroResumo(false);
        const dados = await dashboardService.buscarResumo(mesAtual);
        if (ativo) setResumo(dados);
      } catch (erro) {
        console.error("Erro ao carregar resumo do dashboard:", erro);
        if (ativo) setErroResumo(true);
      }
    }

    carregarResumo();
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section className="dashboard" aria-label="Painel financeiro">
      <DashboardSummary resumo={resumo} erro={erroResumo} />
      <div className="dashboard__chart-grid">
        <RevenueExpenseChart />
       
      </div>
      {/* <div className="dashboard__chart-grid">
        <BudgetChart />
        <GoalsChart />
      </div> */}
      <div className="dashboard__asset-grid">
        {/* <InvestmentsChart /> */}
         <ExpensesCategoryChart />
        <PatrimonialChart />
      </div>
      <DashboardRecentTransactions />
    </section>
  );
}

export default Dashboard;
