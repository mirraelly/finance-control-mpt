import { useCallback, useMemo, useState } from "react";
import Toast from "./Toast";
import { ToastContext } from "./toastContext";
import "./ToastContainer.css";

let nextToastId = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options) => {
    const normalized =
      typeof options === "string" ? { message: options } : options;
    const id = ++nextToastId;
    setToasts((current) => [
      ...current,
      {
        id,
        type: "info",
        position: "top-right",
        duration: 10000,
        ...normalized,
      },
    ]);
    return id;
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [
    showToast,
    dismissToast,
  ]);
  const positions = [...new Set(toasts.map((toast) => toast.position))];

  return (
    <ToastContext.Provider value={value}>
      {children}
      {positions.map((position) => (
        <div
          key={position}
          className={`toast-container toast-container--${position}`}
          aria-live="polite"
        >
          {toasts
            .filter((toast) => toast.position === position)
            .map(({ id, ...toast }) => (
              <Toast
                key={id}
                {...toast}
                id={id}
                onClose={dismissToast}
              />
            ))}
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
