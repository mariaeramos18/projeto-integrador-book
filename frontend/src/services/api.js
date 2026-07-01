import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Para emulador Android: 10.0.2.2 é o IP da máquina host.
// Se estiver usando um dispositivo físico, use o IP da sua rede local.
const api = axios.create({
  baseURL: 'http://10.0.2.2:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adiciona o token JWT em todas as requisições automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;