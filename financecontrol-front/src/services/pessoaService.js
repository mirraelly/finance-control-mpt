import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const pessoaService = {

    listarPessoasAtivas: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/pessoas/select`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    listarPessoas: async (filtros) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/pessoas`, {
            params: filtros,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    buscarPessoaPorId: async (id) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/pessoas/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    criarPessoa: async (dados) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/pessoas`, dados, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    atualizarPessoa: async (id, dados) => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/pessoas/${id}`, dados, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    alterarAtivo: async (id, ativo) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/pessoas/${id}/ativo`, { ativo }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    listarTiposTelefone: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/tipos/telefone/select`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    listarTiposEmail: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/tipos/email/select`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    listarTiposEndereco: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/tipos/endereco/select`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    buscarCep: async (cep) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/enderecos/cep/${cep}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
};

export default pessoaService;