import { useMemo, useState } from "react";
import { Search01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, Wallet01Icon } from "../../assets/icons";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import EmptyState from "../../components/common/EmptyState";
import NewTransactionModal from "../../components/transaction/NewTransactionModal";
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

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    descricao: "Aluguel Apartamento",
    categoria: "moradia",
    categoriaLabel: "Moradia",
    data: "2026-07-30",
    metodo: "Débito Automático",
    valor: 2100,
    tipo: "despesa",
  },
  {
    id: 2,
    descricao: "Mercado Extra",
    categoria: "alimentacao",
    categoriaLabel: "Alimentação",
    data: "2026-07-29",
    metodo: "Cartão Crédito",
    valor: 420,
    tipo: "despesa",
  },
  {
    id: 3,
    descricao: "Netflix + Spotify",
    categoria: "entretenimento",
    categoriaLabel: "Entretenimento",
    data: "2026-07-27",
    metodo: "Cartão Crédito",
    valor: 89,
    tipo: "despesa",
  },
  {
    id: 4,
    descricao: "Academia SmartFit",
    categoria: "saude",
    categoriaLabel: "Saúde",
    data: "2026-07-26",
    metodo: "Débito Automático",
    valor: 119,
    tipo: "despesa",
  },
  {
    id: 5,
    descricao: "Uber — Corridas",
    categoria: "transporte",
    categoriaLabel: "Transporte",
    data: "2026-07-24",
    metodo: "App",
    valor: 156,
    tipo: "despesa",
  },
  {
    id: 6,
    descricao: "Salário — Empresa XYZ",
    categoria: "receita",
    categoriaLabel: "Receita",
    data: "2026-07-31",
    metodo: "Transferência",
    valor: 8500,
    tipo: "receita",
  },
  {
    id: 7,
    descricao: "Freelance — Design",
    categoria: "receita",
    categoriaLabel: "Receita",
    data: "2026-07-28",
    metodo: "PIX",
    valor: 1800,
    tipo: "receita",
  },
  {
    id: 8,
    descricao: "Rendimento CDB",
    categoria: "investimento",
    categoriaLabel: "Investimento",
    data: "2026-07-25",
    metodo: "Automático",
    valor: 312,
    tipo: "receita",
  },
  {
    id: 9,
    descricao: "Dividendos FII HGLG",
    categoria: "investimento",
    categoriaLabel: "Investimento",
    data: "2026-07-23",
    metodo: "Automático",
    valor: 248,
    tipo: "receita",
  },
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

  const handleCreateTransaction = (values) => {
    const categoryOption = CATEGORY_OPTIONS.find(
      (option) => option.value === values.categoria,
    );

    setTransactions((current) => [
      {
        id: Date.now(),
        descricao: values.descricao,
        categoria: values.categoria,
        categoriaLabel: categoryOption?.label || values.categoria,
        data: values.data,
        metodo: "Manual",
        valor: values.valor,
        tipo: values.tipo,
      },
      ...current,
    ]);
  };

  return (
    <div className="transacoes-page">
      <header className="transacoes-page__header">
        <div>
          <h1>Transações</h1>
          <p>Acompanhe todas as suas receitas e despesas em um só lugar.</p>
        </div>
      </header>

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
          onChange={(event) => setSearchTerm(event.target.value)}
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
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Select
            id="transacoes-category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transacoes-table__description">
                        <span
                          className={`transacoes-avatar transacoes-avatar--${
                            CATEGORY_VARIANT[transaction.categoria] ||
                            "neutral"
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
      </Card>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
        theme="auto"
      />
    </div>
  );
}

export default Transacoes;
