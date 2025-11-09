import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/analyze-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getSuggestions = async (analysisData) => {
  const response = await api.post('/get-suggestions', analysisData);
  return response.data;
};

export const getWeather = async () => {
  const response = await api.get('/get-weather');
  return response.data;
};

export const getDroneData = async () => {
  const response = await api.get('/get-drone-data');
  return response.data;
};
