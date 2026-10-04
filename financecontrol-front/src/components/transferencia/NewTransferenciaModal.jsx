import { useEffect, useState } from "react";
import Modal from "../common/Modal/Modal";
import Button from "../common/Button/Button";
import Input from "../common/Input/Input";
import Select from "../common/Select/Select";
import DatePicker from "../common/DatePicker/DatePicker";
import lancamentoFinanceiroService from "../../services/lancamentoFinanceiroService";
import "./NewTransferenciaModal.css";

const DEFAULT_VALUES = {
  valor: "",
  descricao: "",
  categoriaId: "",
  contaOrigemId: "",
  contaDestinoId: "",
  data: new Date().toLocaleDateString("sv-SE"),
};

const EMPTY_INITIAL_VALUES = {};

function NewTransferenciaModal({
  isOpen = false,
  onClose,
  onSubmit,
  theme = "dark",
  initialValues = EMPTY_INITIAL_VALUES,
  apiEnabled = false,
  title = "Nova Transferência",
  submitLabel = "Confirmar Transferência",
}) {
  const [values, setValues] = useState({
    ...DEFAULT_VALUES,
    data: new Date().toLocaleDateString("sv-SE"),
    ...initialValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(apiEnabled);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!apiEnabled || !isOpen) return undefined;

    let isCurrent = true;
    setIsLoadingOptions(true);

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
        setCategories(
          categoryOptions.map((category) => ({
            value: category.id,
            label: category.nome,
          })),
        );
      })
      .catch(() => {
        if (isCurrent)
          setFormError("Não foi possível carregar contas e categorias.");
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOptions(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiEnabled, isOpen]);

  const handleClose = () => {
    setValues({
      ...DEFAULT_VALUES,
      data: new Date().toLocaleDateString("sv-SE"),
      ...initialValues,
    });
    setIsSubmitting(false);
    setFormError("");
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setValues((current) => ({ ...current, [name]: files ? files[0] : value }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.contaOrigemId) {
      setFormError("Selecione a conta de origem.");
      return;
    }
    if (!values.contaDestinoId) {
      setFormError("Selecione a conta de destino.");
      return;
    }
    if (Number(values.contaOrigemId) === Number(values.contaDestinoId)) {
      setFormError("A conta de destino deve ser diferente da conta de origem.");
      return;
    }
    if (!values.valor || Number(values.valor) <= 0) {
      setFormError("Informe um valor maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        ...values,
        valor: Number(values.valor),
        contaOrigemId: Number(values.contaOrigemId),
        contaDestinoId: Number(values.contaDestinoId),
        categoriaId: values.categoriaId ? Number(values.categoriaId) : null,
      });
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar transferência:", error);
      setFormError(
        error?.response?.data?.message ||
          "Não foi possível salvar a transferência. Tente novamente.",
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
      className="new-transferencia-modal"
      bodyClassName="new-transferencia-modal__body"
      footer={
        <div className="transferencia-form__actions">
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
            form="new-transferencia-form"
            variant="primary"
            disabled={isSubmitting || isLoadingOptions}
            fullWidth
          >
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      }
    >
      <form
        className="transferencia-form"
        onSubmit={handleSubmit}
        id="new-transferencia-form"
      >
        <div className="transferencia-accounts-row">
          <Select
            id="transferencia-conta-origem"
            name="contaOrigemId"
            label="CONTA DE ORIGEM"
            options={accounts}
            value={values.contaOrigemId}
            onChange={handleChange}
            theme={theme}
            fullWidth
            required
            disabled={isLoadingOptions || accounts.length === 0}
            placeholder={
              isLoadingOptions ? "Carregando contas..." : "Selecione a origem"
            }
          />

          <Select
            id="transferencia-conta-destino"
            name="contaDestinoId"
            label="CONTA DE DESTINO"
            options={accounts}
            value={values.contaDestinoId}
            onChange={handleChange}
            theme={theme}
            fullWidth
            required
            disabled={isLoadingOptions || accounts.length === 0}
            placeholder={
              isLoadingOptions ? "Carregando contas..." : "Selecione o destino"
            }
          />
        </div>

        <div className="transferencia-value-row">
          <DatePicker
            id="transferencia-date"
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
            id="transferencia-value"
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

        <Select
          id="transferencia-category"
          name="categoriaId"
          label="CATEGORIA (OPCIONAL)"
          options={categories}
          value={values.categoriaId}
          onChange={handleChange}
          theme={theme}
          fullWidth
          disabled={isLoadingOptions || categories.length === 0}
          placeholder="Selecione uma categoria"
          dropdownPosition="top"
        />

        <Input
          id="transferencia-description"
          name="descricao"
          label="DESCRIÇÃO"
          value={values.descricao}
          onChange={handleChange}
          placeholder="Ex: Transferência para reserva..."
          theme={theme}
          fullWidth
          required
        />

        {formError && (
          <p className="transferencia-form__error" role="alert">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default NewTransferenciaModal;