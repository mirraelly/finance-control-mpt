import { useEffect, useId } from "react";
import { HugeiconsIcon, MultiplicationSignIcon } from "../../../assets/icons";
import "./Modal.css";

function Modal({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  theme = "dark",
  size = "md",
  showCloseButton = true,
  closeOnOverlay = true,
  className = "",
  bodyClassName = "",
  ariaLabel,
}) {
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && onClose) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const classNames = [
    "modal-content",
    `modal-content--${theme}`,
    `modal-content--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="modal-overlay"
      onClick={closeOnOverlay && onClose ? onClose : undefined}
      role="presentation"
    >
      <div
        className={classNames}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
      >
        {(title || subtitle || (showCloseButton && onClose)) && (
          <header className="modal-header">
            <div className="modal-heading">
              {title && <h2 id={titleId}>{title}</h2>}
              {subtitle && <p id={subtitleId}>{subtitle}</p>}
            </div>
            {showCloseButton && onClose && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Fechar"
              >
                <HugeiconsIcon
                  icon={MultiplicationSignIcon}
                  size={24}
                  stroke="2"
                />
              </button>
            )}
          </header>
        )}
        {children && (
          <div className={`modal-body ${bodyClassName}`}>{children}</div>
        )}
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export default Modal;
