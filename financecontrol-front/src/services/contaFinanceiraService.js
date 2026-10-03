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

const contaFinanceiraService = {
  listar: async (filtros) => {
    const response = await axios.get(`${API_URL}/contas-financeiras`, {
      ...getAuthConfig(),
      params: filtros,
    });
    return response.data;
  },

  criar: async (dados) => {
    const response = await axios.post(
      `${API_URL}/contas-financeiras`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await axios.put(
      `${API_URL}/contas-financeiras/${id}`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },
};

export default contaFinanceiraService;
