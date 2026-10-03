import axios from "axios";

const API_URL = "http://localhost:8080";

function getAuthConfig() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
}

const lancamentoFinanceiroService = {
    listarContasAtivas: async () => {
        const response = await axios.get(
            `${API_URL}/contas-financeiras/select`,
            getAuthConfig(),
        );
        return response.data;
    },

    listarCategoriasAtivas: async () => {
        const response = await axios.get(
            `${API_URL}/categorias/select`,
            getAuthConfig(),
        );
        return response.data;
    },

    listarLancamentos: async (filtros) => {
        const response = await axios.get(
            `${API_URL}/lancamentos`,
            {
                ...getAuthConfig(),
                params: filtros,
            },
        );
        return response.data;
    },

    criar: async (values) => {
        const response = await axios.post(
            `${API_URL}/lancamentos`,
            {
                contaFinanceiraId: values.contaFinanceiraId,
                categoriaId: values.categoria || null,
                tipo: values.tipo === "receita" ? "ENTRADA" : "SAIDA",
                valor: Number(values.valor),
                data: values.data,
                descricao: values.descricao,
            },
            getAuthConfig(),
        );
        return response.data;
    },

    atualizar: async (id, values) => {
        const response = await axios.put(
            `${API_URL}/lancamentos/${id}`,
            {
                contaFinanceiraId: values.contaFinanceiraId,
                categoriaId: values.categoria || null,
                tipo: values.tipo === "receita" ? "ENTRADA" : "SAIDA",
                valor: Number(values.valor),
                data: values.data,
                descricao: values.descricao,
            },
            getAuthConfig(),
        );
        return response.data;
    },
};

export default lancamentoFinanceiroService;