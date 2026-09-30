import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import DashboardChartPanel from "./DashboardChartPanel";
import "./DashboardRecentTransactions.css";

const transactions = [
  {
    id: 1,
    description: "Aluguel Apartamento",
    category: "Moradia",
    variant: "moradia",
    date: "30/07/2026",
    account: "Nubank",
    method: "Débito Automático",
    amount: 2100,
  },
  {
    id: 2,
    description: "Mercado Extra",
    category: "Alimentação",
    variant: "alimentacao",
    date: "29/07/2026",
    account: "Nubank",
    method: "Cartão Crédito",
    amount: 420,
  },
  {
    id: 3,
    description: "Netflix + Spotify",
    category: "Entretenimento",
    variant: "entretenimento",
    date: "27/07/2026",
    account: "Inter",
    method: "Cartão Crédito",
    amount: 89,
  },
  {
    id: 4,
    description: "Academia SmartFit",
    category: "Saúde",
    variant: "saude",
    date: "26/07/2026",
    account: "Nubank",
    method: "Débito Automático",
    amount: 119,
  },
  {
    id: 5,
    description: "Uber - Corridas",
    category: "Transporte",
    variant: "neutral",
    date: "24/07/2026",
    account: "Nubank",
    method: "App",
    amount: 156,
  },
];

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

function DashboardRecentTransactions() {
  return (
    <DashboardChartPanel
      title="Últimas transações"
      action={
        <Link to="/home" aria-label="Ver todas as transações">
          Ver todas <span aria-hidden="true">→</span>
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
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <span className="dashboard-transactions__description">
                    <span
                      className={`dashboard-transactions__avatar dashboard-transactions__avatar--${transaction.variant}`}
                      aria-hidden="true"
                    >
                      {transaction.description.charAt(0)}
                    </span>
                    {transaction.description}
                  </span>
                </td>
                <td>
                  <Badge variant={transaction.variant} size="sm">
                    {transaction.category}
                  </Badge>
                </td>
                <td>{transaction.date}</td>
                <td>{transaction.account}</td>
                <td>{transaction.method}</td>
                <td className="dashboard-transactions__amount">
                  - {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardChartPanel>
  );
}

export default DashboardRecentTransactions;
