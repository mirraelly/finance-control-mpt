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
    const type = normalized.type || "info";
    const title = normalized.title || "";
    const message = normalized.message || "";
    const position = normalized.position || "top-right";
    const id = ++nextToastId;

    setToasts((current) => {
      const duplicate = current.find(
        (toast) =>
          toast.type === type &&
          (toast.title || "") === title &&
          (toast.message || "") === message &&
          toast.position === position,
      );

      if (duplicate) return current;

      return [
        ...current,
        {
          id,
          position,
          duration: 10000,
          ...normalized,
          type,
        },
      ];
    });
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
