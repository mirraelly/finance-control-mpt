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

const contasPagarReceberService = {
  buscarPorId: async (tipo, id) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const response = await axios.get(`${API_URL}/${endpoint}/${id}`, getAuthConfig());
    return response.data;
  },

  listar: async (tipo, filtros) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const response = await axios.get(`${API_URL}/${endpoint}`, {
      ...getAuthConfig(),
      params: filtros,
    });
    return response.data;
  },

  criar: async (tipo, dados) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const response = await axios.post(
      `${API_URL}/${endpoint}`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },

  atualizar: async (tipo, id, dados) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const response = await axios.patch(
      `${API_URL}/${endpoint}/${id}`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },

  listarParcelas: async (tipo, filtros) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const response = await axios.get(`${API_URL}/${endpoint}/parcelas`, {
      ...getAuthConfig(),
      params: filtros,
    });
    return response.data;
  },

  baixarParcela: async (tipo, parcelaId, dados) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const acao = tipo === "pagar" ? "pagar" : "receber";
    const response = await axios.patch(
      `${API_URL}/${endpoint}/parcelas/${parcelaId}/${acao}`,
      dados,
      getAuthConfig(),
    );
    return response.data;
  },

  estornarBaixa: async (tipo, baixaId) => {
    const endpoint = tipo === "pagar" ? "contas-pagar" : "contas-receber";
    const recurso = tipo === "pagar" ? "pagamentos" : "recebimentos";
    const response = await axios.delete(
      `${API_URL}/${endpoint}/${recurso}/${baixaId}`,
      getAuthConfig(),
    );
    return response.data;
  },
};

export default contasPagarReceberService;
