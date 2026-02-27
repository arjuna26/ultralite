import { getToken } from './storage';

const BASE_URL = 'https://api.ultralite.app/api';

async function request(method, path, body = null, params = null) {
  const token = await getToken();

  let url = `${BASE_URL}${path}`;
  if (params) {
    const filtered = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    if (filtered.length) url += `?${filtered.join('&')}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get: (path, params) => request('GET', path, null, params),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

// ── Auth ───────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (email, password, nickname) =>
  api.post('/auth/register', { email, password, nickname });

export const getMe = () => api.get('/auth/me');

export const updateProfile = (data) => api.put('/auth/me', data);

export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/me/password', { currentPassword, newPassword });

// ── Gear ───────────────────────────────────────────────────────────────────────
export const getGear = (params) => api.get('/gear', params);

export const getBackpacks = () => api.get('/gear/backpacks');

export const getUserOwnedGear = () => api.get('/gear/owned');

export const toggleGearOwnership = (id) => api.post(`/gear/${id}/toggle-owned`);

export const createCustomGear = (data) => api.post('/gear/custom', data);

export const updateCustomGear = (id, data) => api.put(`/gear/custom/${id}`, data);

export const deleteCustomGear = (id) => api.delete(`/gear/custom/${id}`);

// ── Bags ───────────────────────────────────────────────────────────────────────
export const getBags = () => api.get('/bags');

export const getBag = (id) => api.get(`/bags/${id}`);

export const createBag = (data) => api.post('/bags', data);

export const updateBag = (id, data) => api.put(`/bags/${id}`, data);

export const deleteBag = (id) => api.delete(`/bags/${id}`);

export const duplicateBag = (id, name) =>
  api.post(`/bags/${id}/duplicate`, { name });

export const addItemToBag = (bagId, gearItemId, quantity = 1) =>
  api.post(`/bags/${bagId}/items`, { gear_item_id: gearItemId, quantity });

export const removeItemFromBag = (bagId, itemId) =>
  api.delete(`/bags/${bagId}/items/${itemId}`);

// ── Trips ──────────────────────────────────────────────────────────────────────
export const getTrips = () => api.get('/trips');

export const getTrip = (id) => api.get(`/trips/${id}`);

export const createTrip = (data) => api.post('/trips', data);

export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);

export const addBagToTrip = (tripId, bagId, role = 'primary') =>
  api.post(`/trips/${tripId}/bags`, { bag_id: bagId, role });

export const removeBagFromTrip = (tripId, bagId) =>
  api.delete(`/trips/${tripId}/bags/${bagId}`);

export const updateTripStats = (tripId, data) =>
  api.put(`/trips/${tripId}/stats`, data);
