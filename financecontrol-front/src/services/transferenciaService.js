import axios from "axios";

const API_URL = "http://localhost:8080";

function getAuthConfig() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
}

const transferenciaService = {
  listarContasSelect: async () => {
    const response = await axios.get(
      `${API_URL}/contas-financeiras/select`,
      getAuthConfig()
    );
    return response.data;
  },

  listar: async (filtros) => {
    const response = await axios.get(`${API_URL}/transferencias`, {
      ...getAuthConfig(),
      params: filtros,
    });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await axios.get(
      `${API_URL}/transferencias/${id}`,
      getAuthConfig()
    );
    return response.data;
  },

  criar: async (dados) => {
    const payload = {
      contaOrigemId: dados.contaOrigemId,
      contaDestinoId: dados.contaDestinoId,
      valor: Number(dados.valor),
      data: dados.data,
      descricao: dados.descricao ? dados.descricao.trim() : "",
    };

    const response = await axios.post(
      `${API_URL}/transferencias`,
      payload,
      getAuthConfig()
    );
    return response.data;
  },

  deletar: async (id) => {
    const response = await axios.delete(
      `${API_URL}/transferencias/${id}`,
      getAuthConfig()
    );
    return response.data;
  },
};

export default transferenciaService;