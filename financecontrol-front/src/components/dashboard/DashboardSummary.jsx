import {
  ArrowDownBigIcon,
  ArrowUpBigIcon,
  Chart01Icon,
  HugeiconsIcon,
  Wallet01Icon,
} from "../../assets/icons";
import { useNavigate } from "react-router-dom";
import "./DashboardSummary.css";

const formatarMoeda = (valor) =>
  valor === null || valor === undefined
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));

function criarItensResumo(resumo) {
  return [
    {
      label: "Saldo total",
      amount: formatarMoeda(resumo?.saldoTotal),
      icon: Wallet01Icon,
      tone: "mint",
      filter: "all",
    },
    {
      label: "Receitas do mês",
      amount: formatarMoeda(resumo?.receitasMes),
      icon: ArrowUpBigIcon,
      tone: "blue",
      filter: "receitas",
    },
    {
      label: "Despesas do mês",
      amount: formatarMoeda(resumo?.despesasMes),
      icon: ArrowDownBigIcon,
      tone: "rose",
      filter: "despesas",
    },
    {
      label: "Saldo do mês",
      amount: formatarMoeda(resumo?.saldoMes),
      icon: Chart01Icon,
      tone: "green",
      filter: "month",
    },
  ];
}

function DashboardSummary({ resumo, erro }) {
  const navigate = useNavigate();
  const summaryItems = criarItensResumo(resumo);
  const today = new Date();
  const anoMes = resumo?.mes || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const handleSummaryClick = (filter) => {
    if (filter === "all") {
      navigate("/movimentacoes/transacoes");
      return;
    }

    const [year, month] = anoMes.split("-");
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const searchParams = new URLSearchParams({
      dataInicio: `${anoMes}-01`,
      dataFim: `${anoMes}-${String(lastDay).padStart(2, "0")}`,
    });
    if (filter === "receitas" || filter === "despesas") {
      searchParams.set("tipo", filter);
    }
    navigate(`/movimentacoes/transacoes?${searchParams.toString()}`);
  };

  return (
    <div
      className="dashboard-summary"
      aria-label="Indicadores financeiros"
      aria-busy={!resumo && !erro}
    >
      {summaryItems.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`dashboard-stat dashboard-stat--${item.tone}`}
          onClick={() => handleSummaryClick(item.filter)}
          aria-label={`Ver transações: ${item.label}`}
        >
          <span className="dashboard-stat__icon" aria-hidden="true">
            <HugeiconsIcon icon={item.icon} size={24} strokeWidth={2.2} />
          </span>
          <div className="dashboard-stat__content">
            <h2 className="dashboard-stat__label">{item.label}</h2>
            <p className="dashboard-stat__amount">{item.amount}</p>
            {erro ? (
              <p className="dashboard-stat__comparison dashboard-stat__comparison--negative">
                Nao foi possivel atualizar
              </p>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}

export default DashboardSummary;
