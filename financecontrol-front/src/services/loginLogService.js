import axios from 'axios';

import { API_URL } from './api';

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
