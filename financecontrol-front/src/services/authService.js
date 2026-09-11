import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

const authService = {
    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData)
        return response.data;
    },
};

export default authService;
