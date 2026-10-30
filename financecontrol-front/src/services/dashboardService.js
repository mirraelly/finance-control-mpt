import axios from "axios";

const API_URL = "http://localhost:8080";

function getAuthConfig() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

const dashboardService = {
  buscarResumo: async (anoMes) => {
    const response = await axios.get(`${API_URL}/dashboard/resumo`, {
      ...getAuthConfig(),
      params: { anoMes },
    });
    return response.data;
  },

  buscarReceitasDespesas: async ({ dataInicio, dataFim }) => {
    const response = await axios.get(`${API_URL}/dashboard/receitas-despesas`, {
      ...getAuthConfig(),
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  buscarSaldoAtualPorConta: async () => {
    const response = await axios.get(
      `${API_URL}/dashboard/saldo-atual-por-conta`,
      getAuthConfig(),
    );
    return response.data;
  },

  buscarPatrimonio: async (ano) => {
    const response = await axios.get(`${API_URL}/dashboard/patrimonio`, {
      ...getAuthConfig(),
      params: { ano },
    });
    return response.data;
  },

  buscarDespesasPorCategoria: async ({ dataInicio, dataFim }) => {
    const response = await axios.get(`${API_URL}/dashboard/despesas-por-categoria`, {
      ...getAuthConfig(),
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  buscarReceitasPorCategoria: async ({ dataInicio, dataFim }) => {
    const response = await axios.get(`${API_URL}/dashboard/receitas-por-categoria`, {
      ...getAuthConfig(),
      params: { dataInicio, dataFim },
    });
    return response.data;
  },
};

export default dashboardService;
