import { useContext } from "react";
import { ToastContext } from "./toastContext";

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }
  return context.showToast;
}

export default useToast;
