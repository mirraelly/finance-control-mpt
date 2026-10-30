import dashboardService from "../../../services/dashboardService";
import CategoryTotalsChart from "./CategoryTotalsChart";

function ExpensesCategoryChart() {
  return (
    <CategoryTotalsChart
      id="expenses-category"
      title="Despesas por categoria"
      chartLabel="despesas por categoria"
      transactionType="despesas"
      fetchTotals={dashboardService.buscarDespesasPorCategoria}
    />
  );
}

export default ExpensesCategoryChart;
