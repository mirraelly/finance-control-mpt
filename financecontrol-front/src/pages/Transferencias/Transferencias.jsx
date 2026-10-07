import { useEffect, useMemo, useState } from "react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import {
  HugeiconsIcon,
  Wallet01Icon,
  Search01Icon,
  Undo03Icon,
} from "../../assets/icons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import EmptyState from "../../components/common/EmptyState";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination/Pagination";
import transferenciaService from "../../services/transferenciaService";
import "./Transferencias.css";

const PAGE_SIZE_DEFAULT = 15;
const API_PAGE_SIZE = 100;

async function listarTodasTransferencias() {
  const primeiraPagina = await transferenciaService.listar({
    page: 0,
    size: API_PAGE_SIZE,
  });
  const totalPaginas = primeiraPagina.totalPages || 1;
  const paginasRestantes = await Promise.all(
    Array.from({ length: Math.max(0, totalPaginas - 1) }, (_, index) =>
      transferenciaService.listar({
        page: index + 1,
        size: API_PAGE_SIZE,
      }),
    ),
  );

  return [
    ...(primeiraPagina.content || []),
    ...paginasRestantes.flatMap((pagina) => pagina.content || []),
  ];
}

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

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function FormTransferencia({ accounts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contaOrigemId: "",
    contaDestinoId: "",
    data: getTodayIsoDate(),
    valor: "",
    descricao: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountOptions = [
    { value: "", label: "Selecione a conta" },
    ...accounts.map((acc) => ({
      value: String(acc.id),
      label: acc.nome,
    })),
  ];

  
  const destinationAccountOptions = accountOptions.filter(
    (opt) => !formData.contaOrigemId || opt.value === "" || opt.value !== formData.contaOrigemId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.contaOrigemId) {
      setError("Selecione a conta de origem.");
      return;
    }
    if (!formData.contaDestinoId) {
      setError("Selecione a conta de destino.");
      return;
    }
    if (formData.contaOrigemId === formData.contaDestinoId) {
      setError("A conta de destino deve ser diferente da conta de origem.");
      return;
    }
    if (!formData.valor || Number(formData.valor) <= 0) {
      setError("Informe um valor válido maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        contaOrigemId: formData.contaOrigemId,
        contaDestinoId: formData.contaDestinoId,
        valor: Number(formData.valor),
        data: formData.data,
        descricao: formData.descricao.trim(),
      };
      await onSubmit(payload);
    } catch (err) {
      console.error("Erro ao realizar transferência:", err);
      setError(
        err?.response?.data?.message || err?.message || "Não foi possível realizar a transferência."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-transferencia">
      {error && <p className="transferencias-page__error">{error}</p>}

      <div className="form-transferencia__grid">
        <div className="form-field">
          <label htmlFor="contaOrigemId">
            CONTA ORIGEM <span> *</span>
          </label>
          <Select
            id="contaOrigemId"
            value={formData.contaOrigemId}
            onChange={(e) => {
              const selectedOrigem = e.target.value;
              setFormData((prev) => ({
                ...prev,
                contaOrigemId: selectedOrigem,
              
                contaDestinoId: prev.contaDestinoId === selectedOrigem ? "" : prev.contaDestinoId,
              }));
            }}
            options={accountOptions}
            required
            fullWidth
          />
        </div>

        <div className="form-field">
          <label htmlFor="contaDestinoId">
            CONTA DESTINO<span> *</span>
          </label>
          <Select
            id="contaDestinoId"
            value={formData.contaDestinoId}
            onChange={(e) => setFormData((prev) => ({ ...prev, contaDestinoId: e.target.value }))}
            options={destinationAccountOptions}
            required
            fullWidth
          />
        </div>

        <div className="form-field">
          <label htmlFor="data">
            DATA <span>*</span>
          </label>
          <Input
            id="data"
            type="date"
            value={formData.data}
            onChange={(e) => setFormData((prev) => ({ ...prev, data: e.target.value }))}
            required
            fullWidth
          />
        </div>

        <div className="form-field">
          <label htmlFor="valor">
            VALOR <span>*</span>
          </label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.valor}
            onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
            required
            fullWidth
          />
        </div>

        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="descricao">DESCRIÇÃO</label>
          <Input
            id="descricao"
            type="text"
            placeholder="Ex: Transferência para reserva"
            value={formData.descricao}
            onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
            fullWidth
          />
        </div>
      </div>

      <div className="form-transferencia__actions">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Confirmar
        </Button>
      </div>
    </form>
  );
}

function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    transferenciaService
      .listarContasSelect()
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao carregar contas:", err));
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadTransferencias() {
      try {
        setIsLoading(true);
        setError("");
        const response = await listarTodasTransferencias();
        if (isCurrent) setTransferencias(response);
      } catch (err) {
        console.error("Erro ao carregar transferências:", err);
        if (isCurrent) {
          setError("Não foi possível carregar as transferências.");
          setTransferencias([]);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTransferencias();
    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  const transferenciasFiltradas = useMemo(() => {
    const search = normalizeSearchText(searchTerm.trim());

    return transferencias.filter((item) => {
      const correspondeConta =
        !accountId ||
        String(item.contaOrigemId) === accountId ||
        String(item.contaDestinoId) === accountId;
      if (!correspondeConta) return false;
      if (!search) return true;

      const searchableValues = [
        item.descricao,
        item.contaOrigemNome,
        item.contaOrigemId,
        item.contaDestinoNome,
        item.contaDestinoId,
        item.data,
        formatDate(item.data),
        item.valor,
        formatCurrency(item.valor),
      ];

      return searchableValues.some((value) =>
        normalizeSearchText(value).includes(search),
      );
    });
  }, [transferencias, accountId, searchTerm]);

  const totalElements = transferenciasFiltradas.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const transferenciasDaPagina = transferenciasFiltradas.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handleSaveTransferencia = async (payload) => {
    await transferenciaService.criar(payload);
    setIsCreating(false);
    setCurrentPage(0);
    setRefreshKey((current) => current + 1);
  };

  const handleDeleteTransferencia = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transferência?")) return;

    try {
      await transferenciaService.deletar(id);
      setCurrentPage(0);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      console.error("Erro ao excluir transferência:", err);
      alert("Não foi possível excluir a transferência.");
    }
  };

  if (isCreating) {
    return (
      <div className="transferencias-page">
        <Card className="transferencias-table-card" padding="lg" radius="lg" shadow={false}>
          <div className="transferencias-page__header">
            <h2>Nova Transferência</h2>
            <button
              className="transferencias-page__back"
              type="button"
              aria-label="Voltar à lista de transferências"
              title="Voltar à lista de transferências"
              onClick={() => setIsCreating(false)}
            >
              <HugeiconsIcon icon={Undo03Icon} size={20} />
            </button>
          </div>
          <FormTransferencia
            accounts={accounts}
            onSubmit={handleSaveTransferencia}
            onCancel={() => setIsCreating(false)}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="transferencias-page">
      <Card className="transferencias-toolbar" padding="sm" radius="lg" shadow={false}>
        <Input
          id="transferencias-search"
          type="search"
          icon={<HugeiconsIcon icon={Search01Icon} size={18} stroke="2" />}
          placeholder="Buscar transferências..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
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
              ...accounts.map((acc) => ({
                value: String(acc.id),
                label: acc.nome,
              })),
            ]}
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setCurrentPage(0);
            }}
            width="200px"
            className="transferencias-toolbar__account"
          />

          <Button
            icon={<HugeiconsIcon icon={Add01Icon} size={18} stroke="2" />}
            onClick={() => setIsCreating(true)}
          >
            Nova Transferência
          </Button>
        </div>
      </Card>

      <Card className="transferencias-table-card" padding="none" radius="lg" shadow={false}>
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
            <div className="transferencias-table__wrapper">
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
                  {transferenciasDaPagina.map((item) => (
                    <tr key={item.id}>
                      <td className="transferencias-table__muted">{formatDate(item.data)}</td>
                      <td className="transferencias-table__muted">
                        {item.contaOrigemNome || item.contaOrigemId}
                      </td>
                      <td className="transferencias-table__muted">
                        {item.contaDestinoNome || item.contaDestinoId}
                      </td>
                      <td>
                        <div className="transferencias-table__description">
                          <span>{item.descricao || "—"}</span>
                        </div>
                      </td>
                      <td className="transferencias-table__value">{formatCurrency(item.valor)}</td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransferencia(item.id)}
                          aria-label="Excluir transferência"
                          icon={
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              size={18}
                              color="var(--danger)"
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
    </div>
  );
}

export default Transferencias;