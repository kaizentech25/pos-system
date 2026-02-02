import axios from "axios";

// Determine base URL based on environment
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;