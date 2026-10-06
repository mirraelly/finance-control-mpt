import axios from "axios";

const API_URL = "http://localhost:8080";

function getAuthConfig() {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

const formaPagamentoService = {
  buscarPorId: async (id) => {
    const response = await axios.get(
      `${API_URL}/formas-pagamento/${id}`,
      getAuthConfig(),
    );
    return response.data;
  },

  listar: async (filtros) => {
    const response = await axios.get(`${API_URL}/formas-pagamento`, {
      ...getAuthConfig(),
      params: filtros,
    });
    return response.data;
  },

  criar: async (dados) => {
    const response = await axios.post(
      `${API_URL}/formas-pagamento`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await axios.put(
      `${API_URL}/formas-pagamento/${id}`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },
};

export default formaPagamentoService;
