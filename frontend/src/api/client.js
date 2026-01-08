import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// auth
export const register = (email, password) => 
    api.post('/auth/register', { email, password });

export const login = (email, password) => 
    api.post('/auth/login', { email, password });

export const getMe = () => 
    api.get('/auth/me');

// gear and bags
export const getGear = (params) => 
    api.get('/gear', { params });

export const getBackpacks = () => 
    api.get('/gear/backpacks');

export const getBags = () => 
  api.get('/bags');

export const getBag = (id) => 
  api.get(`/bags/${id}`);

export const createBag = (data) => 
  api.post('/bags', data);

export const updateBag = (id, data) => 
  api.put(`/bags/${id}`, data);

export const deleteBag = (id) => 
  api.delete(`/bags/${id}`);

export const duplicateBag = (id, name) => 
  api.post(`/bags/${id}/duplicate`, { name });

export const addItemToBag = (bagId, gearItemId, quantity = 1) => 
  api.post(`/bags/${bagId}/items`, { gear_item_id: gearItemId, quantity });

export const removeItemFromBag = (bagId, itemId) => 
  api.delete(`/bags/${bagId}/items/${itemId}`);

// trips
export const getTrips = () => 
  api.get('/trips');

export const getTrip = (id) => 
  api.get(`/trips/${id}`);

export const createTrip = (data) => 
  api.post('/trips', data);

export const updateTrip = (id, data) => 
  api.put(`/trips/${id}`, data);

export const deleteTrip = (id) => 
  api.delete(`/trips/${id}`);

export const addBagToTrip = (tripId, bagId, role = 'primary') => 
  api.post(`/trips/${tripId}/bags`, { bag_id: bagId, role });

export const removeBagFromTrip = (tripId, bagId) => 
  api.delete(`/trips/${tripId}/bags/${bagId}`);

export const updateTripStats = (tripId, data) => 
  api.put(`/trips/${tripId}/stats`, data);
