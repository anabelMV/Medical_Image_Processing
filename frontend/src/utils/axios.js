// src/utils/axios.js
import axios from "axios";

// Puedes usar la variable de entorno REACT_APP_API_URL o el proxy configurado en package.json
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  
});


api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export default api;
