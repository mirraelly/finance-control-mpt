import { forwardRef } from "react";
import "./EmptyState.css";

const EmptyState = forwardRef(function (
  {
    title = "Nenhum dado encontrado",
    description = "Não encontramos resultados para a sua busca ou filtro.",
    icon,
    action,
    fullWidth = false,
    className = "",
    ...props
  },
  ref,
) {
  const classNames = [
    "empty-state",
    fullWidth && "empty-state--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classNames} {...props}>
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      {title && <h3 className="empty-state__title">{title}</h3>}

      {description && <p className="empty-state__description">{description}</p>}

      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;
