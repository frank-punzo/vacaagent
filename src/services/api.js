import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AWS_CONFIG } from '../config/aws-config';

const api = axios.create({
  baseURL: AWS_CONFIG.api.endpoint,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('idToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      // You can emit an event or use navigation here
    }
    return Promise.reject(error);
  }
);

// Vacation API
export const vacationAPI = {
  getAll: () => api.get('/vacations'),
  getOne: (id) => api.get(`/vacations/${id}`),
  create: (data) => api.post('/vacations', data),
  update: (id, data) => api.put(`/vacations/${id}`, data),
  delete: (id) => api.delete(`/vacations/${id}`),
};

// Events API
export const eventsAPI = {
  getAll: (vacationId) => api.get(`/vacations/${vacationId}/events`),
  create: (vacationId, data) => api.post(`/vacations/${vacationId}/events`, data),
  update: (vacationId, eventId, data) => api.put(`/vacations/${vacationId}/events/${eventId}`, data),
  delete: (vacationId, eventId) => api.delete(`/vacations/${vacationId}/events/${eventId}`),
};

// Excursions API
export const excursionsAPI = {
  getAll: (vacationId) => api.get(`/vacations/${vacationId}/excursions`),
  create: (vacationId, data) => api.post(`/vacations/${vacationId}/excursions`, data),
  update: (vacationId, excursionId, data) => api.put(`/vacations/${vacationId}/excursions/${excursionId}`, data),
  delete: (vacationId, excursionId) => api.delete(`/vacations/${vacationId}/excursions/${excursionId}`),
};

// Members API
export const membersAPI = {
  getAll: (vacationId) => api.get(`/vacations/${vacationId}/members`),
  add: (vacationId, data) => api.post(`/vacations/${vacationId}/members`, data),
  remove: (vacationId, memberId) => api.delete(`/vacations/${vacationId}/members/${memberId}`),
};

// Photos API
export const photosAPI = {
  getAll: (vacationId) => api.get(`/vacations/${vacationId}/photos`),
  upload: (vacationId, data) => api.post(`/vacations/${vacationId}/photos`, data),
  delete: (vacationId, photoId) => api.delete(`/vacations/${vacationId}/photos/${photoId}`),
  getUrl: (vacationId, photoId) => api.get(`/vacations/${vacationId}/photos/${photoId}/url`),
};

// Chat API
export const chatAPI = {
  getMessages: (vacationId) => api.get(`/vacations/${vacationId}/messages`),
  sendMessage: (vacationId, message) => api.post(`/vacations/${vacationId}/messages`, { message }),
  deleteMessage: (vacationId, messageId) => api.delete(`/vacations/${vacationId}/messages/${messageId}`),
};

// Packing List API
export const packingAPI = {
  getList: (vacationId) => api.get(`/vacations/${vacationId}/packing`),
  addItem: (vacationId, data) => api.post(`/vacations/${vacationId}/packing`, data),
  updateItem: (vacationId, itemId, data) => api.put(`/vacations/${vacationId}/packing/${itemId}`, data),
  deleteItem: (vacationId, itemId) => api.delete(`/vacations/${vacationId}/packing/${itemId}`),
};

// Itinerary API
export const itineraryAPI = {
  get: (vacationId) => api.get(`/vacations/${vacationId}/itinerary`),
  create: (vacationId, data) => api.post(`/vacations/${vacationId}/itinerary`, data),
  update: (vacationId, itineraryId, data) => api.put(`/vacations/${vacationId}/itinerary/${itineraryId}`, data),
};

// Recommendations API
export const recommendationsAPI = {
  get: (vacationId) => api.get(`/vacations/${vacationId}/recommendations`),
};

export default api;
