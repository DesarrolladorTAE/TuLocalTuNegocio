// src/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://tulocaltunego.com/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // 👈 importante
});

export default axiosClient;
