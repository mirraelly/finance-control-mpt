import { useEffect, useState } from "react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import {
  HugeiconsIcon,
  Wallet01Icon,
  Search01Icon,
} from "../../assets/icons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import EmptyState from "../../components/common/EmptyState";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination/Pagination";
import NewTransferenciaModal from "../../components/transferencia/NewTransferenciaModal";
import transferenciaService from "../../services/transferenciaService";
import "./Transferencias.css";

const PAGE_SIZE_DEFAULT = 15;

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

function matchesTransferenciaFilters(transferencia, { search, accountId }) {
  const matchesSearch = !search
    || (transferencia.descricao || "").toLocaleLowerCase().includes(search.toLocaleLowerCase());
  const matchesAccount = !accountId
    || transferencia.contaOrigemId === accountId
    || transferencia.contaDestinoId === accountId;

  return matchesSearch && matchesAccount;
}

function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountsError, setAccountsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let isCurrent = true;

    transferenciaService
      .listarContasSelect()
      .then((items) => {
        if (isCurrent) setAccounts(items);
      })
      .catch((loadError) => {
        console.error("Erro ao carregar contas das transferências:", loadError);
        if (isCurrent) {
          setAccountsError("Não foi possível carregar as contas.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadTransferencias() {
      try {
        setIsLoading(true);
        setError("");
        const response = await transferenciaService.listar({
          page: currentPage,
          size: pageSize,
          contaFinanceiraId: accountId || undefined,
          descricao: debouncedSearch || undefined,
        });
        if (!isCurrent) return;
        const filteredTransferencias = response.content.filter((transferencia) =>
          matchesTransferenciaFilters(transferencia, {
            search: debouncedSearch,
            accountId,
          }),
        );
        const apiIgnoredFilters = filteredTransferencias.length !== response.content.length;

        setTransferencias(filteredTransferencias);
        setTotalPages(
          apiIgnoredFilters
            ? Math.ceil(filteredTransferencias.length / pageSize)
            : response.totalPages,
        );
        setTotalElements(
          apiIgnoredFilters ? filteredTransferencias.length : response.totalElements,
        );
      } catch (loadError) {
        console.error("Erro ao carregar transferências:", loadError);
        if (isCurrent) {
          setError("Não foi possível carregar as transferências.");
          setTransferencias([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTransferencias();
    return () => {
      isCurrent = false;
    };
  }, [currentPage, pageSize, accountId, debouncedSearch, refreshKey]);

  const handleSaveTransferencia = async (values) => {
    await transferenciaService.criar(values);

    setCurrentPage(0);
    setRefreshKey((current) => current + 1);
  };

  const handleDeleteTransferencia = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transferência?")) return;

    try {
      await transferenciaService.deletar(id);
      setRefreshKey((current) => current + 1);
    } catch (deleteError) {
      console.error("Erro ao excluir transferência:", deleteError);
      alert("Não foi possível excluir a transferência.");
    }
  };

  const openNewTransferencia = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="transferencias-page">
      <Card
        className="transferencias-toolbar"
        padding="sm"
        radius="lg"
        shadow={false}
      >
        <Input
          id="transferencias-search"
          type="search"
          icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
          placeholder="Buscar descrição..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(0);
          }}
          fullWidth
          className="transferencias-toolbar__search"
        />

        <div className="transferencias-toolbar__filters">
          <Select
            id="transferencias-account"
            aria-label="Filtrar por conta"
            options={[
              { value: "", label: "Todas as contas" },
              ...accounts.map((account) => ({
                value: account.id,
                label: account.nome || account.descricao,
              })),
            ]}
            value={accountId}
            onChange={(event) => {
              setAccountId(event.target.value);
              setCurrentPage(0);
            }}
            width="200px"
            className="transferencias-toolbar__account"
          />

          <Button
            icon={<HugeiconsIcon icon={Add01Icon} size={18} stroke="2" />}
            onClick={openNewTransferencia}
          >
            Nova Transferência
          </Button>
        </div>
      </Card>

      {accountsError && (
        <p className="transferencias-page__error" role="alert">
          {accountsError}
        </p>
      )}

      <Card
        className="transferencias-table-card"
        padding="none"
        radius="lg"
        shadow={false}
      >
        {error ? (
          <EmptyState
            icon={<HugeiconsIcon icon={Wallet01Icon} size={32} />}
            title="Erro ao carregar transferências"
            description={error}
            fullWidth
          />
        ) : isLoading && transferencias.length === 0 ? (
          <Loading message="Carregando transferências..." />
        ) : totalElements > 0 ? (
          <>
            <div
              className={`transferencias-table__wrapper${isLoading ? " transferencias-table__wrapper--loading" : ""}`}
              aria-busy={isLoading}
            >
              <table className="transferencias-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Conta origem</th>
                    <th>Conta destino</th>
                    <th>Descrição</th>
                    <th className="transferencias-table__value-col">Valor</th>
                    <th className="transferencias-table__actions-col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transferencias.map((transferencia) => (
                    <tr key={transferencia.id}>
                      <td className="transferencias-table__muted">
                        {formatDate(transferencia.data)}
                      </td>
                      <td className="transferencias-table__muted">
                        {transferencia.contaOrigemNome || transferencia.contaOrigemId}
                      </td>
                      <td className="transferencias-table__muted">
                        {transferencia.contaDestinoNome || transferencia.contaDestinoId}
                      </td>
                      <td>
                        <div className="transferencias-table__description">
                          <span>{transferencia.descricao || "—"}</span>
                        </div>
                      </td>
                      <td className="transferencias-table__value">
                        {formatCurrency(transferencia.valor)}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransferencia(transferencia.id)}
                          aria-label={`Excluir transferência ${transferencia.descricao || ""}`}
                          icon={
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              size={18}
                              color="var(--color-rose-500, #f43f5e)"
                            />
                          }
                        />
                      </td>
                    </tr>
                  ))}
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
            title="Nenhuma transferência encontrada"
            description="Tente ajustar a busca ou o filtro de conta selecionado."
            fullWidth
          />
        )}
      </Card>

    <NewTransferenciaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveTransferencia}
        theme="auto"
        apiEnabled
      />
    </div>
  );
}

export default Transferencias;