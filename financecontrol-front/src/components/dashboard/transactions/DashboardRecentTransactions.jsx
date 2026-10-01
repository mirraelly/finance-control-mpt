import { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../common/Badge";
import Pagination from "../../common/Pagination/Pagination";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import "./DashboardRecentTransactions.css";
import { HugeiconsIcon, ArrowRight01Icon } from "../../../assets/icons";
import { MOCK_TRANSACTIONS } from "../../../constants/mockTransactions";
import { getCurrentMonthKey } from "../utils/dashboardPeriods";

const CATEGORY_VARIANT = {
  moradia: "moradia",
  alimentacao: "alimentacao",
  entretenimento: "entretenimento",
  saude: "saude",
  transporte: "neutral",
  receita: "receita",
  investimento: "receita",
};

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function DashboardRecentTransactions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const currentMonth = getCurrentMonthKey();
  const transactions = MOCK_TRANSACTIONS.filter((transaction) =>
    transaction.data.startsWith(currentMonth),
  ).sort((first, second) => second.data.localeCompare(first.data));
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <DashboardChartPanel
      title="Últimas transações"
      action={
        <Link
          to="/home"
          aria-label="Ver todas as transações"
          className="container-see-all"
        >
          <span>Ver todas </span>
          <span aria-hidden="true">
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </span>
        </Link>
      }
      className="dashboard-transactions-panel"
    >
      <div className="dashboard-transactions__scroll">
        <table className="dashboard-transactions">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Conta</th>
              <th>Método</th>
              <th className="dashboard-transactions__amount-heading">Valor</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <span className="dashboard-transactions__description">
                    <span
                      className={`dashboard-transactions__avatar dashboard-transactions__avatar--${CATEGORY_VARIANT[transaction.categoria] || "neutral"}`}
                      aria-hidden="true"
                    >
                      {transaction.descricao.charAt(0)}
                    </span>
                    {transaction.descricao}
                  </span>
                </td>
                <td>
                  <Badge
                    variant={
                      CATEGORY_VARIANT[transaction.categoria] || "neutral"
                    }
                    size="sm"
                  >
                    {transaction.categoriaLabel}
                  </Badge>
                </td>
                <td>{formatDate(transaction.data)}</td>
                <td>{transaction.conta}</td>
                <td>{transaction.metodo}</td>
                <td
                  className={`dashboard-transactions__amount ${
                    transaction.tipo === "receita"
                      ? "dashboard-transactions__amount--positive"
                      : ""
                  }`}
                >
                  {transaction.tipo === "receita" ? "+ " : "- "}
                  {formatCurrency(transaction.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={transactions.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </DashboardChartPanel>
  );
}

export default DashboardRecentTransactions;
