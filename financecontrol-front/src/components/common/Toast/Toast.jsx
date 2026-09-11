import { useEffect } from "react";
import { HugeiconsIcon } from "../../../assets/icons/index";
import {
  CheckIcon,
  InformationCircleIcon,
  Alert02Icon,
  CancelCircleIcon,
  MultiplicationSignIcon,
} from "../../../assets/icons/index";
import toastConfig from "./toastConfig.json";
import "./Toast.css";

const TOAST_DURATION = 10000;

const toastIcons = {
  CheckIcon,
  InformationCircleIcon,
  Alert02Icon,
  CancelCircleIcon,
};

function Toast({ type = "info", title, message, onClose }) {
  const config = toastConfig[type] || toastConfig.info;
  const Icon = config.icon ? toastIcons[config.icon] : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, TOAST_DURATION);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className={`toast ${config.className}`} role="alert">
      <div className="toast-content">
        {Icon && <HugeiconsIcon icon={Icon} size={20} strokeWidth={2} />}
        <div className="toast-text">
          <span className="toast-title">{title || config.title}</span>
          <span className="toast-message">{message || config.message}</span>
        </div>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Fechar mensagem"
      >
        <HugeiconsIcon
          icon={MultiplicationSignIcon}
          size={18}
          strokeWidth={2}
        />
      </button>

      <div className="toast-progress">
        <div
          className="toast-progress__bar"
          style={{
            animationDuration: `${TOAST_DURATION}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default Toast;
