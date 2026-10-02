import { useMemo, useState } from "react";
import { Search01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, Wallet01Icon } from "../../assets/icons";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination/Pagination";
import NewTransactionModal from "../../components/transaction/NewTransactionModal";
import { MOCK_TRANSACTIONS } from "../../constants/mockTransactions";
import lancamentoFinanceiroService from "../../services/lancamentoFinanceiroService";
import "./Transacoes.css";

// Dados mockados — depois substituir pela chamada real da API
const CATEGORY_OPTIONS = [
  { value: "todas", label: "Todas categorias" },
  { value: "moradia", label: "Moradia" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "entretenimento", label: "Entretenimento" },
  { value: "saude", label: "Saúde" },
  { value: "transporte", label: "Transporte" },
  { value: "receita", label: "Receita" },
  { value: "investimento", label: "Investimento" },
];

// Mapeia a categoria para a variante visual do Badge / avatar
const CATEGORY_VARIANT = {
  moradia: "moradia",
  alimentacao: "alimentacao",
  entretenimento: "entretenimento",
  saude: "saude",
  transporte: "neutral",
  receita: "receita",
  investimento: "receita",
};

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "receitas", label: "Receitas" },
  { value: "despesas", label: "Despesas" },
];

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function Transacoes() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [category, setCategory] = useState("todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesTab =
        activeTab === "todas" ||
        (activeTab === "receitas" && transaction.tipo === "receita") ||
        (activeTab === "despesas" && transaction.tipo === "despesa");

      const matchesCategory =
        category === "todas" || transaction.categoria === category;

      const matchesSearch =
        !term ||
        transaction.descricao.toLowerCase().includes(term) ||
        transaction.categoriaLabel.toLowerCase().includes(term);

      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [transactions, searchTerm, activeTab, category]);

  const paginatedTransactions = filteredTransactions.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handleCreateTransaction = async (values) => {
    const created = await lancamentoFinanceiroService.criar(values);
    setTransactions((current) => [
      {
        id: created.id,
        descricao: created.descricao,
        categoria: created.categoriaId,
        categoriaLabel: created.categoriaNome || "Sem categoria",
        data: created.data,
        metodo: "Manual",
        conta: created.contaFinanceiraNome,
        valor: Number(created.valor),
        tipo: created.tipo === "ENTRADA" ? "receita" : "despesa",
      },
      ...current,
    ]);
    setCurrentPage(0);
  };

  return (
    <div className="transacoes-page">
      <Card
        className="transacoes-toolbar"
        padding="sm"
        radius="lg"
        shadow={false}
      >
        <Input
          id="transacoes-search"
          type="search"
          icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
          placeholder="Buscar descrição ou categoria..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          fullWidth
          className="transacoes-toolbar__search"
        />

        <div className="transacoes-toolbar__filters">
          <div
            className="transacoes-tabs"
            role="tablist"
            aria-label="Filtrar por tipo"
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.value}
                className={`transacoes-tabs__item ${
                  activeTab === tab.value ? "is-active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Select
            id="transacoes-category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setCurrentPage(1);
            }}
            width="180px"
            className="transacoes-toolbar__category"
          />

          <Button
            icon={<HugeiconsIcon icon={Add01Icon} size={18} stroke="2" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Transação
          </Button>
        </div>
      </Card>

      <Card
        className="transacoes-table-card"
        padding="none"
        radius="lg"
        shadow={false}
      >
        {filteredTransactions.length > 0 ? (
          <div className="transacoes-table__wrapper">
            <table className="transacoes-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Método</th>
                  <th className="transacoes-table__value-col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transacoes-table__description">
                        <span
                          className={`transacoes-avatar transacoes-avatar--${
                            CATEGORY_VARIANT[transaction.categoria] || "neutral"
                          }`}
                          aria-hidden="true"
                        >
                          {transaction.descricao.charAt(0).toUpperCase()}
                        </span>
                        <span>{transaction.descricao}</span>
                      </div>
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
                    <td className="transacoes-table__muted">
                      {formatDate(transaction.data)}
                    </td>
                    <td className="transacoes-table__muted">
                      {transaction.metodo}
                    </td>
                    <td
                      className={`transacoes-table__value ${
                        transaction.tipo === "receita"
                          ? "transacoes-table__value--positive"
                          : "transacoes-table__value--negative"
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
        ) : (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Nenhuma transação encontrada"
            description="Tente ajustar a busca ou os filtros selecionados."
            fullWidth
          />
        )}
        {filteredTransactions.length > 0 && (
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalElements={filteredTransactions.length}
            totalPages={Math.ceil(transactions.length / pageSize)}
            onChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </Card>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
        theme="auto"
        apiEnabled
      />
    </div>
  );
}

export default Transacoes;
