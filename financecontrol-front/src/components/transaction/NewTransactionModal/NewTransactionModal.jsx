import { useEffect, useState } from "react";
import {
  HugeiconsIcon,
  ArrowDownBigIcon,
  ArrowUpBigIcon,
} from "../../../assets/icons";
import Modal from "../../common/Modal/Modal";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import Select from "../../common/Select/Select";
import DatePicker from "../../common/DatePicker/Datepicker";
import useToast from "../../common/Toast/useToast";
import lancamentoFinanceiroService from "../../../services/lancamentoFinanceiroService";
import { showApiErrorToast } from "../../../utils/toastErrors";
import "./NewTransactionModal.css";

const DEFAULT_VALUES = {
  tipo: "despesa",
  valor: "",
  descricao: "",
  categoria: "",
  contaFinanceiraId: "",
  data: new Date().toISOString().slice(0, 10),
};

const DEFAULT_CATEGORIES = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "moradia", label: "Moradia" },
  { value: "saude", label: "Saúde" },
  { value: "lazer", label: "Lazer" },
  { value: "outros", label: "Outros" },
];

const EMPTY_INITIAL_VALUES = {};

function NewTransactionModal({
  isOpen = false,
  onClose,
  onSubmit,
  categories = DEFAULT_CATEGORIES,
  theme = "dark",
  initialValues = EMPTY_INITIAL_VALUES,
  apiEnabled = false,
  title = "Nova Transação",
  submitLabel = "Confirmar",
}) {
  const showToast = useToast();
  const [values, setValues] = useState({
    ...DEFAULT_VALUES,
    data: new Date().toLocaleDateString("sv-SE"),
    ...initialValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(apiEnabled);
  const [apiCategories, setApiCategories] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (!apiEnabled) return undefined;

    let isCurrent = true;

    Promise.all([
      lancamentoFinanceiroService.listarContasAtivas(),
      lancamentoFinanceiroService.listarCategoriasAtivas(),
    ])
      .then(([accountOptions, categoryOptions]) => {
        if (!isCurrent) return;
        setAccounts(
          accountOptions.map((account) => ({
            value: account.id,
            label: account.nome,
          })),
        );
        setApiCategories(
          categoryOptions.map((category) => ({
            value: category.id,
            label: category.nome,
          })),
        );
      })
      .catch((error) => {
        if (isCurrent) {
          showApiErrorToast(
            showToast,
            error,
            "Não foi possível carregar contas e categorias.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOptions(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiEnabled, showToast]);

  const categoryOptions = apiCategories ?? (apiEnabled ? [] : categories);

  const handleClose = () => {
    setValues({
      ...DEFAULT_VALUES,
      data: new Date().toLocaleDateString("sv-SE"),
      ...initialValues,
    });
    setIsSubmitting(false);
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setValues((current) => ({ ...current, [name]: files ? files[0] : value }));
  };

  const handleTypeChange = (tipo) => {
    setValues((current) => ({ ...current, tipo }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const camposObrigatorios = [];

    if (apiEnabled && !values.contaFinanceiraId) {
      camposObrigatorios.push("Conta financeira");
    }
    if (!values.data) {
      camposObrigatorios.push("Data");
    }
    if (!String(values.valor).trim()) {
      camposObrigatorios.push("Valor");
    }
    if (!String(values.descricao ?? "").trim()) {
      camposObrigatorios.push("Descrição");
    }

    if (camposObrigatorios.length > 0) {
      showToast({
        type: "error",
        title: "Dados inválidos",
        message: `Preencha os campos obrigatórios: ${camposObrigatorios.join(", ")}.`,
      });
      return;
    }

    if (!Number.isFinite(Number(values.valor)) || Number(values.valor) <= 0) {
      showToast({
        type: "error",
        title: "Dados inválidos",
        message: "Informe um valor maior que zero.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.({ ...values, valor: Number(values.valor) });
      if (apiEnabled) {
        showToast({
          type: "success",
          title: "Operação concluída",
          message: "Transação salva com sucesso.",
        });
      }
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      showApiErrorToast(
        showToast,
        error,
        "Não foi possível salvar a transação. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      theme={theme}
      size="md"
      className="new-transaction-modal"
      bodyClassName="new-transaction-modal__body"
      footer={
        <div className="transaction-form__actions">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-transaction-form"
            variant={values.tipo === "despesa" ? "secondary" : "primary"}
            disabled={isSubmitting || isLoadingOptions}
            fullWidth
          >
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      }
    >
      <form
        className="transaction-form"
        onSubmit={handleSubmit}
        id="new-transaction-form"
        noValidate
      >
        <div
          className="transaction-type"
          role="group"
          aria-label="Tipo de transação"
        >
          {[
            {
              tipo: "despesa",
              label: "Despesa",
              modifier: "expense",
              icon: ArrowDownBigIcon,
            },
            {
              tipo: "receita",
              label: "Receita",
              modifier: "income",
              icon: ArrowUpBigIcon,
            },
          ].map(({ tipo, label, modifier, icon }) => (
            <button
              key={tipo}
              type="button"
              className={`transaction-type__option transaction-type__option--${modifier} ${
                values.tipo === tipo ? "is-active" : ""
              }`}
              onClick={() => handleTypeChange(tipo)}
              aria-pressed={values.tipo === tipo}
            >
              <HugeiconsIcon
                icon={icon}
                size={16}
                stroke="2"
                aria-hidden="true"
              />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {apiEnabled && (
          <Select
            id="transaction-account"
            name="contaFinanceiraId"
            label="CONTA FINANCEIRA"
            options={accounts}
            value={values.contaFinanceiraId}
            onChange={handleChange}
            theme={theme}
            fullWidth
            required
            disabled={isLoadingOptions || accounts.length === 0}
            placeholder={
              isLoadingOptions ? "Carregando contas..." : "Selecione uma conta"
            }
          />
        )}

        <div className="transaction-value">
          <DatePicker
            id="transaction-date"
            name="data"
            label="DATA"
            value={values.data}
            onChange={handleChange}
            theme={theme}
            fullWidth
            required
            dropdownPosition="right"
          />

          <Input
            id="transaction-value"
            name="valor"
            label="VALOR"
            type="number"
            min="0.01"
            step="0.01"
            value={values.valor}
            onChange={handleChange}
            placeholder="0,00"
            theme={theme}
            fullWidth
            required
          />
        </div>

        <div>
          <Select
            id="transaction-category"
            name="categoria"
            label="CATEGORIA"
            options={categoryOptions}
            value={values.categoria}
            onChange={handleChange}
            theme={theme}
            fullWidth
            disabled={isLoadingOptions || categoryOptions.length === 0}
            placeholder="Selecione uma categoria"
            dropdownPosition="top"
          />
        </div>

        <Input
          id="transaction-description"
          name="descricao"
          label="DESCRIÇÃO"
          value={values.descricao}
          onChange={handleChange}
          placeholder="Ex: Mercado Extra, Salário..."
          theme={theme}
          fullWidth
          required
        />

      </form>
    </Modal>
  );
}

export default NewTransactionModal;
