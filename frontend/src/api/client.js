import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor - adds auth token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401/403, clear the token and redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            // Don't redirect here - let the app handle it
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Register a new user
 * @param {string} email 
 * @param {string} password 
 * @param {string} nickname - Optional, defaults to email prefix
 */
export const register = async (email, password, nickname) => {
    return api.post('/auth/register', { email, password, nickname });
};

/**
 * Login an existing user
 * @param {string} email 
 * @param {string} password 
 */
export const login = async (email, password) => {
    return api.post('/auth/login', { email, password });
};

/**
 * Get current authenticated user
 */
export const getMe = () => 
    api.get('/auth/me');

/**
 * Update current user's profile
 * @param {Object} data - { nickname }
 */
export const updateProfile = (data) =>
    api.put('/auth/me', data);

/**
 * Change password
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export const changePassword = (currentPassword, newPassword) =>
    api.put('/auth/me/password', { currentPassword, newPassword });

/**
 * Logout - clears local storage
 */
export const logout = () => {
    localStorage.removeItem('token');
};

/**
 * Join waitlist (public, no auth required)
 * @param {string} email 
 */
export const joinWaitlist = (email) =>
    api.post('/waitlist', { email });

// ============================================
// GEAR FUNCTIONS
// ============================================

export const getGear = (params) => 
    api.get('/gear', { params });

export const getBackpacks = () => 
    api.get('/gear/backpacks');

// ============================================
// BAG FUNCTIONS
// ============================================

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

// ============================================
// TRIP FUNCTIONS
// ============================================

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
