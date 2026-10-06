import { useEffect, useState } from "react";
import { Add01Icon, Delete02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
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
            Conta Origem <span>*</span>
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
            Conta Destino <span>*</span>
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
            Data <span>*</span>
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
            Valor <span>*</span>
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
          <label htmlFor="descricao">Descrição</label>
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    transferenciaService
      .listarContasSelect()
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao carregar contas:", err));
  }, []);

  useEffect(() => {
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

        setTransferencias(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } catch (err) {
        console.error("Erro ao carregar transferências:", err);
        setError("Não foi possível carregar as transferências.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTransferencias();
  }, [currentPage, pageSize, accountId, debouncedSearch, refreshKey]);

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
      setRefreshKey((current) => current + 1);
    } catch (err) {
      console.error("Erro ao excluir transferência:", err);
      alert("Não foi possível excluir a transferência.");
    }
  };

  if (isCreating) {
    return (
      <div className="transferencias-page">
        <div className="transferencias-page__header" style={{ marginBottom: "var(--space-3)" }}>
          <Button
            variant="ghost"
            icon={<HugeiconsIcon icon={ArrowLeft01Icon} size={18} />}
            onClick={() => setIsCreating(false)}
          >
            Voltar
          </Button>
        </div>
        <Card className="transferencias-table-card" padding="lg" radius="lg" shadow={false}>
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
          placeholder="Buscar descrição..."
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
                  {transferencias.map((item) => (
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