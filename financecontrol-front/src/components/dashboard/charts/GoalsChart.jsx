import {
  HugeiconsIcon,
  Plant01Icon,
  Target01Icon,
  Wallet01Icon,
} from "../../../assets/icons";
import DashboardChartPanel from "../panels/DashboardChartPanel";
import { formatDashboardCurrency } from "../utils/dashboardChartOptions";

const goals = [
  {
    name: "Viagem de Férias",
    saved: 2400,
    target: 5000,
    percent: 55,
    deadline: "Dez/2026",
    color: "#3983f7",
    icon: Plant01Icon,
  },
  {
    name: "Fundo de Emergência",
    saved: 6500,
    target: 10000,
    percent: 81,
    deadline: "Dez/2026",
    color: "#08a779",
    icon: Wallet01Icon,
  },
  {
    name: "Novo Computador",
    saved: 1800,
    target: 7000,
    percent: 30,
    deadline: "Jun/2027",
    color: "#884cff",
    icon: Target01Icon,
  },
];

function GoalsChart() {
  return (
    <DashboardChartPanel title="Minhas metas">
      <ul className="dashboard-goals">
        {goals.map((goal) => {
          return (
            <li className="dashboard-goal" key={goal.name}>
              <span
                className="dashboard-goal__icon"
                style={{ "--goal-color": goal.color }}
                aria-hidden="true"
              >
                <HugeiconsIcon icon={goal.icon} size={16} strokeWidth={2.2} />
              </span>
              <div className="dashboard-goal__content">
                <div className="dashboard-goal__heading">
                  <span>{goal.name}</span>
                  <span>{goal.deadline}</span>
                </div>
                <div className="dashboard-goal__progress-row">
                  <div
                    className="dashboard-goal__progress"
                    role="progressbar"
                    aria-label={goal.name}
                    aria-valuenow={goal.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      style={{
                        width: `${goal.percent}%`,
                        "--goal-color": goal.color,
                      }}
                    />
                  </div>
                  <strong>{goal.percent}%</strong>
                </div>
                <div className="dashboard-goal__details">
                  {formatDashboardCurrency(goal.saved)} /{" "}
                  {formatDashboardCurrency(goal.target)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardChartPanel>
  );
}

export default GoalsChart;
