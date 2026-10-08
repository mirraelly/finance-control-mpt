function getApiErrorToast(error, fallbackMessage) {
  const status = error?.response?.status;
  const responseMessage =
    error?.response?.data?.erro ||
    error?.response?.data?.message ||
    error?.response?.data?.detail;

  if (status === 400 || status === 422) {
    return {
      type: "error",
      title: "Dados inválidos",
      message: responseMessage || fallbackMessage,
    };
  }

  if (status === 401 || status === 403) {
    return {
      type: "error",
      title: "Falha de autenticação",
      message:
        responseMessage ||
        (status === 401
          ? "Sua sessão expirou. Entre novamente."
          : "Você não tem permissão para realizar esta ação."),
    };
  }

  if (!error?.response) {
    return {
      type: "error",
      title: "Falha na requisição",
      message: "Não foi possível conectar ao servidor. Verifique sua conexão.",
    };
  }

  return {
    type: "error",
    title: status >= 500 ? "Erro inesperado" : "Erro na requisição",
    message: responseMessage || fallbackMessage,
  };
}

function showApiErrorToast(showToast, error, fallbackMessage) {
  showToast(getApiErrorToast(error, fallbackMessage));
}

export { getApiErrorToast, showApiErrorToast };
