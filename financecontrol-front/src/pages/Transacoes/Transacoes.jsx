import { useEffect, useState } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  HugeiconsIcon,
  Wallet01Icon,
  Edit02Icon,
  Delete02Icon,
  Search01Icon,
} from "../../assets/icons";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import EmptyState from "../../components/common/EmptyState";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal/Modal";
import Pagination from "../../components/common/Pagination/Pagination";
import useToast from "../../components/common/Toast/useToast";
import NewTransactionModal from "../../components/transaction/NewTransactionModal";
import categoriaService from "../../services/categoriaService";
import lancamentoFinanceiroService from "../../services/lancamentoFinanceiroService";
import { centavosParaMoeda } from "../../utils/formatters";
import { showApiErrorToast } from "../../utils/toastErrors";
import "./Transacoes.css";

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "receitas", label: "Receitas" },
  { value: "despesas", label: "Despesas" },
];
const PAGE_SIZE_DEFAULT = 15;
const ORIGEM_LABEL = {
  MANUAL: "Manual",
  RECEBIMENTO: "Recebimento",
  PAGAMENTO: "Pagamento",
  TRANSFERENCIA: "Transferência",
};
const CATEGORY_VARIANT = {
  moradia: "moradia",
  alimentacao: "alimentacao",
  entretenimento: "entretenimento",
  saude: "saude",
  receita: "receita",
  investimento: "receita",
};

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function mapTransaction(transaction) {
  return {
    ...transaction,
    categoria: transaction.categoriaId,
    categoriaLabel: transaction.categoriaNome || "Sem categoria",
    tipo: transaction.tipo === "ENTRADA" ? "receita" : "despesa",
    metodo: ORIGEM_LABEL[transaction.origem] || transaction.origem || "—",
  };
}

function getCategoryVariant(transaction) {
  const categoryName = transaction.categoriaLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return CATEGORY_VARIANT[categoryName] || "neutral";
}

function Transacoes() {
  const showToast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [categoryId, setCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let isCurrent = true;

    categoriaService
      .listarAtivas()
      .then((items) => {
        if (isCurrent) setCategories(items);
      })
      .catch((loadError) => {
        console.error("Erro ao carregar categorias das transações:", loadError);
        if (isCurrent) {
          setCategoriesError("Não foi possível carregar as categorias.");
          showApiErrorToast(
            showToast,
            loadError,
            "Não foi possível carregar as categorias.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [showToast]);

  useEffect(() => {
    let isCurrent = true;

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError("");
        const response = await lancamentoFinanceiroService.listarLancamentos({
          page: currentPage,
          size: pageSize,
          tipo:
            activeTab === "receitas"
              ? "ENTRADA"
              : activeTab === "despesas"
                ? "SAIDA"
                : undefined,
          categoriaId: categoryId || undefined,
          descricao: debouncedSearch || undefined,
        });
        if (!isCurrent) return;
        setTransactions(response.content.map(mapTransaction));
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (loadError) {
        console.error("Erro ao carregar transações:", loadError);
        if (isCurrent) {
          setError("Não foi possível carregar as transações.");
          showApiErrorToast(
            showToast,
            loadError,
            "Não foi possível carregar as transações.",
          );
          setTransactions([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTransactions();
    return () => {
      isCurrent = false;
    };
  }, [
    currentPage,
    pageSize,
    activeTab,
    categoryId,
    debouncedSearch,
    refreshKey,
    showToast,
  ]);

  const handleSaveTransaction = async (values) => {
    if (editingTransaction) {
      await lancamentoFinanceiroService.atualizar(editingTransaction.id, values);
    } else {
      await lancamentoFinanceiroService.criar(values);
    }

    setCurrentPage(0);
    setRefreshKey((current) => current + 1);
  };

  const openNewTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const confirmDeleteTransaction = async () => {
    try {
      setIsDeleting(true);
      await lancamentoFinanceiroService.excluir(transactionToDelete.id);
      showToast({
        type: "success",
        title: "Operação concluída",
        message: "Transação excluída com sucesso.",
      });
      setTransactionToDelete(null);
      setRefreshKey((current) => current + 1);
    } catch (deleteError) {
      console.error("Erro ao excluir transação:", deleteError);
      showApiErrorToast(
        showToast,
        deleteError,
        "Não foi possível excluir a transação.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const modalInitialValues = editingTransaction
    ? {
        tipo: editingTransaction.tipo,
        valor: centavosParaMoeda(
          Math.round(Number(editingTransaction.valor) * 100),
        ),
        descricao: editingTransaction.descricao || "",
        categoria: editingTransaction.categoria || "",
        contaFinanceiraId: editingTransaction.contaFinanceiraId,
        data: editingTransaction.data,
      }
    : {};

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
          placeholder="Buscar descrição..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(0);
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
                  setCurrentPage(0);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Select
            id="transacoes-category"
            aria-label="Filtrar por categoria"
            options={[
              { value: "", label: "Todas categorias" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.nome,
              })),
            ]}
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setCurrentPage(0);
            }}
            className="transacoes-toolbar__category"
          />

          <Button
            icon={<HugeiconsIcon icon={Add01Icon} size={18} stroke="2" />}
            onClick={openNewTransaction}
          >
            Nova Transação
          </Button>
        </div>
      </Card>

      {categoriesError && (
        <p className="transacoes-page__error" role="alert">
          {categoriesError}
        </p>
      )}

      <Card
        className="transacoes-table-card"
        padding="none"
        radius="lg"
        shadow={false}
      >
        {error ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Erro ao carregar transações"
            description={error}
            fullWidth
          />
        ) : isLoading && transactions.length === 0 ? (
          <Loading message="Carregando transações..." />
        ) : totalElements > 0 ? (
          <>
            <div
              className={`transacoes-table__wrapper${isLoading ? " transacoes-table__wrapper--loading" : ""}`}
              aria-busy={isLoading}
            >
              <table className="transacoes-table">
                <thead>
                  <tr>
                    {activeTab === "todas" && <th>Tipo</th>}
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Conta financeira</th>
                    <th>Origem</th>
                    <th className="transacoes-table__value-col">Valor</th>
                    <th className="transacoes-table__actions-col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const categoryVariant = getCategoryVariant(transaction);
                    const isManual = transaction.origem === "MANUAL";

                    return (
                      <tr key={transaction.id}>
                        {activeTab === "todas" && (
                          <td data-label="Tipo">
                            <span
                              className={`transacoes-avatar transacoes-avatar--${transaction.tipo}`}
                              aria-label={
                                transaction.tipo === "receita"
                                  ? "Receita"
                                  : "Despesa"
                              }
                              title={
                                transaction.tipo === "receita"
                                  ? "Receita"
                                  : "Despesa"
                              }
                            >
                              {transaction.tipo === "receita" ? "R" : "D"}
                            </span>
                          </td>
                        )}
                        <td data-label="Descrição">
                          <div className="transacoes-table__description">
                            <span>{transaction.descricao || "—"}</span>
                          </div>
                        </td>
                        <td data-label="Categoria">
                          <Badge variant={categoryVariant} size="sm">
                            {transaction.categoriaLabel}
                          </Badge>
                        </td>
                        <td
                          className="transacoes-table__muted"
                          data-label="Data"
                        >
                          {formatDate(transaction.data)}
                        </td>
                        <td
                          className="transacoes-table__muted"
                          data-label="Conta financeira"
                        >
                          {transaction.contaFinanceiraNome}
                        </td>
                        <td
                          className="transacoes-table__muted"
                          data-label="Origem"
                        >
                          {transaction.metodo}
                        </td>
                        <td
                          className={`transacoes-table__value ${
                            transaction.tipo === "receita"
                              ? "transacoes-table__value--positive"
                              : "transacoes-table__value--negative"
                          }`}
                          data-label="Valor"
                        >
                          {transaction.tipo === "receita" ? "+ " : "- "}
                          {formatCurrency(transaction.valor)}
                        </td>
                        <td data-label="Ações">
                          {isManual ? (
                            <div className="transacoes-table__actions">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditTransaction(transaction)}
                                aria-label={`Editar transação ${transaction.descricao || ""}`}
                                icon={
                                  <HugeiconsIcon
                                    icon={Edit02Icon}
                                    size={18}
                                    color="var(--color-emerald-500)"
                                  />
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Excluir transação"
                                onClick={() => setTransactionToDelete(transaction)}
                                aria-label={`Excluir transação ${transaction.descricao || ""}`}
                                icon={
                                  <HugeiconsIcon
                                    icon={Delete02Icon}
                                    size={18}
                                    color="#b91c1c"
                                  />
                                }
                              />
                            </div>
                          ) : (
                            <span
                              className="transacoes-table__readonly"
                              title="Lançamento gerado por outra operação"
                            >
                              Automático
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
          </>
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
        key={editingTransaction?.id || "new-transaction"}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveTransaction}
        initialValues={modalInitialValues}
        title={editingTransaction ? "Editar transação" : "Nova Transação"}
        submitLabel={editingTransaction ? "Salvar alterações" : "Confirmar"}
        theme="auto"
        apiEnabled
      />

      <Modal
        isOpen={Boolean(transactionToDelete)}
        onClose={() => !isDeleting && setTransactionToDelete(null)}
        title="Excluir transação"
        closeOnOverlay={!isDeleting}
        footer={
          <div className="transacoes-modal__actions">
            <Button
              variant="outline"
              onClick={() => setTransactionToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteTransaction}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {transactionToDelete && (
          <p>
            Deseja excluir a transação{" "}
            {transactionToDelete.descricao || "sem descrição"} de{" "}
            {formatCurrency(transactionToDelete.valor)}? O saldo da conta
            financeira será recalculado.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default Transacoes;
