import axios from "axios";

// Creamos una instancia de Axios que envía cookies en cada petición
const axiosClient = axios.create({
  baseURL: "https://tulocaltunego.com/api", // URL fija
  withCredentials: true, // ¡IMPORTANTE! para enviar y recibir cookies
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  },
});

export default axiosClient;
