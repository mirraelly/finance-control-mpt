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

const categoriaService = {
  listarAtivas: async () => {
    const response = await axios.get(
      `${API_URL}/categorias/select`,
      getAuthConfig(),
    );
    return response.data;
  },

  listar: async (filtros) => {
    const response = await axios.get(`${API_URL}/categorias`, {
      ...getAuthConfig(),
      params: filtros,
    });
    return response.data;
  },

  criar: async (dados) => {
    const response = await axios.post(
      `${API_URL}/categorias`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await axios.put(
      `${API_URL}/categorias/${id}`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },
};

export default categoriaService;
