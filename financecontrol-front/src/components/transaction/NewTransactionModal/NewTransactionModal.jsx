import { useState } from "react";
import {
  HugeiconsIcon,
  Upload01Icon,
  ArrowDownBigIcon,
  ArrowUpBigIcon,
} from "../../../assets/icons";
import Modal from "../../common/Modal/Modal";
import Button from "../../common/Button/Button";
import Input from "../../common/Input/Input";
import Select from "../../common/Select/Select";
import DatePicker from "../../common/DatePicker/Datepicker";
import "./NewTransactionModal.css";

// Dados mockados
const DEFAULT_CURRENCIES = [
  { value: "BRL", label: "R$" },
  { value: "USD", label: "US$" },
  { value: "EUR", label: "€" },
  { value: "GBP", label: "£" },
];

const DEFAULT_VALUES = {
  tipo: "despesa",
  valor: "",
  moeda: "BRL",
  descricao: "",
  categoria: "",
  data: new Date().toISOString().slice(0, 10),
  comprovante: null,
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
}) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setValues({ ...DEFAULT_VALUES, ...initialValues });
    setIsSubmitting(false);
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setValues((current) => ({ ...current, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.({ ...values, valor: Number(values.valor) });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Transação"
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
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      }
    >
      <form
        className="transaction-form"
        onSubmit={handleSubmit}
        id="new-transaction-form"
      >
        <div
          className="transaction-type"
          role="group"
          aria-label="Tipo de transação"
        >
          {[
            ["despesa", "Despesa", "expense", ArrowDownBigIcon],
            ["receita", "Receita", "income", ArrowUpBigIcon],
          ].map(([type, label, modifier, icon]) => (
            <button
              key={type}
              type="button"
              className={`transaction-type__option transaction-type__option--${modifier} ${
                values.tipo === type ? "is-active" : ""
              }`}
              onClick={() =>
                setValues((current) => ({ ...current, tipo: type }))
              }
              aria-pressed={values.tipo === type}
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

        <div className="transaction-form">
          <div class="transaction-value">
            <Select
              id="transaction-currency"
              name="moeda"
              label="MOEDA"
              options={DEFAULT_CURRENCIES}
              value={values.moeda}
              onChange={handleChange}
              theme={theme}
              height="40px"
              fullWidth
              placeholder="Escolha"
            ></Select>

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

          <div className="transaction-form__row">
            <Select
              id="transaction-category"
              name="categoria"
              label="CATEGORIA"
              options={categories}
              value={values.categoria}
              onChange={handleChange}
              theme={theme}
              fullWidth
              required
              placeholder="Selecione uma categoria"
              dropdownPosition="top"
            />

            <DatePicker
              id="transaction-date"
              name="data"
              label="DATA"
              value={values.data}
              onChange={handleChange}
              theme={theme}
              fullWidth
              required
              dropdownPosition="top"
            />
          </div>

          <label className="transaction-upload" htmlFor="transaction-receipt">
            <span className="transaction-upload__label">COMPROVANTE</span>
            <span className="transaction-upload__box">
              <HugeiconsIcon
                aria-hidden="true"
                icon={Upload01Icon}
                size={18}
                stroke="2"
              />
              {values.comprovante?.name || "Clique para anexar um arquivo"}
            </span>
            <input
              id="transaction-receipt"
              name="comprovante"
              type="file"
              accept="image/*,.pdf"
              onChange={handleChange}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

export default NewTransactionModal;
