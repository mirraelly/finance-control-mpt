import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const usuarioService = {
    
    buscarUsuarioPorId: async (id) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/usuarios/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    atualizarUsuario: async (id, dados) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/usuarios/${id}`, dados, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
};

export default usuarioService;