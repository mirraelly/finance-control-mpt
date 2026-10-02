import { useId } from "react";
import "./DashboardChartPanel.css";

function DashboardChartPanel({
  title,
  description,
  action,
  children,
  className = "",
}) {
  const titleId = useId();

  return (
    <section
      className={`dashboard-panel ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <header className="dashboard-panel__header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action && <div className="dashboard-panel__action">{action}</div>}
      </header>
      {children}
    </section>
  );
}

export default DashboardChartPanel;
