import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const usuarioService = {
    
    buscarUsuarioPorId: async (id) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/usuario/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    buscarPerfil: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/usuario/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    atualizarUsuario: async (id, dados) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/usuario/${id}`, dados, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },


    deletarUsuario: async (id) =>{
        const token = localStorage.getItem("token");
        const response = await axios.delete(`${API_URL}/usuario/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
};

export default usuarioService;
