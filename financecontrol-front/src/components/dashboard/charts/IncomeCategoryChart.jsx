import dashboardService from "../../../services/dashboardService";
import CategoryTotalsChart from "./CategoryTotalsChart";

function IncomeCategoryChart() {
  return (
    <CategoryTotalsChart
      id="income-category"
      title="Receitas por categoria"
      chartLabel="receitas por categoria"
      transactionType="receitas"
      fetchTotals={dashboardService.buscarReceitasPorCategoria}
    />
  );
}

export default IncomeCategoryChart;
