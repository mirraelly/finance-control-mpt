import {
  ArrowDownBigIcon,
  ArrowUpBigIcon,
  Chart01Icon,
  HugeiconsIcon,
  Wallet01Icon,
} from "../../assets/icons";
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
    },
    {
      label: "Receitas do mês",
      amount: formatarMoeda(resumo?.receitasMes),
      icon: ArrowUpBigIcon,
      tone: "blue",
    },
    {
      label: "Despesas do mês",
      amount: formatarMoeda(resumo?.despesasMes),
      icon: ArrowDownBigIcon,
      tone: "rose",
    },
    {
      label: "Saldo do mês",
      amount: formatarMoeda(resumo?.saldoMes),
      icon: Chart01Icon,
      tone: "green",
    },
  ];
}

function DashboardSummary({ resumo, erro }) {
  const summaryItems = criarItensResumo(resumo);

  return (
    <div
      className="dashboard-summary"
      aria-label="Indicadores financeiros"
      aria-busy={!resumo && !erro}
    >
      {summaryItems.map((item) => (
        <article
          key={item.label}
          className={`dashboard-stat dashboard-stat--${item.tone}`}
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
        </article>
      ))}
    </div>
  );
}

export default DashboardSummary;
