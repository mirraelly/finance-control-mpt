import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../common/Badge";
import Pagination from "../../common/Pagination/Pagination";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import "./DashboardRecentTransactions.css";
import { HugeiconsIcon, ArrowRight01Icon } from "../../../assets/icons";
import lancamentoFinanceiroService from "../../../services/lancamentoFinanceiroService";

const CATEGORY_VARIANT = {
  moradia: "moradia",
  alimentacao: "alimentacao",
  entretenimento: "entretenimento",
  saude: "saude",
  transporte: "neutral",
  receita: "receita",
  investimento: "receita",
};

const ORIGEM_LABEL = {
  MANUAL: "Manual",
  RECEBIMENTO: "Recebimento",
  PAGAMENTO: "Pagamento",
  TRANSFERENCIA: "Transferência",
};

const formatCurrency = (value) =>
  Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function getCurrentMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();

  return {
    dataInicio: `${year}-${month}-01`,
    dataFim: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

function getCategoryVariant(transaction) {
  const category = (transaction.categoriaNome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return CATEGORY_VARIANT[category] || "neutral";
}

function DashboardRecentTransactions() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [transactions, setTransactions] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError("");
        const response = await lancamentoFinanceiroService.listarLancamentos({
          ...getCurrentMonthRange(),
          page: currentPage,
          size: pageSize,
          sort: "data,desc",
        });

        if (!isCurrent) return;
        setTransactions(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (loadError) {
        console.error("Erro ao carregar últimas transações:", loadError);
        if (isCurrent) {
          setError("Não foi possível carregar as últimas transações.");
          setTransactions([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTransactions();
    return () => {
      isCurrent = false;
    };
  }, [currentPage, pageSize]);

  return (
    <DashboardChartPanel
      title="Últimas transações"
      action={
        <Link
          to="/transacoes"
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
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Conta</th>
              <th>Método</th>
              <th className="dashboard-transactions__amount-heading">Valor</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>Carregando transações...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} role="alert">{error}</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7}>Nenhuma transação lançada neste mês.</td>
              </tr>
            ) : (
              transactions.map((transaction) => {
                const categoryVariant = getCategoryVariant(transaction);
                const isRevenue = transaction.tipo === "ENTRADA";

                return (
                  <tr key={transaction.id}>
                    <td>
                      <span
                        className={`dashboard-transactions__type dashboard-transactions__type--${isRevenue ? "revenue" : "expense"}`}
                        aria-label={isRevenue ? "Receita" : "Despesa"}
                        title={isRevenue ? "Receita" : "Despesa"}
                      >
                        {isRevenue ? "R" : "D"}
                      </span>
                    </td>
                    <td>
                      <span className="dashboard-transactions__description">
                        {transaction.descricao || "—"}
                      </span>
                    </td>
                    <td>
                      <Badge variant={categoryVariant} size="sm">
                        {transaction.categoriaNome || "Sem categoria"}
                      </Badge>
                    </td>
                    <td>{formatDate(transaction.data)}</td>
                    <td>{transaction.contaFinanceiraNome || "—"}</td>
                    <td>{ORIGEM_LABEL[transaction.origem] || transaction.origem || "—"}</td>
                    <td
                      className={`dashboard-transactions__amount ${
                        isRevenue
                          ? "dashboard-transactions__amount--positive"
                          : ""
                      }`}
                    >
                      {isRevenue ? "+ " : "- "}
                      {formatCurrency(transaction.valor)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        totalElements={totalElements}
        totalPages={totalPages}
        onChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(0);
        }}
      />
    </DashboardChartPanel>
  );
}

export default DashboardRecentTransactions;
