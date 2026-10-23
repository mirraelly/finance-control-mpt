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
};

export default dashboardService;
