import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const loginLogService = {

    listarLogs: async (filtros) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/login-logs`, {
            params: filtros,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },
};

export default loginLogService;
