import {
  ArrowDown04Icon,
  ArrowDownBigIcon,
  ArrowUp04Icon,
  ArrowUpBigIcon,
  Chart01Icon,
  HugeiconsIcon,
  Wallet01Icon,
} from "../../assets/icons";
import "./DashboardSummary.css";

const summaryItems = [
  {
    label: "Saldo total",
    amount: "R$ 8.450,00",
    change: "12%",
    comparison: "em relação ao mês anterior",
    icon: Wallet01Icon,
    tone: "mint",
  },
  {
    label: "Receitas do mês",
    amount: "R$ 5.800,00",
    change: "8%",
    comparison: "em relação ao mês anterior",
    icon: ArrowUpBigIcon,
    tone: "blue",
  },
  {
    label: "Despesas do mês",
    amount: "R$ 3.420,00",
    change: "5%",
    comparison: "em relação ao mês anterior",
    icon: ArrowDownBigIcon,
    tone: "rose",
    trend: "negative",
  },
  {
    label: "Saldo do mês",
    amount: "R$ 2.380,00",
    change: "20%",
    comparison: "em relação ao mês anterior",
    icon: Chart01Icon,
    tone: "green",
  },
];

function DashboardSummary() {
  return (
    <div className="dashboard-summary" aria-label="Indicadores financeiros">
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
            <p
              className={`dashboard-stat__comparison${
                item.trend === "negative"
                  ? " dashboard-stat__comparison--negative"
                  : ""
              }`}
            >
              <HugeiconsIcon
                icon={
                  item.trend === "negative" ? ArrowDown04Icon : ArrowUp04Icon
                }
                size={12}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <strong>{item.change}</strong>
              <span>{item.comparison}</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default DashboardSummary;
